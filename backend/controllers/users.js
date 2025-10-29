const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');

// @desc    Get all users (admin only)
// @route   GET /api/users
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
// @route   GET /api/users/:id
// @access  Public
const getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id)
    .populate('followers', 'username profilePic')
    .populate('following', 'username profilePic');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Check privacy settings
  const isOwnProfile = req.user && req.user._id.toString() === user._id.toString();
  const isPublic = user.preferences?.privacy?.profileVisibility === 'public';
  
  if (!isOwnProfile && !isPublic) {
    return next(new AppError('Profile is private', 403));
  }

  // Add follow status if user is authenticated
  let isFollowing = false;
  if (req.user && !isOwnProfile) {
    isFollowing = user.followers.some(follower => 
      follower._id.toString() === req.user._id.toString()
    );
  }

  res.status(200).json({
    success: true,
    data: {
      ...user.toObject(),
      isFollowing,
      followersCount: user.followers.length,
      followingCount: user.following.length
    }
  });
});

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id)
    .populate('followers', 'username profilePic')
    .populate('following', 'username profilePic');

  res.status(200).json({
    success: true,
    data: {
      ...user.toObject(),
      followersCount: user.followers.length,
      followingCount: user.following.length
    }
  });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {};

  // Only allow certain fields to be updated
  const allowedFields = ['username', 'bio', 'profilePic', 'profile', 'preferences'];
  
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
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

// @desc    Follow/Unfollow user
// @route   POST /api/users/:id/follow
// @access  Private
const followUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  
  if (id === req.user.id) {
    return next(new AppError('You cannot follow yourself', 400));
  }

  const userToFollow = await User.findById(id);
  const currentUser = await User.findById(req.user.id);

  if (!userToFollow) {
    return next(new AppError('User not found', 404));
  }

  const isFollowing = currentUser.following.includes(id);

  if (isFollowing) {
    // Unfollow
    currentUser.following.pull(id);
    userToFollow.followers.pull(req.user.id);
    
    await currentUser.save();
    await userToFollow.save();

    res.status(200).json({
      success: true,
      message: 'User unfollowed successfully',
      data: {
        following: false,
        followersCount: userToFollow.followers.length
      }
    });
  } else {
    // Follow
    currentUser.following.push(id);
    userToFollow.followers.push(req.user.id);
    
    await currentUser.save();
    await userToFollow.save();

    res.status(200).json({
      success: true,
      message: 'User followed successfully',
      data: {
        following: true,
        followersCount: userToFollow.followers.length
      }
    });
  }
});

// @desc    Get user's followers
// @route   GET /api/users/:id/followers
// @access  Private
const getFollowers = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  const user = await User.findById(req.params.id)
    .populate({
      path: 'followers',
      select: 'username profilePic bio stats.totalWorkouts',
      options: {
        skip,
        limit: parseInt(limit),
        sort: { 'stats.totalWorkouts': -1 }
      }
    });

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Check if current user can view followers
  const isOwnProfile = req.user._id.toString() === user._id.toString();
  const isPublic = user.preferences?.privacy?.profileVisibility === 'public';
  
  if (!isOwnProfile && !isPublic) {
    return next(new AppError('Cannot view followers of private profile', 403));
  }

  const total = user.followers.length;

  res.status(200).json({
    success: true,
    count: user.followers.length,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      total,
      hasNext: page * limit < total,
      hasPrev: page > 1
    },
    data: user.followers
  });
});

// @desc    Get user's following
// @route   GET /api/users/:id/following
// @access  Private
const getFollowing = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  const user = await User.findById(req.params.id)
    .populate({
      path: 'following',
      select: 'username profilePic bio stats.totalWorkouts',
      options: {
        skip,
        limit: parseInt(limit),
        sort: { 'stats.totalWorkouts': -1 }
      }
    });

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Check if current user can view following
  const isOwnProfile = req.user._id.toString() === user._id.toString();
  const isPublic = user.preferences?.privacy?.profileVisibility === 'public';
  
  if (!isOwnProfile && !isPublic) {
    return next(new AppError('Cannot view following of private profile', 403));
  }

  const total = user.following.length;

  res.status(200).json({
    success: true,
    count: user.following.length,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      total,
      hasNext: page * limit < total,
      hasPrev: page > 1
    },
    data: user.following
  });
});

// @desc    Update user (admin only)
// @route   PUT /api/users/:id
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
// @route   DELETE /api/users/:id
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
// @route   GET /api/users/search
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
    'preferences.privacy.profileVisibility': { $ne: 'private' },
    _id: { $ne: req.user.id } // Exclude current user from search results
  })
  .select('username profilePic bio profile.firstName profile.lastName stats.totalWorkouts followers')
  .skip(skip)
  .limit(parseInt(limit))
  .sort({ 'stats.totalWorkouts': -1 });

  // Add follow status for each user
  const usersWithFollowStatus = users.map(user => {
    const isFollowing = user.followers.includes(req.user.id);
    return {
      ...user.toObject(),
      isFollowing,
      followersCount: user.followers.length
    };
  });

  const total = await User.countDocuments({
    $or: [
      { username: { $regex: q, $options: 'i' } },
      { 'profile.firstName': { $regex: q, $options: 'i' } },
      { 'profile.lastName': { $regex: q, $options: 'i' } }
    ],
    'preferences.privacy.profileVisibility': { $ne: 'private' },
    _id: { $ne: req.user.id }
  });

  res.status(200).json({
    success: true,
    data: {
      users: usersWithFollowStatus,
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

// @desc    Get suggested users to follow
// @route   GET /api/users/suggestions
// @access  Private
const getSuggestedUsers = asyncHandler(async (req, res, next) => {
  const { limit = 10 } = req.query;
  
  const currentUser = await User.findById(req.user.id);
  
  // Find users that current user is not following
  const suggestions = await User.find({
    _id: { 
      $ne: req.user.id,
      $nin: currentUser.following
    },
    'preferences.privacy.profileVisibility': 'public'
  })
  .select('username profilePic bio stats.totalWorkouts followers')
  .sort({ 'stats.totalWorkouts': -1, followers: -1 })
  .limit(parseInt(limit));

  // Add follow status (should be false for all suggestions)
  const suggestionsWithStatus = suggestions.map(user => ({
    ...user.toObject(),
    isFollowing: false,
    followersCount: user.followers.length
  }));

  res.status(200).json({
    success: true,
    count: suggestionsWithStatus.length,
    data: suggestionsWithStatus
  });
});

module.exports = {
  getUsers,
  getUser,
  getUserProfile,
  updateUserProfile,
  followUser,
  getFollowers,
  getFollowing,
  updateUser,
  deleteUser,
  searchUsers,
  getSuggestedUsers
};