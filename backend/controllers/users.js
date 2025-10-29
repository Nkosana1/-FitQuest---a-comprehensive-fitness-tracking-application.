const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');

// @desc    Get all users (admin only)
// @route   GET /api/v1/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find().select('-password');

  res.status(200).json({
    success: true,
    count: users.length,
    data: users
  });
});

// @desc    Get single user
// @route   GET /api/v1/users/:id
// @access  Public
const getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Check privacy settings
  const isOwnProfile = req.user && req.user._id.toString() === user._id.toString();
  const isPublic = user.preferences.privacy.profileVisibility === 'public';
  
  if (!isOwnProfile && !isPublic) {
    return next(new AppError('Profile is private', 403));
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Get current user profile
// @route   GET /api/v1/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update user profile
// @route   PUT /api/v1/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {};

  // Only allow certain fields to be updated
  const allowedFields = ['profile', 'preferences'];
  
  allowedFields.forEach(field => {
    if (req.body[field]) {
      fieldsToUpdate[field] = req.body[field];
    }
  });

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: user
  });
});

// @desc    Update user (admin only)
// @route   PUT /api/v1/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: user
  });
});

// @desc    Delete user (admin only)
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'User deleted successfully'
  });
});

// @desc    Search users
// @route   GET /api/v1/users/search
// @access  Private
const searchUsers = asyncHandler(async (req, res, next) => {
  const { q, page = 1, limit = 20 } = req.query;

  if (!q) {
    return next(new AppError('Search query is required', 400));
  }

  const skip = (page - 1) * limit;

  const users = await User.find({
    $or: [
      { username: { $regex: q, $options: 'i' } },
      { 'profile.firstName': { $regex: q, $options: 'i' } },
      { 'profile.lastName': { $regex: q, $options: 'i' } }
    ],
    'preferences.privacy.profileVisibility': { $ne: 'private' }
  })
  .select('username profile.firstName profile.lastName profile.profilePicture stats.totalWorkouts')
  .skip(skip)
  .limit(parseInt(limit))
  .sort({ 'stats.totalWorkouts': -1 });

  const total = await User.countDocuments({
    $or: [
      { username: { $regex: q, $options: 'i' } },
      { 'profile.firstName': { $regex: q, $options: 'i' } },
      { 'profile.lastName': { $regex: q, $options: 'i' } }
    ],
    'preferences.privacy.profileVisibility': { $ne: 'private' }
  });

  res.status(200).json({
    success: true,
    data: {
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    }
  });
});

module.exports = {
  getUsers,
  getUser,
  getUserProfile,
  updateUserProfile,
  updateUser,
  deleteUser,
  searchUsers
};
