const Workout = require('../models/Workout');
const Exercise = require('../models/Exercise');
const WorkoutLog = require('../models/WorkoutLog');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');

// @desc    Get all workouts (user's workouts + public workouts)
// @route   GET /api/workouts
// @access  Private
const getWorkouts = asyncHandler(async (req, res, next) => {
  const { 
    page = 1, 
    limit = 20, 
    category, 
    difficulty, 
    muscleGroup,
    isPublic,
    search,
    sort = '-createdAt'
  } = req.query;

  const skip = (page - 1) * limit;
  
  // Build query
  const query = {
    $or: [
      { createdBy: req.user.id },
      { isPublic: true }
    ]
  };
  
  if (category) query.category = category;
  if (difficulty) query.difficulty = difficulty;
  if (muscleGroup) query.targetMuscleGroups = { $in: [muscleGroup] };
  if (isPublic !== undefined) query.isPublic = isPublic === 'true';
  if (search) {
    query.$text = { $search: search };
  }
  
  const workouts = await Workout.find(query)
    .populate('createdBy', 'username profilePic')
    .populate('exercises.exercise', 'name muscleGroup equipment')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));
  
  const total = await Workout.countDocuments(query);
  
  res.status(200).json({
    success: true,
    count: workouts.length,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      total,
      hasNext: page * limit < total,
      hasPrev: page > 1
    },
    data: workouts
  });
});

// @desc    Get single workout
// @route   GET /api/workouts/:id
// @access  Private
const getWorkout = asyncHandler(async (req, res, next) => {
  const workout = await Workout.findById(req.params.id)
    .populate('createdBy', 'username profilePic bio')
    .populate('exercises.exercise', 'name description muscleGroup equipment demoVideo instructions');
  
  if (!workout) {
    return next(new AppError('Workout not found', 404));
  }
  
  // Check if user can access this workout
  if (!workout.isPublic && workout.createdBy._id.toString() !== req.user.id) {
    return next(new AppError('Not authorized to access this workout', 403));
  }
  
  res.status(200).json({
    success: true,
    data: workout
  });
});

// @desc    Create new workout
// @route   POST /api/workouts
// @access  Private
const createWorkout = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.createdBy = req.user.id;
  
  // Validate exercises exist
  if (req.body.exercises && req.body.exercises.length > 0) {
    const exerciseIds = req.body.exercises.map(ex => ex.exercise);
    const existingExercises = await Exercise.find({ _id: { $in: exerciseIds } });
    
    if (existingExercises.length !== exerciseIds.length) {
      return next(new AppError('One or more exercises not found', 400));
    }
  }
  
  const workout = await Workout.create(req.body);
  
  // Populate the created workout
  await workout.populate('createdBy', 'username profilePic');
  await workout.populate('exercises.exercise', 'name muscleGroup equipment');
  
  res.status(201).json({
    success: true,
    message: 'Workout created successfully',
    data: workout
  });
});

// @desc    Update workout
// @route   PUT /api/workouts/:id
// @access  Private
const updateWorkout = asyncHandler(async (req, res, next) => {
  let workout = await Workout.findById(req.params.id);
  
  if (!workout) {
    return next(new AppError('Workout not found', 404));
  }
  
  // Check workout ownership
  if (workout.createdBy.toString() !== req.user.id) {
    return next(new AppError('Not authorized to update this workout', 403));
  }
  
  // Validate exercises if provided
  if (req.body.exercises && req.body.exercises.length > 0) {
    const exerciseIds = req.body.exercises.map(ex => ex.exercise);
    const existingExercises = await Exercise.find({ _id: { $in: exerciseIds } });
    
    if (existingExercises.length !== exerciseIds.length) {
      return next(new AppError('One or more exercises not found', 400));
    }
  }
  
  workout = await Workout.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })
  .populate('createdBy', 'username profilePic')
  .populate('exercises.exercise', 'name muscleGroup equipment');
  
  res.status(200).json({
    success: true,
    message: 'Workout updated successfully',
    data: workout
  });
});

// @desc    Delete workout
// @route   DELETE /api/workouts/:id
// @access  Private
const deleteWorkout = asyncHandler(async (req, res, next) => {
  const workout = await Workout.findById(req.params.id);
  
  if (!workout) {
    return next(new AppError('Workout not found', 404));
  }
  
  // Check workout ownership
  if (workout.createdBy.toString() !== req.user.id) {
    return next(new AppError('Not authorized to delete this workout', 403));
  }
  
  await Workout.findByIdAndDelete(req.params.id);
  
  res.status(200).json({
    success: true,
    message: 'Workout deleted successfully'
  });
});

