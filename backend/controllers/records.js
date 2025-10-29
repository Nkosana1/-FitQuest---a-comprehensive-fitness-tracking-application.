const PersonalRecord = require('../models/PersonalRecord');
const Exercise = require('../models/Exercise');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');

// @desc    Get user's personal records
// @route   GET /api/records
// @access  Private
const getPersonalRecords = asyncHandler(async (req, res, next) => {
  const { 
    page = 1, 
    limit = 50, 
    exerciseId, 
    recordType, 
    category,
    sort = '-dateAchieved'
  } = req.query;

  const skip = (page - 1) * limit;
  
  // Build query
  const query = { userId: req.user.id };
  
  if (exerciseId) query.exerciseId = exerciseId;
  if (recordType) query.recordType = recordType;
  if (category) query.category = category;
  
  const records = await PersonalRecord.find(query)
    .populate('exerciseId', 'name muscleGroup category equipment')
    .populate('workoutLogId', 'completedAt duration')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));
  
  const total = await PersonalRecord.countDocuments(query);
  
  res.status(200).json({
    success: true,
    count: records.length,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      total,
      hasNext: page * limit < total,
      hasPrev: page > 1
    },
    data: records
  });
});

// @desc    Get single personal record
// @route   GET /api/records/:id
// @access  Private
const getPersonalRecord = asyncHandler(async (req, res, next) => {
  const record = await PersonalRecord.findById(req.params.id)
    .populate('exerciseId', 'name description muscleGroup equipment')
    .populate('workoutLogId', 'completedAt duration notes');
  
  if (!record) {
    return next(new AppError('Personal record not found', 404));
  }
  
  // Check if user owns this record
  if (record.userId.toString() !== req.user.id) {
    return next(new AppError('Not authorized to access this record', 403));
  }
  
  res.status(200).json({
    success: true,
    data: record
  });
});

// @desc    Add personal record
// @route   POST /api/records
// @access  Private
const addPersonalRecord = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.userId = req.user.id;
  
  // Validate exercise exists
  const exercise = await Exercise.findById(req.body.exerciseId);
  if (!exercise) {
    return next(new AppError('Exercise not found', 400));
  }
  
  // Check if record already exists for this exercise and type
  const existingRecord = await PersonalRecord.findOne({
    userId: req.user.id,
    exerciseId: req.body.exerciseId,
    recordType: req.body.recordType
  });
  
  // If record exists, check if new value is better
  if (existingRecord) {
    const newValue = getRecordValue(req.body);
    const existingValue = getRecordValue(existingRecord);
    
    if (newValue <= existingValue) {
      return next(new AppError('New record must be better than existing record', 400));
    }
    
    // Set previous record data
    req.body.previousRecord = {
      value: existingValue,
      date: existingRecord.dateAchieved
    };
    
    // Delete old record
    await PersonalRecord.findByIdAndDelete(existingRecord._id);
  }
  
  const record = await PersonalRecord.create(req.body);
  
  // Populate the created record
  await record.populate('exerciseId', 'name muscleGroup category');
  
  res.status(201).json({
    success: true,
    message: 'Personal record added successfully',
    data: record
  });
});

// @desc    Update personal record
// @route   PUT /api/records/:id
// @access  Private
const updatePersonalRecord = asyncHandler(async (req, res, next) => {
  let record = await PersonalRecord.findById(req.params.id);
  
  if (!record) {
    return next(new AppError('Personal record not found', 404));
  }
  
  // Check if user owns this record
  if (record.userId.toString() !== req.user.id) {
    return next(new AppError('Not authorized to update this record', 403));
  }
  
  record = await PersonalRecord.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).populate('exerciseId', 'name muscleGroup category');
  
  res.status(200).json({
    success: true,
    message: 'Personal record updated successfully',
    data: record
  });
});

// @desc    Delete personal record
// @route   DELETE /api/records/:id
// @access  Private
const deletePersonalRecord = asyncHandler(async (req, res, next) => {
  const record = await PersonalRecord.findById(req.params.id);
  
  if (!record) {
    return next(new AppError('Personal record not found', 404));
  }
  
  // Check if user owns this record
  if (record.userId.toString() !== req.user.id) {
    return next(new AppError('Not authorized to delete this record', 403));
  }
  
  await PersonalRecord.findByIdAndDelete(req.params.id);
  
  res.status(200).json({
    success: true,
    message: 'Personal record deleted successfully'
  });
});

// @desc    Get records for specific exercise
// @route   GET /api/records/exercise/:exerciseId
// @access  Private
const getExerciseRecords = asyncHandler(async (req, res, next) => {
  const { exerciseId } = req.params;
  
  // Validate exercise exists
  const exercise = await Exercise.findById(exerciseId);
  if (!exercise) {
    return next(new AppError('Exercise not found', 404));
  }
  
  const records = await PersonalRecord.getUserExerciseRecords(req.user.id, exerciseId);
  
  res.status(200).json({
    success: true,
    count: records.length,
    data: records
  });
});

