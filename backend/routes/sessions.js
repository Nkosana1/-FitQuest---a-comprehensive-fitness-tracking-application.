const express = require('express');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Placeholder routes - to be implemented
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Workout sessions endpoint - coming soon',
    data: []
  });
});

router.get('/:id', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Session detail endpoint - coming soon',
    data: {}
  });
});

router.post('/', (req, res) => {
  res.status(201).json({
    success: true,
    message: 'Create session endpoint - coming soon',
    data: {}
  });
});

module.exports = router;
