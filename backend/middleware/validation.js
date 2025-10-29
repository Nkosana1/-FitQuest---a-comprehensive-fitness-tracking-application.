const { body, param, query, validationResult } = require('express-validator');
const AppError = require('../utils/appError');

// Middleware to check validation results
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.param,
      message: error.msg,
      value: error.value
    }));
    
    return next(new AppError('Validation failed', 400, { errors: errorMessages }));
  }
  next();
};

// User validation rules
const validateUserRegistration = [
  body('username')
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  handleValidationErrors
];

const validateUserLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

const validateUserProfileUpdate = [
  body('username')
    .optional()
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
  
  body('profile.firstName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),
  
  body('profile.lastName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),
  
  body('profile.weight')
    .optional()
    .isFloat({ min: 20, max: 500 })
    .withMessage('Weight must be between 20 and 500 kg'),
  
  body('profile.height')
    .optional()
    .isFloat({ min: 50, max: 300 })
    .withMessage('Height must be between 50 and 300 cm'),
  
  handleValidationErrors
];

// Workout validation rules
const validateWorkoutCreation = [
  body('title')
    .notEmpty()
    .withMessage('Workout title is required')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  
  body('difficulty')
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Difficulty must be beginner, intermediate, or advanced'),
  
  body('category')
    .optional()
    .isIn(['strength', 'cardio', 'flexibility', 'sports', 'mixed'])
    .withMessage('Invalid category'),
  
  body('duration')
    .optional()
    .isInt({ min: 1, max: 300 })
    .withMessage('Duration must be between 1 and 300 minutes'),
  
  body('exercises')
    .isArray({ min: 1 })
    .withMessage('At least one exercise is required'),
  
  body('exercises.*.exercise')
    .isMongoId()
    .withMessage('Valid exercise ID is required'),
  
  body('exercises.*.sets')
    .isInt({ min: 1 })
    .withMessage('Sets must be at least 1'),
  
  body('exercises.*.order')
    .isInt({ min: 1 })
    .withMessage('Exercise order must be at least 1'),
  
  handleValidationErrors
];

// Exercise validation rules
const validateExerciseCreation = [
  body('name')
    .notEmpty()
    .withMessage('Exercise name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  
  body('description')
    .notEmpty()
    .withMessage('Exercise description is required')
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  
  body('muscleGroup')
    .isArray({ min: 1 })
    .withMessage('At least one muscle group is required'),
  
  body('muscleGroup.*')
    .isIn(['chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms', 'abs', 'obliques', 'quads', 'hamstrings', 'calves', 'glutes', 'full_body'])
    .withMessage('Invalid muscle group'),
  
  body('equipment')
    .isArray({ min: 1 })
    .withMessage('At least one equipment type is required'),
  
  body('equipment.*')
    .isIn(['dumbbells', 'barbell', 'kettlebell', 'resistance_bands', 'pull_up_bar', 'bench', 'treadmill', 'stationary_bike', 'rowing_machine', 'bodyweight', 'cable_machine', 'smith_machine', 'other'])
    .withMessage('Invalid equipment type'),
  
  body('category')
    .isIn(['strength', 'cardio', 'flexibility', 'balance', 'plyometric', 'sports'])
    .withMessage('Invalid category'),
  
  body('difficulty')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Difficulty must be beginner, intermediate, or advanced'),
  
  handleValidationErrors
];

// Workout log validation rules
const validateWorkoutLog = [
  body('workoutId')
    .optional()
    .isMongoId()
    .withMessage('Valid workout ID is required'),
  
  body('duration')
    .isInt({ min: 1 })
    .withMessage('Duration must be at least 1 minute'),
  
  body('exercisesCompleted')
    .isArray({ min: 1 })
    .withMessage('At least one exercise must be completed'),
  
  body('exercisesCompleted.*.exercise')
    .isMongoId()
    .withMessage('Valid exercise ID is required'),
  
  body('exercisesCompleted.*.sets')
    .isArray({ min: 1 })
    .withMessage('At least one set is required'),
  
  body('exercisesCompleted.*.sets.*.setNumber')
    .isInt({ min: 1 })
    .withMessage('Set number must be at least 1'),
  
  body('exercisesCompleted.*.sets.*.reps')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Reps cannot be negative'),
  
  body('exercisesCompleted.*.sets.*.weight')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Weight cannot be negative'),
  
  body('bodyWeight')
    .optional()
    .isFloat({ min: 20, max: 500 })
    .withMessage('Body weight must be between 20 and 500 kg'),
  
  handleValidationErrors
];

// Progress entry validation rules
const validateProgressEntry = [
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be in valid ISO format'),
  
  body('weight')
    .optional()
    .isFloat({ min: 20, max: 500 })
    .withMessage('Weight must be between 20 and 500 kg'),
  
  body('bodyFatPercentage')
    .optional()
    .isFloat({ min: 0, max: 60 })
    .withMessage('Body fat percentage must be between 0 and 60'),
  
  body('bodyMeasurements.chest')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Chest measurement cannot be negative'),
  
  body('bodyMeasurements.waist')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Waist measurement cannot be negative'),
  
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
  
  handleValidationErrors
];

// Personal record validation rules
const validatePersonalRecord = [
  body('exerciseId')
    .isMongoId()
    .withMessage('Valid exercise ID is required'),
  
  body('recordType')
    .isIn(['max_weight', 'max_reps', 'max_volume', 'one_rep_max', 'max_duration', 'max_distance'])
    .withMessage('Invalid record type'),
  
  body('weight')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Weight cannot be negative'),
  
  body('reps')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Reps cannot be negative'),
  
  body('duration')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Duration cannot be negative'),
  
  body('dateAchieved')
    .optional()
    .isISO8601()
    .withMessage('Date must be in valid ISO format'),
  
  handleValidationErrors
];

// Common validation rules
const validateObjectId = (field = 'id') => [
  param(field)
    .isMongoId()
    .withMessage(`Valid ${field} is required`),
  
  handleValidationErrors
];

const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  handleValidationErrors
];

const validateSearch = [
  query('q')
    .notEmpty()
    .withMessage('Search query is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Search query must be between 2 and 100 characters'),
  
  handleValidationErrors
];

const validateRating = [
  body('rating')
    .isFloat({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  
  handleValidationErrors
];

// Date range validation
const validateDateRange = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be in valid ISO format'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be in valid ISO format'),
  
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateUserProfileUpdate,
  validateWorkoutCreation,
  validateExerciseCreation,
  validateWorkoutLog,
  validateProgressEntry,
  validatePersonalRecord,
  validateObjectId,
  validatePagination,
  validateSearch,
  validateRating,
  validateDateRange
};
