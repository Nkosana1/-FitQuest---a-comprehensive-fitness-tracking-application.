const express = require('express');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Placeholder routes - to be implemented
router.post('/profile-picture', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Profile picture upload endpoint - coming soon',
    data: {}
  });
});

router.post('/exercise-media', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Exercise media upload endpoint - coming soon',
    data: {}
  });
});

module.exports = router;