// @desc    Duplicate workout
// @route   POST /api/workouts/:id/duplicate
// @access  Private
const duplicateWorkout = asyncHandler(async (req, res, next) => {
  const originalWorkout = await Workout.findById(req.params.id);
  
  if (!originalWorkout) {
    return next(new AppError('Workout not found', 404));
  }
  
  // Check if user can access this workout
  if (!originalWorkout.isPublic && originalWorkout.createdBy.toString() !== req.user.id) {
    return next(new AppError('Not authorized to duplicate this workout', 403));
  }
  
  // Create duplicate
  const duplicateData = {
    ...originalWorkout.toObject(),
    _id: undefined,
    createdBy: req.user.id,
    title: `${originalWorkout.title} (Copy)`,
    isPublic: false,
    likes: [],
    timesUsed: 0,
    averageRating: 0,
    totalRatings: 0,
    createdAt: undefined,
    updatedAt: undefined
  };
  
  const duplicatedWorkout = await Workout.create(duplicateData);
  
  // Increment original workout's usage count
  originalWorkout.timesUsed += 1;
  await originalWorkout.save();
  
  await duplicatedWorkout.populate('createdBy', 'username profilePic');
  await duplicatedWorkout.populate('exercises.exercise', 'name muscleGroup equipment');
  
  res.status(201).json({
    success: true,
    message: 'Workout duplicated successfully',
    data: duplicatedWorkout
  });
});

// @desc    Like/unlike workout
// @route   POST /api/workouts/:id/like
// @access  Private
const toggleLike = asyncHandler(async (req, res, next) => {
  const workout = await Workout.findById(req.params.id);
  
  if (!workout) {
    return next(new AppError('Workout not found', 404));
  }
  
  // Check if workout is accessible
  if (!workout.isPublic && workout.createdBy.toString() !== req.user.id) {
    return next(new AppError('Not authorized to like this workout', 403));
  }
  
  const updatedWorkout = await workout.toggleLike(req.user.id);
  
  res.status(200).json({
    success: true,
    message: updatedWorkout.hasUserLiked(req.user.id) ? 'Workout liked' : 'Workout unliked',
    data: {
      liked: updatedWorkout.hasUserLiked(req.user.id),
      likeCount: updatedWorkout.likeCount
    }
  });
});

// @desc    Rate workout
// @route   POST /api/workouts/:id/rate
// @access  Private
const rateWorkout = asyncHandler(async (req, res, next) => {
  const { rating } = req.body;
  
  if (!rating || rating < 1 || rating > 5) {
    return next(new AppError('Rating must be between 1 and 5', 400));
  }
  
  const workout = await Workout.findById(req.params.id);
  
  if (!workout) {
    return next(new AppError('Workout not found', 404));
  }
  
  // Check if workout is accessible
  if (!workout.isPublic && workout.createdBy.toString() !== req.user.id) {
    return next(new AppError('Not authorized to rate this workout', 403));
  }
  
  // Calculate new average rating
  const totalScore = workout.averageRating * workout.totalRatings + rating;
  workout.totalRatings += 1;
  workout.averageRating = totalScore / workout.totalRatings;
  
  await workout.save();
  
  res.status(200).json({
    success: true,
    message: 'Workout rated successfully',
    data: {
      averageRating: Math.round(workout.averageRating * 10) / 10,
      totalRatings: workout.totalRatings
    }
  });
});

// @desc    Get popular workouts
// @route   GET /api/workouts/popular
// @access  Private
const getPopularWorkouts = asyncHandler(async (req, res, next) => {
  const { limit = 10, category, difficulty } = req.query;
  
  const query = { isPublic: true };
  if (category) query.category = category;
  if (difficulty) query.difficulty = difficulty;
  
  const workouts = await Workout.find(query)
    .populate('createdBy', 'username profilePic')
    .populate('exercises.exercise', 'name muscleGroup')
    .sort({ averageRating: -1, timesUsed: -1, likeCount: -1 })
    .limit(parseInt(limit));
  
  res.status(200).json({
    success: true,
    count: workouts.length,
    data: workouts
  });
});

// @desc    Get workout analytics
// @route   GET /api/workouts/:id/analytics
// @access  Private
const getWorkoutAnalytics = asyncHandler(async (req, res, next) => {
  const workout = await Workout.findById(req.params.id);
  
  if (!workout) {
    return next(new AppError('Workout not found', 404));
  }
  
  // Check workout ownership
  if (workout.createdBy.toString() !== req.user.id) {
    return next(new AppError('Not authorized to view analytics for this workout', 403));
  }
  
  // Get workout logs for this workout
  const logs = await WorkoutLog.find({ workoutId: req.params.id });
  
  // Calculate analytics
  const analytics = {
    totalUses: logs.length,
    averageDuration: logs.length > 0 ? logs.reduce((sum, log) => sum + log.duration, 0) / logs.length : 0,
    averageRating: workout.averageRating,
    totalRatings: workout.totalRatings,
    likes: workout.likeCount,
    lastUsed: logs.length > 0 ? Math.max(...logs.map(log => new Date(log.completedAt))) : null,
    userCompletions: logs.filter(log => log.userId.toString() === req.user.id).length
  };
  
  res.status(200).json({
    success: true,
    data: analytics
  });
});

module.exports = {
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
};
