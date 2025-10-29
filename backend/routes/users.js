const express = require('express');
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  searchUsers,
  getUserProfile,
  updateUserProfile
} = require('../controllers/users');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// All routes after this middleware use protect middleware
router.use(protect);

// User profile routes
router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);

// User management routes
router.get('/search', searchUsers);
router.get('/:id', optionalAuth, getUser);

// Admin only routes
router.use(authorize('admin'));
router.get('/', getUsers);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
