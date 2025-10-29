const express = require('express');
const {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  verifyEmail,
  updateDetails,
  updatePassword
} = require('../controllers/auth');
const { protect } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.'
});

// Auth routes
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.post('/forgot-password', authLimiter, forgotPassword);
router.put('/reset-password/:resettoken', authLimiter, resetPassword);
router.post('/verify-email/:token', verifyEmail);
router.put('/update-details', protect, updateDetails);
router.put('/update-password', protect, updatePassword);

module.exports = router;
