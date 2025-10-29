const express = require('express');
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  searchUsers,
  getUserProfile,
  updateUserProfile,
  followUser,
  getFollowers,
  getFollowing,
  getSuggestedUsers
} = require('../controllers/users');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { 
  validateUserProfileUpdate, 
  validateObjectId, 
  validatePagination, 
  validateSearch 
} = require('../middleware/validation');
const { uploadProfilePicture, handleMulterError, validateFile } = require('../middleware/upload');

const router = express.Router();

// Public routes with optional auth
router.get('/:id', validateObjectId('id'), optionalAuth, getUser);
router.get('/:id/followers', validateObjectId('id'), validatePagination, protect, getFollowers);
router.get('/:id/following', validateObjectId('id'), validatePagination, protect, getFollowing);

// Protected routes
router.use(protect);

// User profile routes
router.get('/profile', getUserProfile);
router.put('/profile', validateUserProfileUpdate, updateUserProfile);

// Profile picture upload
router.post('/profile/photo', uploadProfilePicture, handleMulterError, validateFile, (req, res, next) => {
  // This would typically upload to cloudinary and update user profile
  res.status(200).json({
    success: true,
    message: 'Profile picture upload endpoint - implementation needed',
    data: { filename: req.file?.originalname }
  });
});

// Social features
router.post('/:id/follow', validateObjectId('id'), followUser);

// User discovery
router.get('/search', validateSearch, validatePagination, searchUsers);
router.get('/suggestions', validatePagination, getSuggestedUsers);

// Admin only routes
router.use(authorize('admin'));
router.get('/', validatePagination, getUsers);
router.put('/:id', validateObjectId('id'), updateUser);
router.delete('/:id', validateObjectId('id'), deleteUser);

module.exports = router;