// @desc    Get recent personal records
// @route   GET /api/records/recent
// @access  Private
const getRecentRecords = asyncHandler(async (req, res, next) => {
  const { days = 30, limit = 10 } = req.query;
  
  const records = await PersonalRecord.getRecentPRs(req.user.id, parseInt(days));
  
  res.status(200).json({
    success: true,
    count: records.length,
    data: records.slice(0, parseInt(limit))
  });
});

// @desc    Get personal records summary
// @route   GET /api/records/summary
// @access  Private
const getRecordsSummary = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  
  // Get total records count
  const totalRecords = await PersonalRecord.countDocuments({ userId });
  
  // Get records by type
  const recordsByType = await PersonalRecord.aggregate([
    { $match: { userId: req.user._id } },
    {
      $group: {
        _id: '$recordType',
        count: { $sum: 1 },
        latestDate: { $max: '$dateAchieved' }
      }
    },
    { $sort: { count: -1 } }
  ]);
  
  // Get records by muscle group
  const recordsByMuscleGroup = await PersonalRecord.aggregate([
    { $match: { userId: req.user._id } },
    {
      $lookup: {
        from: 'exercises',
        localField: 'exerciseId',
        foreignField: '_id',
        as: 'exercise'
      }
    },
    { $unwind: '$exercise' },
    { $unwind: '$exercise.muscleGroup' },
    {
      $group: {
        _id: '$exercise.muscleGroup',
        count: { $sum: 1 },
        latestDate: { $max: '$dateAchieved' }
      }
    },
    { $sort: { count: -1 } }
  ]);
  
  // Get recent PRs (last 7 days)
  const recentPRs = await PersonalRecord.getRecentPRs(userId, 7);
  
  // Get best improvements (highest percentage gains)
  const bestImprovements = await PersonalRecord.find({
    userId,
    improvement: { $gt: 0 }
  })
  .populate('exerciseId', 'name muscleGroup')
  .sort({ improvement: -1 })
  .limit(5);
  
  res.status(200).json({
    success: true,
    data: {
      totalRecords,
      recordsByType,
      recordsByMuscleGroup,
      recentCount: recentPRs.length,
      bestImprovements
    }
  });
});

// @desc    Get exercise leaderboard
// @route   GET /api/records/leaderboard/:exerciseId
// @access  Private
const getExerciseLeaderboard = asyncHandler(async (req, res, next) => {
  const { exerciseId } = req.params;
  const { recordType = 'max_weight', limit = 10 } = req.query;
  
  // Validate exercise exists
  const exercise = await Exercise.findById(exerciseId);
  if (!exercise) {
    return next(new AppError('Exercise not found', 404));
  }
  
  const leaderboard = await PersonalRecord.getExerciseLeaderboard(
    exerciseId, 
    recordType, 
    parseInt(limit)
  );
  
  // Add current user's rank if not in top results
  const userRecord = await PersonalRecord.findOne({
    userId: req.user.id,
    exerciseId,
    recordType
  }).populate('userId', 'username profilePic');
  
  let userRank = null;
  if (userRecord) {
    const userPosition = leaderboard.findIndex(
      record => record.userId._id.toString() === req.user.id
    );
    
    if (userPosition === -1) {
      // User not in top results, calculate their rank
      const sortField = recordType === 'max_weight' ? 'weight' :
                       recordType === 'max_reps' ? 'reps' :
                       recordType === 'max_volume' ? 'volume' :
                       recordType === 'one_rep_max' ? 'oneRepMax' :
                       recordType === 'max_duration' ? 'duration' :
                       recordType === 'max_distance' ? 'distance' : 'weight';
      
      const betterRecordsCount = await PersonalRecord.countDocuments({
        exerciseId,
        recordType,
        [sortField]: { $gt: userRecord[sortField] }
      });
      
      userRank = {
        rank: betterRecordsCount + 1,
        record: userRecord
      };
    } else {
      userRank = {
        rank: userPosition + 1,
        record: userRecord
      };
    }
  }
  
  res.status(200).json({
    success: true,
    exercise: {
      _id: exercise._id,
      name: exercise.name,
      muscleGroup: exercise.muscleGroup
    },
    recordType,
    leaderboard,
    userRank,
    count: leaderboard.length
  });
});

