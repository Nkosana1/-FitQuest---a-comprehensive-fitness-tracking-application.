const crypto = require('crypto');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/sendEmail');

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
const register = asyncHandler(async (req, res, next) => {
  const { username, email, password, firstName, lastName, dateOfBirth, gender } = req.body;

  // Create user
  const user = await User.create({
    username,
    email,
    password,
    profile: {
      firstName,
      lastName,
      dateOfBirth,
      gender
    }
  });

  // Generate email verification token
  const verificationToken = user.getEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  // Create verification URL
  const verificationUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/verify-email/${verificationToken}`;

  const message = `
    Welcome to FitQuest! Please verify your email by clicking on this link: 
    ${verificationUrl}
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: 'FitQuest Email Verification',
      message
    });

    sendTokenResponse(user, 201, res, 'User registered successfully. Please check your email for verification.');
  } catch (err) {
    console.error('Email send error:', err);
    user.verificationToken = undefined;
    await user.save({ validateBeforeSave: false });

    // Still send success response but mention email issue
    sendTokenResponse(user, 201, res, 'User registered successfully. Email verification failed to send.');
  }
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return next(new AppError('Please provide an email and password', 400));
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new AppError('Invalid credentials', 401));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new AppError('Invalid credentials', 401));
  }

  // Check if user is active
  if (!user.isActive) {
    return next(new AppError('Account is deactivated', 403));
  }

  // Update last login
  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res, 'Login successful');
});

// @desc    Logout user / clear cookie
// @route   POST /api/v1/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update user details
// @route   PUT /api/v1/auth/update-details
// @access  Private
const updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    username: req.body.username,
    email: req.body.email,
    profile: req.body.profile,
    preferences: req.body.preferences
  };

  // Remove undefined fields
  Object.keys(fieldsToUpdate).forEach(key => {
    if (fieldsToUpdate[key] === undefined) {
      delete fieldsToUpdate[key];
    }
  });

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    message: 'User details updated successfully',
    data: user
  });
});

// @desc    Update password
// @route   PUT /api/v1/auth/update-password
// @access  Private
const updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new AppError('Password is incorrect', 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res, 'Password updated successfully');
});

// @desc    Forgot password
// @route   POST /api/v1/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('There is no user with that email', 404));
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // Create reset url
  const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/reset-password/${resetToken}`;

  const message = `
    You are receiving this email because you (or someone else) has requested the reset of a password. 
    Please make a PUT request to: ${resetUrl}
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: 'FitQuest Password Reset Token',
      message
    });

    res.status(200).json({
      success: true,
      message: 'Password reset email sent'
    });
  } catch (err) {
    console.error('Email send error:', err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('Email could not be sent', 500));
  }
});

// @desc    Reset password
// @route   PUT /api/v1/auth/reset-password/:resettoken
// @access  Public
const resetPassword = asyncHandler(async (req, res, next) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    return next(new AppError('Invalid token', 400));
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  sendTokenResponse(user, 200, res, 'Password reset successful');
});

// @desc    Verify email
// @route   POST /api/v1/auth/verify-email/:token
// @access  Public
const verifyEmail = asyncHandler(async (req, res, next) => {
  // Get hashed token
  const verificationToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    verificationToken
  });

  if (!user) {
    return next(new AppError('Invalid verification token', 400));
  }

  // Verify user
  user.isVerified = true;
  user.verificationToken = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: 'Email verified successfully'
  });
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res, message) => {
  // Create token
  const token = user.getSignedJwtToken();

  res.status(statusCode).json({
    success: true,
    message,
    data: {
      token,
      user
    }
  });
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateDetails,
  updatePassword,
  forgotPassword,
  resetPassword,
  verifyEmail
};
