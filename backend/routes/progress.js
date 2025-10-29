const express = require('express');
const {
  getProgressEntries,
  getProgressEntry,
  addProgressEntry,
  updateProgressEntry,
  deleteProgressEntry,
  getProgressAnalytics,
  getProgressCharts,
  getGoalProgress,
  updateGoals,
  getMilestones,
  getBodyComposition
} = require('../controllers/progress');
const { protect } = require('../middleware/auth');
const { 
  validateProgressEntry, 
  validateObjectId, 
  validatePagination, 
  validateDateRange 
} = require('../middleware/validation');
const { uploadProgressPhotos, handleMulterError, validateFile } = require('../middleware/upload');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Progress analytics and charts
router.get('/analytics', getProgressAnalytics);
router.get('/charts', getProgressCharts);
router.get('/composition', validateDateRange, getBodyComposition);

// Goal management
router.get('/goals', getGoalProgress);
router.put('/goals', updateGoals);

// Milestones
router.get('/milestones', validatePagination, getMilestones);

// Main progress routes
router.route('/')
  .get(validatePagination, validateDateRange, getProgressEntries)
  .post(validateProgressEntry, addProgressEntry);

router.route('/:id')
  .get(validateObjectId('id'), getProgressEntry)
  .put(validateObjectId('id'), validateProgressEntry, updateProgressEntry)
  .delete(validateObjectId('id'), deleteProgressEntry);

// Progress photos upload
router.post('/:id/photos', 
  validateObjectId('id'), 
  uploadProgressPhotos, 
  handleMulterError, 
  validateFile, 
  (req, res, next) => {
    // This would typically upload to cloudinary and update progress entry
    res.status(200).json({
      success: true,
      message: 'Progress photos upload endpoint - implementation needed',
      data: { 
        photos: req.files?.length || 0
      }
    });
  }
);

module.exports = router;
