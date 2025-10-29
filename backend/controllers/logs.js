const WorkoutLog = require('../models/WorkoutLog');
const Workout = require('../models/Workout');
const Exercise = require('../models/Exercise');
const PersonalRecord = require('../models/PersonalRecord');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');

// @desc    Get user's workout logs
// @route   GET /api/logs
// @access  Private
const getWorkoutLogs = asyncHandler(async (req, res, next) => {
  const { 
    page = 1, 
    limit = 20, 
    startDate, 
    endDate, 
    workoutId,
    exerciseId,
    sort = '-completedAt'
  } = req.query;

  const skip = (page - 1) * limit;
  
  // Build query
  const query = { userId: req.user.id };
  
  if (startDate || endDate) {
    query.completedAt = {};
    if (startDate) query.completedAt.$gte = new Date(startDate);
    if (endDate) query.completedAt.$lte = new Date(endDate);
  }
  
  if (workoutId) query.workoutId = workoutId;
  if (exerciseId) query['exercisesCompleted.exercise'] = exerciseId;
  
  const logs = await WorkoutLog.find(query)
    .populate('workoutId', 'title category difficulty')
    .populate('exercisesCompleted.exercise', 'name muscleGroup')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));
  
  const total = await WorkoutLog.countDocuments(query);
  
  // Calculate summary stats
  const stats = await WorkoutLog.getUserStats(req.user.id, startDate, endDate);
  
  res.status(200).json({
    success: true,
    count: logs.length,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      total,
      hasNext: page * limit < total,
      hasPrev: page > 1
    },
    stats: stats.length > 0 ? stats[0] : {
      totalWorkouts: 0,
      totalDuration: 0,
      totalSets: 0,
      totalReps: 0,
      totalVolume: 0,
      avgDuration: 0,
      avgWorkoutRating: 0,
      totalCalories: 0
    },
    data: logs
  });
});

// @desc    Get single workout log
// @route   GET /api/logs/:id
// @access  Private
const getWorkoutLog = asyncHandler(async (req, res, next) => {
  const log = await WorkoutLog.findById(req.params.id)
    .populate('userId', 'username profilePic')
    .populate('workoutId', 'title description category difficulty')
    .populate('exercisesCompleted.exercise', 'name description muscleGroup equipment demoVideo');
  
  if (!log) {
    return next(new AppError('Workout log not found', 404));
  }
  
  // Check if user owns this log
  if (log.userId._id.toString() !== req.user.id) {
    return next(new AppError('Not authorized to access this workout log', 403));
  }
  
  res.status(200).json({
    success: true,
    data: log
  });
});

// @desc    Log a workout
// @route   POST /api/logs
// @access  Private
const logWorkout = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.userId = req.user.id;
  
  // Validate workout exists
  if (req.body.workoutId) {
    const workout = await Workout.findById(req.body.workoutId);
    if (!workout) {
      return next(new AppError('Workout not found', 400));
    }
  }
  
  // Validate exercises exist
  if (req.body.exercisesCompleted && req.body.exercisesCompleted.length > 0) {
    const exerciseIds = req.body.exercisesCompleted.map(ex => ex.exercise);
    const existingExercises = await Exercise.find({ _id: { $in: exerciseIds } });
    
    if (existingExercises.length !== exerciseIds.length) {
      return next(new AppError('One or more exercises not found', 400));
    }
  }
  
  const log = new WorkoutLog(req.body);
  
  // Calculate totals
  log.calculateTotals();
  
  // Estimate calories if not provided
  if (!log.caloriesBurned && log.bodyWeight) {
    log.estimateCalories();
  }
  
  await log.save();
  
  // Check for personal records
  const personalRecords = await checkForPersonalRecords(log);
  
  // Update user stats
  await updateUserStats(req.user.id);
  
  // Populate the created log
  await log.populate('workoutId', 'title category difficulty');
  await log.populate('exercisesCompleted.exercise', 'name muscleGroup');
  
  res.status(201).json({
    success: true,
    message: 'Workout logged successfully',
    data: log,
    personalRecords
  });
});

