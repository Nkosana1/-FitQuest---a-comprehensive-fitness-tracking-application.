const Exercise = require('../models/Exercise');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');

// @desc    Get all exercises
// @route   GET /api/exercises
// @access  Private
const getExercises = asyncHandler(async (req, res, next) => {
  const { 
    page = 1, 
    limit = 20, 
    muscleGroup, 
    equipment, 
    category,
    difficulty,
    search,
    sort = '-averageRating'
  } = req.query;

  const skip = (page - 1) * limit;
  
  // Build query
  const query = {
    $or: [
      { isPublic: true, isApproved: true },
      { createdBy: req.user.id }
    ]
  };
  
  if (muscleGroup) query.muscleGroup = { $in: [muscleGroup] };
  if (equipment) {
    const equipmentArray = Array.isArray(equipment) ? equipment : [equipment];
    query.equipment = { $in: equipmentArray };
  }
  if (category) query.category = category;
  if (difficulty) query.difficulty = difficulty;
  if (search) {
    query.$text = { $search: search };
  }
  
  const exercises = await Exercise.find(query)
    .populate('createdBy', 'username profilePic')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));
  
  const total = await Exercise.countDocuments(query);
  
  res.status(200).json({
    success: true,
    count: exercises.length,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      total,
      hasNext: page * limit < total,
      hasPrev: page > 1
    },
    data: exercises
  });
});

// @desc    Get single exercise
// @route   GET /api/exercises/:id
// @access  Private
const getExercise = asyncHandler(async (req, res, next) => {
  const exercise = await Exercise.findById(req.params.id)
    .populate('createdBy', 'username profilePic bio')
    .populate('variations', 'name muscleGroup difficulty');
  
  if (!exercise) {
    return next(new AppError('Exercise not found', 404));
  }
  
  // Check if user can access this exercise
  if (!exercise.isPublic && exercise.createdBy._id.toString() !== req.user.id) {
    return next(new AppError('Not authorized to access this exercise', 403));
  }
  
  // Increment usage count
  await exercise.incrementUsage();
  
  res.status(200).json({
    success: true,
    data: exercise
  });
});

// @desc    Create new exercise
// @route   POST /api/exercises
// @access  Private
const createExercise = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.createdBy = req.user.id;
  
  // Custom exercises need approval unless created by admin
  if (req.user.role !== 'admin') {
    req.body.isApproved = false;
  }
  
  const exercise = await Exercise.create(req.body);
  
  // Populate the created exercise
  await exercise.populate('createdBy', 'username profilePic');
  
  res.status(201).json({
    success: true,
    message: 'Exercise created successfully',
    data: exercise
  });
});

// @desc    Update exercise
// @route   PUT /api/exercises/:id
// @access  Private
const updateExercise = asyncHandler(async (req, res, next) => {
  let exercise = await Exercise.findById(req.params.id);
  
  if (!exercise) {
    return next(new AppError('Exercise not found', 404));
  }
  
  // Check exercise ownership or admin role
  if (exercise.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Not authorized to update this exercise', 403));
  }
  
  // If non-admin updates an approved exercise, it needs re-approval
  if (req.user.role !== 'admin' && exercise.isApproved) {
    req.body.isApproved = false;
  }
  
  exercise = await Exercise.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).populate('createdBy', 'username profilePic');
  
  res.status(200).json({
    success: true,
    message: 'Exercise updated successfully',
    data: exercise
  });
});

// @desc    Delete exercise
// @route   DELETE /api/exercises/:id
// @access  Private
const deleteExercise = asyncHandler(async (req, res, next) => {
  const exercise = await Exercise.findById(req.params.id);
  
  if (!exercise) {
    return next(new AppError('Exercise not found', 404));
  }
  
  // Check exercise ownership or admin role
  if (exercise.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Not authorized to delete this exercise', 403));
  }
  
  await Exercise.findByIdAndDelete(req.params.id);
  
  res.status(200).json({
    success: true,
    message: 'Exercise deleted successfully'
  });
});

// @desc    Get exercises by muscle group
// @route   GET /api/exercises/muscle/:muscleGroup
// @access  Private
const getExercisesByMuscleGroup = asyncHandler(async (req, res, next) => {
  const { muscleGroup } = req.params;
  const { limit = 20, difficulty, equipment } = req.query;
  
  const query = {
    muscleGroup: { $in: [muscleGroup] },
    isPublic: true,
    isApproved: true
  };
  
  if (difficulty) query.difficulty = difficulty;
  if (equipment) {
    const equipmentArray = Array.isArray(equipment) ? equipment : [equipment];
    query.equipment = { $in: equipmentArray };
  }
  
  const exercises = await Exercise.find(query)
    .populate('createdBy', 'username profilePic')
    .sort({ averageRating: -1, timesUsed: -1 })
    .limit(parseInt(limit));
  
  res.status(200).json({
    success: true,
    count: exercises.length,
    data: exercises
  });
});

