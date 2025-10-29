const express = require('express');
const {
  getWorkoutLogs,
  getWorkoutLog,
  logWorkout,
  updateWorkoutLog,
  deleteWorkoutLog,
  getWorkoutHistory,
  getExerciseHistory,
  getWorkoutStats
} = require('../controllers/logs');
const { protect } = require('../middleware/auth');
const { 
  validateWorkoutLog, 
  validateObjectId, 
  validatePagination, 
  validateDateRange 
} = require('../middleware/validation');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Workout statistics
router.get('/stats', validateDateRange, getWorkoutStats);

// Main workout log routes
router.route('/')
  .get(validatePagination, validateDateRange, getWorkoutLogs)
  .post(validateWorkoutLog, logWorkout);

router.route('/:id')
  .get(validateObjectId('id'), getWorkoutLog)
  .put(validateObjectId('id'), validateWorkoutLog, updateWorkoutLog)
  .delete(validateObjectId('id'), deleteWorkoutLog);

// Specific workout and exercise history
router.get('/workout/:workoutId', 
  validateObjectId('workoutId'), 
  validatePagination, 
  getWorkoutHistory
);

router.get('/exercise/:exerciseId', 
  validateObjectId('exerciseId'), 
  validatePagination, 
  validateDateRange,
  getExerciseHistory
);

module.exports = router;