// @desc    Get strength standards comparison
// @route   GET /api/records/standards/:exerciseId
// @access  Private
const getStrengthStandards = asyncHandler(async (req, res, next) => {
  const { exerciseId } = req.params;
  
  // Get user's record for this exercise
  const userRecord = await PersonalRecord.findOne({
    userId: req.user.id,
    exerciseId,
    recordType: 'max_weight'
  }).populate('exerciseId', 'name');
  
  if (!userRecord) {
    return next(new AppError('No record found for this exercise', 404));
  }
  
  // Get user info for body weight ratio
  const user = await User.findById(req.user.id);
  let strengthStandard = null;
  
  if (user.profile.weight && userRecord.weight) {
    const ratio = userRecord.weight / user.profile.weight;
    
    // Simplified strength standards (these would typically come from a database)
    const standards = getStrengthStandardsForExercise(userRecord.exerciseId.name, user.profile.gender);
    
    if (standards) {
      let level = 'untrained';
      if (ratio >= standards.elite) level = 'elite';
      else if (ratio >= standards.advanced) level = 'advanced';
      else if (ratio >= standards.intermediate) level = 'intermediate';
      else if (ratio >= standards.novice) level = 'novice';
      
      strengthStandard = {
        level,
        ratio: Math.round(ratio * 100) / 100,
        standards,
        nextLevel: getNextLevel(level, standards, ratio)
      };
    }
  }
  
  res.status(200).json({
    success: true,
    data: {
      exercise: userRecord.exerciseId,
      userRecord,
      bodyWeight: user.profile.weight,
      strengthStandard
    }
  });
});

// @desc    Get records progress over time
// @route   GET /api/records/progress/:exerciseId
// @access  Private
const getRecordProgress = asyncHandler(async (req, res, next) => {
  const { exerciseId } = req.params;
  const { recordType = 'max_weight', period = '1y' } = req.query;
  
  let startDate;
  const endDate = new Date();
  
  switch (period) {
    case '6m':
      startDate = new Date(endDate.getTime() - 6 * 30 * 24 * 60 * 60 * 1000);
      break;
    case '1y':
      startDate = new Date(endDate.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    case '2y':
      startDate = new Date(endDate.getTime() - 2 * 365 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = null;
  }
  
  const query = {
    userId: req.user.id,
    exerciseId,
    recordType
  };
  
  if (startDate) {
    query.dateAchieved = { $gte: startDate, $lte: endDate };
  }
  
  const progressData = await PersonalRecord.find(query)
    .populate('exerciseId', 'name muscleGroup')
    .sort({ dateAchieved: 1 });
  
  // Calculate progress metrics
  let totalImprovement = 0;
  let improvementPercentage = 0;
  
  if (progressData.length >= 2) {
    const firstRecord = progressData[0];
    const lastRecord = progressData[progressData.length - 1];
    const firstValue = getRecordValue(firstRecord);
    const lastValue = getRecordValue(lastRecord);
    
    totalImprovement = lastValue - firstValue;
    improvementPercentage = ((lastValue - firstValue) / firstValue) * 100;
  }
  
  res.status(200).json({
    success: true,
    count: progressData.length,
    data: progressData,
    summary: {
      totalImprovement: Math.round(totalImprovement * 10) / 10,
      improvementPercentage: Math.round(improvementPercentage * 10) / 10,
      recordCount: progressData.length,
      period
    }
  });
});

// Helper function to get record value based on type
const getRecordValue = (record) => {
  switch (record.recordType) {
    case 'max_weight':
      return record.weight || 0;
    case 'max_reps':
      return record.reps || 0;
    case 'max_volume':
      return record.volume || 0;
    case 'one_rep_max':
      return record.oneRepMax || 0;
    case 'max_duration':
      return record.duration || 0;
    case 'max_distance':
      return record.distance || 0;
    default:
      return 0;
  }
};

// Helper function to get strength standards (simplified version)
const getStrengthStandardsForExercise = (exerciseName, gender = 'male') => {
  const standards = {
    'Bench Press': {
      male: { untrained: 0.5, novice: 0.75, intermediate: 1.0, advanced: 1.25, elite: 1.5 },
      female: { untrained: 0.3, novice: 0.5, intermediate: 0.75, advanced: 1.0, elite: 1.25 }
    },
    'Squat': {
      male: { untrained: 0.75, novice: 1.0, intermediate: 1.25, advanced: 1.5, elite: 2.0 },
      female: { untrained: 0.5, novice: 0.75, intermediate: 1.0, advanced: 1.25, elite: 1.5 }
    },
    'Deadlift': {
      male: { untrained: 1.0, novice: 1.25, intermediate: 1.5, advanced: 1.75, elite: 2.25 },
      female: { untrained: 0.75, novice: 1.0, intermediate: 1.25, advanced: 1.5, elite: 1.75 }
    }
  };
  
  return standards[exerciseName]?.[gender] || null;
};

// Helper function to get next level requirements
const getNextLevel = (currentLevel, standards, currentRatio) => {
  const levels = ['untrained', 'novice', 'intermediate', 'advanced', 'elite'];
  const currentIndex = levels.indexOf(currentLevel);
  
  if (currentIndex < levels.length - 1) {
    const nextLevel = levels[currentIndex + 1];
    const nextRatio = standards[nextLevel];
    const needed = nextRatio - currentRatio;
    
    return {
      level: nextLevel,
      ratio: nextRatio,
      needed: Math.max(0, Math.round(needed * 100) / 100)
    };
  }
  
  return null;
};

module.exports = {
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
};
