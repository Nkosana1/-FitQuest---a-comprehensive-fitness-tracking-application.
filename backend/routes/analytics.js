const express = require('express');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Placeholder routes - to be implemented
router.get('/dashboard', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Analytics dashboard endpoint - coming soon',
    data: {}
  });
});

router.get('/progress/:exerciseId', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Exercise progress endpoint - coming soon',
    data: {}
  });
});

module.exports = router;