// @desc    Update workout log
// @route   PUT /api/logs/:id
// @access  Private
const updateWorkoutLog = asyncHandler(async (req, res, next) => {
  let log = await WorkoutLog.findById(req.params.id);
  
  if (!log) {
    return next(new AppError('Workout log not found', 404));
  }
  
  // Check if user owns this log
  if (log.userId.toString() !== req.user.id) {
    return next(new AppError('Not authorized to update this workout log', 403));
  }
  
  // Update the log
  Object.assign(log, req.body);
  
  // Recalculate totals
  log.calculateTotals();
  
  // Re-estimate calories if body weight changed
  if (req.body.bodyWeight) {
    log.estimateCalories();
  }
  
  await log.save();
  
  // Check for new personal records
  const personalRecords = await checkForPersonalRecords(log);
  
  // Update user stats
  await updateUserStats(req.user.id);
  
  // Populate the updated log
  await log.populate('workoutId', 'title category difficulty');
  await log.populate('exercisesCompleted.exercise', 'name muscleGroup');
  
  res.status(200).json({
    success: true,
    message: 'Workout log updated successfully',
    data: log,
    personalRecords
  });
});

// @desc    Delete workout log
// @route   DELETE /api/logs/:id
// @access  Private
const deleteWorkoutLog = asyncHandler(async (req, res, next) => {
  const log = await WorkoutLog.findById(req.params.id);
  
  if (!log) {
    return next(new AppError('Workout log not found', 404));
  }
  
  // Check if user owns this log
  if (log.userId.toString() !== req.user.id) {
    return next(new AppError('Not authorized to delete this workout log', 403));
  }
  
  await WorkoutLog.findByIdAndDelete(req.params.id);
  
  // Update user stats after deletion
  await updateUserStats(req.user.id);
  
  res.status(200).json({
    success: true,
    message: 'Workout log deleted successfully'
  });
});

// @desc    Get workout history for specific workout
// @route   GET /api/logs/workout/:workoutId
// @access  Private
const getWorkoutHistory = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;
  
  const logs = await WorkoutLog.find({
    userId: req.user.id,
    workoutId: req.params.workoutId
  })
  .populate('workoutId', 'title')
  .populate('exercisesCompleted.exercise', 'name')
  .sort({ completedAt: -1 })
  .skip(skip)
  .limit(parseInt(limit));
  
  const total = await WorkoutLog.countDocuments({
    userId: req.user.id,
    workoutId: req.params.workoutId
  });
  
  res.status(200).json({
    success: true,
    count: logs.length,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      total,
      hasNext: page * limit < total,
      hasPrev: page > 1
    },
    data: logs
  });
});

// @desc    Get exercise history
// @route   GET /api/logs/exercise/:exerciseId
// @access  Private
const getExerciseHistory = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 20, startDate, endDate } = req.query;
  const skip = (page - 1) * limit;
  
  const query = {
    userId: req.user.id,
    'exercisesCompleted.exercise': req.params.exerciseId
  };
  
  if (startDate || endDate) {
    query.completedAt = {};
    if (startDate) query.completedAt.$gte = new Date(startDate);
    if (endDate) query.completedAt.$lte = new Date(endDate);
  }
  
  const logs = await WorkoutLog.find(query)
    .populate('exercisesCompleted.exercise', 'name muscleGroup')
    .sort({ completedAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));
  
  // Filter and format exercise data
  const exerciseHistory = logs.map(log => {
    const exerciseData = log.exercisesCompleted.find(
      ex => ex.exercise._id.toString() === req.params.exerciseId
    );
    
    return {
      _id: log._id,
      completedAt: log.completedAt,
      duration: log.duration,
      exercise: exerciseData,
      bodyWeight: log.bodyWeight,
      mood: log.mood,
      energy: log.energy
    };
  }).filter(item => item.exercise);
  
  const total = await WorkoutLog.countDocuments(query);
  
  res.status(200).json({
    success: true,
    count: exerciseHistory.length,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      total,
      hasNext: page * limit < total,
      hasPrev: page > 1
    },
    data: exerciseHistory
  });
});

