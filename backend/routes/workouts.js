const express = require('express');
const {
  getWorkouts,
  getWorkout,
  createWorkout,
  updateWorkout,
  deleteWorkout,
  duplicateWorkout,
  toggleLike,
  rateWorkout,
  getPopularWorkouts,
  getWorkoutAnalytics
} = require('../controllers/workouts');
const { protect, optionalAuth } = require('../middleware/auth');
const { 
  validateWorkoutCreation, 
  validateObjectId, 
  validatePagination, 
  validateRating 
} = require('../middleware/validation');

const router = express.Router();

// Public routes
router.get('/popular', validatePagination, optionalAuth, getPopularWorkouts);
router.get('/:id', validateObjectId('id'), optionalAuth, getWorkout);

// Protected routes
router.use(protect);

// Main workout routes
router.route('/')
  .get(validatePagination, getWorkouts)
  .post(validateWorkoutCreation, createWorkout);

router.route('/:id')
  .put(validateObjectId('id'), validateWorkoutCreation, updateWorkout)
  .delete(validateObjectId('id'), deleteWorkout);

// Workout actions
router.post('/:id/duplicate', validateObjectId('id'), duplicateWorkout);
router.post('/:id/like', validateObjectId('id'), toggleLike);
router.post('/:id/rate', validateObjectId('id'), validateRating, rateWorkout);

// Workout analytics (creator only)
router.get('/:id/analytics', validateObjectId('id'), getWorkoutAnalytics);

module.exports = router;
