const express = require('express');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Placeholder routes - to be implemented
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Notifications endpoint - coming soon',
    data: []
  });
});

router.put('/:id/read', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Mark notification as read endpoint - coming soon'
  });
});

router.put('/mark-all-read', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Mark all notifications as read endpoint - coming soon'
  });
});

module.exports = router;