// @desc    Get workout statistics
// @route   GET /api/logs/stats
// @access  Private
const getWorkoutStats = asyncHandler(async (req, res, next) => {
  const { period = '30d' } = req.query;
  
  let startDate;
  const endDate = new Date();
  
  switch (period) {
    case '7d':
      startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      startDate = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case '1y':
      startDate = new Date(endDate.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = null;
  }
  
  const stats = await WorkoutLog.getUserStats(req.user.id, startDate, endDate);
  
  // Get workout frequency data
  const frequencyData = await WorkoutLog.aggregate([
    {
      $match: {
        userId: req.user._id,
        ...(startDate && { completedAt: { $gte: startDate, $lte: endDate } })
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$completedAt' },
          month: { $month: '$completedAt' },
          day: { $dayOfMonth: '$completedAt' }
        },
        count: { $sum: 1 },
        totalDuration: { $sum: '$duration' },
        avgRating: { $avg: '$workoutRating' }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
    }
  ]);
  
  res.status(200).json({
    success: true,
    data: {
      summary: stats.length > 0 ? stats[0] : {
        totalWorkouts: 0,
        totalDuration: 0,
        totalSets: 0,
        totalReps: 0,
        totalVolume: 0,
        avgDuration: 0,
        avgWorkoutRating: 0,
        totalCalories: 0
      },
      frequencyData
    }
  });
});

// Helper function to check for personal records
const checkForPersonalRecords = async (log) => {
  const personalRecords = [];
  
  for (const exerciseLog of log.exercisesCompleted) {
    const exerciseId = exerciseLog.exercise;
    
    // Check each set for potential PRs
    for (const set of exerciseLog.sets) {
      if (set.personalRecord) continue; // Already marked as PR
      
      // Check for max weight PR
      if (set.weight && set.reps) {
        const existingWeightPR = await PersonalRecord.findOne({
          userId: log.userId,
          exerciseId,
          recordType: 'max_weight'
        }).sort({ weight: -1 });
        
        if (!existingWeightPR || set.weight > existingWeightPR.weight) {
          const prData = {
            userId: log.userId,
            exerciseId,
            recordType: 'max_weight',
            weight: set.weight,
            reps: set.reps,
            dateAchieved: log.completedAt,
            workoutLogId: log._id,
            bodyWeight: log.bodyWeight,
            previousRecord: existingWeightPR ? {
              value: existingWeightPR.weight,
              date: existingWeightPR.dateAchieved
            } : null
          };
          
          const newPR = await PersonalRecord.create(prData);
          personalRecords.push(newPR);
          set.personalRecord = true;
        }
        
        // Check for max volume PR
        const volume = set.weight * set.reps;
        const existingVolumePR = await PersonalRecord.findOne({
          userId: log.userId,
          exerciseId,
          recordType: 'max_volume'
        }).sort({ volume: -1 });
        
        if (!existingVolumePR || volume > existingVolumePR.volume) {
          const prData = {
            userId: log.userId,
            exerciseId,
            recordType: 'max_volume',
            weight: set.weight,
            reps: set.reps,
            volume,
            dateAchieved: log.completedAt,
            workoutLogId: log._id,
            bodyWeight: log.bodyWeight,
            previousRecord: existingVolumePR ? {
              value: existingVolumePR.volume,
              date: existingVolumePR.dateAchieved
            } : null
          };
          
          const newPR = await PersonalRecord.create(prData);
          personalRecords.push(newPR);
        }
      }
      
      // Check for max reps PR (at same or higher weight)
      if (set.reps && set.weight) {
        const existingRepsPR = await PersonalRecord.findOne({
          userId: log.userId,
          exerciseId,
          recordType: 'max_reps',
          weight: { $lte: set.weight }
        }).sort({ reps: -1 });
        
        if (!existingRepsPR || set.reps > existingRepsPR.reps) {
          const prData = {
            userId: log.userId,
            exerciseId,
            recordType: 'max_reps',
            weight: set.weight,
            reps: set.reps,
            dateAchieved: log.completedAt,
            workoutLogId: log._id,
            bodyWeight: log.bodyWeight,
            previousRecord: existingRepsPR ? {
              value: existingRepsPR.reps,
              date: existingRepsPR.dateAchieved
            } : null
          };
          
          const newPR = await PersonalRecord.create(prData);
          personalRecords.push(newPR);
        }
      }
    }
  }
  
  // Mark log as having PRs if any were achieved
  if (personalRecords.length > 0) {
    log.isPersonalRecord = true;
    log.personalRecordsAchieved = personalRecords.map(pr => ({
      exercise: pr.exerciseId,
      recordType: pr.recordType,
      value: pr.value,
      previousValue: pr.previousRecord?.value
    }));
    await log.save();
  }
  
  return personalRecords;
};

// Helper function to update user stats
const updateUserStats = async (userId) => {
  const stats = await WorkoutLog.getUserStats(userId);
  
  if (stats.length > 0) {
    const userStats = stats[0];
    await User.findByIdAndUpdate(userId, {
      'stats.totalWorkouts': userStats.totalWorkouts,
      'stats.totalWorkoutTime': userStats.totalDuration,
      'stats.totalWeightLifted': userStats.totalVolume || 0,
      'stats.lastWorkout': new Date()
    });
  }
};

module.exports = {
  getWorkoutLogs,
  getWorkoutLog,
  logWorkout,
  updateWorkoutLog,
  deleteWorkoutLog,
  getWorkoutHistory,
  getExerciseHistory,
  getWorkoutStats
};