// @desc    Search exercises
// @route   GET /api/exercises/search
// @access  Private
const searchExercises = asyncHandler(async (req, res, next) => {
  const { q, muscleGroup, equipment, category, difficulty, limit = 20 } = req.query;
  
  if (!q) {
    return next(new AppError('Search query is required', 400));
  }
  
  const query = {
    $text: { $search: q },
    $or: [
      { isPublic: true, isApproved: true },
      { createdBy: req.user.id }
    ]
  };
  
  if (muscleGroup) query.muscleGroup = { $in: [muscleGroup] };
  if (equipment) {
    const equipmentArray = Array.isArray(equipment) ? equipment : [equipment];
    query.equipment = { $in: equipmentArray };
  }
  if (category) query.category = category;
  if (difficulty) query.difficulty = difficulty;
  
  const exercises = await Exercise.find(query)
    .populate('createdBy', 'username profilePic')
    .sort({ score: { $meta: 'textScore' }, averageRating: -1 })
    .limit(parseInt(limit));
  
  res.status(200).json({
    success: true,
    count: exercises.length,
    data: exercises
  });
});

// @desc    Get popular exercises
// @route   GET /api/exercises/popular
// @access  Private
const getPopularExercises = asyncHandler(async (req, res, next) => {
  const { limit = 10, muscleGroup, category } = req.query;
  
  const exercises = await Exercise.getPopular(parseInt(limit));
  
  res.status(200).json({
    success: true,
    count: exercises.length,
    data: exercises
  });
});

// @desc    Rate exercise
// @route   POST /api/exercises/:id/rate
// @access  Private
const rateExercise = asyncHandler(async (req, res, next) => {
  const { rating } = req.body;
  
  if (!rating || rating < 1 || rating > 5) {
    return next(new AppError('Rating must be between 1 and 5', 400));
  }
  
  const exercise = await Exercise.findById(req.params.id);
  
  if (!exercise) {
    return next(new AppError('Exercise not found', 404));
  }
  
  // Check if exercise is accessible
  if (!exercise.isPublic && exercise.createdBy.toString() !== req.user.id) {
    return next(new AppError('Not authorized to rate this exercise', 403));
  }
  
  await exercise.addRating(rating);
  
  res.status(200).json({
    success: true,
    message: 'Exercise rated successfully',
    data: {
      averageRating: Math.round(exercise.averageRating * 10) / 10,
      totalRatings: exercise.totalRatings
    }
  });
});

// @desc    Get exercise categories and filters
// @route   GET /api/exercises/filters
// @access  Private
const getExerciseFilters = asyncHandler(async (req, res, next) => {
  const muscleGroups = [
    'chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms',
    'abs', 'obliques', 'quads', 'hamstrings', 'calves', 'glutes', 'full_body'
  ];
  
  const equipment = [
    'dumbbells', 'barbell', 'kettlebell', 'resistance_bands', 'pull_up_bar',
    'bench', 'treadmill', 'stationary_bike', 'rowing_machine', 'bodyweight',
    'cable_machine', 'smith_machine', 'other'
  ];
  
  const categories = ['strength', 'cardio', 'flexibility', 'balance', 'plyometric', 'sports'];
  const difficulties = ['beginner', 'intermediate', 'advanced'];
  
  res.status(200).json({
    success: true,
    data: {
      muscleGroups,
      equipment,
      categories,
      difficulties
    }
  });
});

// @desc    Get exercise variations
// @route   GET /api/exercises/:id/variations
// @access  Private
const getExerciseVariations = asyncHandler(async (req, res, next) => {
  const exercise = await Exercise.findById(req.params.id)
    .populate('variations', 'name muscleGroup difficulty averageRating demoVideo');
  
  if (!exercise) {
    return next(new AppError('Exercise not found', 404));
  }
  
  // Also find exercises that have this exercise as a variation
  const relatedExercises = await Exercise.find({
    variations: req.params.id,
    isPublic: true,
    isApproved: true
  }).select('name muscleGroup difficulty averageRating demoVideo');
  
  const allVariations = [...exercise.variations, ...relatedExercises];
  
  res.status(200).json({
    success: true,
    count: allVariations.length,
    data: allVariations
  });
});

// @desc    Add exercise variation
// @route   POST /api/exercises/:id/variations
// @access  Private
const addExerciseVariation = asyncHandler(async (req, res, next) => {
  const { variationId } = req.body;
  
  if (!variationId) {
    return next(new AppError('Variation ID is required', 400));
  }
  
  const exercise = await Exercise.findById(req.params.id);
  const variation = await Exercise.findById(variationId);
  
  if (!exercise || !variation) {
    return next(new AppError('Exercise or variation not found', 404));
  }
  
  // Check exercise ownership or admin role
  if (exercise.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Not authorized to modify this exercise', 403));
  }
  
  // Add variation if not already present
  if (!exercise.variations.includes(variationId)) {
    exercise.variations.push(variationId);
    await exercise.save();
  }
  
  res.status(200).json({
    success: true,
    message: 'Variation added successfully',
    data: exercise
  });
});

module.exports = {
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
};
