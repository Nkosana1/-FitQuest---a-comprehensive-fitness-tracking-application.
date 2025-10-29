const express = require('express');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Placeholder routes - to be implemented
router.get('/feed', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Social feed endpoint - coming soon',
    data: []
  });
});

router.post('/follow/:userId', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Follow user endpoint - coming soon',
    data: {}
  });
});

router.get('/followers', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Followers endpoint - coming soon',
    data: []
  });
});

module.exports = router;
