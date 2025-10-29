const express = require('express');
const {
  getPersonalRecords,
  getPersonalRecord,
  addPersonalRecord,
  updatePersonalRecord,
  deletePersonalRecord,
  getExerciseRecords,
  getRecentRecords,
  getRecordsSummary,
  getExerciseLeaderboard,
  getStrengthStandards,
  getRecordProgress
} = require('../controllers/records');
const { protect } = require('../middleware/auth');
const { 
  validatePersonalRecord, 
  validateObjectId, 
  validatePagination 
} = require('../middleware/validation');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Records summary and analytics
router.get('/summary', getRecordsSummary);
router.get('/recent', validatePagination, getRecentRecords);

// Exercise-specific records
router.get('/exercise/:exerciseId', 
  validateObjectId('exerciseId'), 
  getExerciseRecords
);

router.get('/exercise/:exerciseId/progress', 
  validateObjectId('exerciseId'), 
  getRecordProgress
);

router.get('/exercise/:exerciseId/leaderboard', 
  validateObjectId('exerciseId'), 
  validatePagination,
  getExerciseLeaderboard
);

router.get('/exercise/:exerciseId/standards', 
  validateObjectId('exerciseId'), 
  getStrengthStandards
);

// Main personal records routes
router.route('/')
  .get(validatePagination, getPersonalRecords)
  .post(validatePersonalRecord, addPersonalRecord);

router.route('/:id')
  .get(validateObjectId('id'), getPersonalRecord)
  .put(validateObjectId('id'), validatePersonalRecord, updatePersonalRecord)
  .delete(validateObjectId('id'), deletePersonalRecord);

module.exports = router;
