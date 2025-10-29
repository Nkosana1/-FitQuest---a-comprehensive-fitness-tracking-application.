const express = require('express');
const {
  getExercises,
  getExercise,
  createExercise,
  updateExercise,
  deleteExercise,
  getExercisesByMuscleGroup,
  searchExercises,
  getPopularExercises,
  rateExercise,
  getExerciseFilters,
  getExerciseVariations,
  addExerciseVariation
} = require('../controllers/exercises');
const { protect, optionalAuth } = require('../middleware/auth');
const { 
  validateExerciseCreation, 
  validateObjectId, 
  validatePagination, 
  validateSearch,
  validateRating 
} = require('../middleware/validation');
const { uploadExerciseMedia, handleMulterError, validateFile } = require('../middleware/upload');

const router = express.Router();

// Public routes
router.get('/filters', getExerciseFilters);
router.get('/popular', validatePagination, getPopularExercises);
router.get('/search', validateSearch, validatePagination, optionalAuth, searchExercises);
router.get('/muscle/:muscleGroup', validatePagination, optionalAuth, getExercisesByMuscleGroup);
router.get('/:id', validateObjectId('id'), optionalAuth, getExercise);
router.get('/:id/variations', validateObjectId('id'), optionalAuth, getExerciseVariations);

// Protected routes
router.use(protect);

// Main exercise routes
router.route('/')
  .get(validatePagination, getExercises)
  .post(validateExerciseCreation, createExercise);

router.route('/:id')
  .put(validateObjectId('id'), validateExerciseCreation, updateExercise)
  .delete(validateObjectId('id'), deleteExercise);

// Exercise actions
router.post('/:id/rate', validateObjectId('id'), validateRating, rateExercise);
router.post('/:id/variations', validateObjectId('id'), addExerciseVariation);

// Exercise media upload
router.post('/:id/media', 
  validateObjectId('id'), 
  uploadExerciseMedia, 
  handleMulterError, 
  validateFile, 
  (req, res, next) => {
    // This would typically upload to cloudinary and update exercise
    res.status(200).json({
      success: true,
      message: 'Exercise media upload endpoint - implementation needed',
      data: { 
        images: req.files?.images?.length || 0,
        videos: req.files?.videos?.length || 0
      }
    });
  }
);

module.exports = router;
