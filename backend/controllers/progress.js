const Progress = require('../models/Progress');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');

// @desc    Get user's progress entries
// @route   GET /api/progress
// @access  Private
const getProgressEntries = asyncHandler(async (req, res, next) => {
  const { 
    page = 1, 
    limit = 20, 
    startDate, 
    endDate, 
    milestone,
    sort = '-date'
  } = req.query;

  const skip = (page - 1) * limit;
  
  // Build query
  const query = { userId: req.user.id };
  
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }
  
  if (milestone !== undefined) query.milestone = milestone === 'true';
  
  const entries = await Progress.find(query)
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));
  
  const total = await Progress.countDocuments(query);
  
  res.status(200).json({
    success: true,
    count: entries.length,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      total,
      hasNext: page * limit < total,
      hasPrev: page > 1
    },
    data: entries
  });
});

// @desc    Get single progress entry
// @route   GET /api/progress/:id
// @access  Private
const getProgressEntry = asyncHandler(async (req, res, next) => {
  const entry = await Progress.findById(req.params.id);
  
  if (!entry) {
    return next(new AppError('Progress entry not found', 404));
  }
  
  // Check if user owns this entry
  if (entry.userId.toString() !== req.user.id) {
    return next(new AppError('Not authorized to access this progress entry', 403));
  }
  
  res.status(200).json({
    success: true,
    data: entry
  });
});

// @desc    Add progress entry
// @route   POST /api/progress
// @access  Private
const addProgressEntry = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.userId = req.user.id;
  
  // Get user's height for BMI calculation
  const user = await User.findById(req.user.id);
  
  const entry = await Progress.create(req.body);
  
  // Check if this entry is a milestone by comparing with previous entry
  const previousEntry = await Progress.findOne({
    userId: req.user.id,
    date: { $lt: entry.date }
  }).sort({ date: -1 });
  
  if (previousEntry) {
    entry.checkMilestone(previousEntry);
    await entry.save();
  }
  
  // Calculate BMI if user has height and entry has weight
  let bmi = null;
  if (user.profile.height && entry.weight) {
    bmi = entry.calculateBMI(user.profile.height);
  }
  
  res.status(201).json({
    success: true,
    message: 'Progress entry added successfully',
    data: {
      ...entry.toObject(),
      bmi
    }
  });
});

// @desc    Update progress entry
// @route   PUT /api/progress/:id
// @access  Private
const updateProgressEntry = asyncHandler(async (req, res, next) => {
  let entry = await Progress.findById(req.params.id);
  
  if (!entry) {
    return next(new AppError('Progress entry not found', 404));
  }
  
  // Check if user owns this entry
  if (entry.userId.toString() !== req.user.id) {
    return next(new AppError('Not authorized to update this progress entry', 403));
  }
  
  entry = await Progress.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  // Re-check milestone status if measurements changed
  if (req.body.weight || req.body.bodyFatPercentage || req.body.bodyMeasurements) {
    const previousEntry = await Progress.findOne({
      userId: req.user.id,
      date: { $lt: entry.date }
    }).sort({ date: -1 });
    
    if (previousEntry) {
      entry.checkMilestone(previousEntry);
      await entry.save();
    }
  }
  
  res.status(200).json({
    success: true,
    message: 'Progress entry updated successfully',
    data: entry
  });
});

// @desc    Delete progress entry
// @route   DELETE /api/progress/:id
// @access  Private
const deleteProgressEntry = asyncHandler(async (req, res, next) => {
  const entry = await Progress.findById(req.params.id);
  
  if (!entry) {
    return next(new AppError('Progress entry not found', 404));
  }
  
  // Check if user owns this entry
  if (entry.userId.toString() !== req.user.id) {
    return next(new AppError('Not authorized to delete this progress entry', 403));
  }
  
  await Progress.findByIdAndDelete(req.params.id);
  
  res.status(200).json({
    success: true,
    message: 'Progress entry deleted successfully'
  });
});

// @desc    Get progress analytics
// @route   GET /api/progress/analytics
// @access  Private
const getProgressAnalytics = asyncHandler(async (req, res, next) => {
  const { period = '12' } = req.query; // months
  
  const analytics = await Progress.getProgressAnalytics(req.user.id, parseInt(period));
  
  // Get latest measurements for current status
  const latestEntry = await Progress.getLatestMeasurements(req.user.id);
  
  // Get user info for BMI calculation
  const user = await User.findById(req.user.id);
  
  let currentBMI = null;
  if (latestEntry && latestEntry.weight && user.profile.height) {
    currentBMI = latestEntry.calculateBMI(user.profile.height);
  }
  
  // Calculate weight change from first to last entry
  const firstEntry = await Progress.findOne({ userId: req.user.id }).sort({ date: 1 });
  let weightChange = null;
  if (firstEntry && latestEntry && firstEntry.weight && latestEntry.weight) {
    weightChange = {
      total: latestEntry.weight - firstEntry.weight,
      percentage: ((latestEntry.weight - firstEntry.weight) / firstEntry.weight) * 100
    };
  }
  
  res.status(200).json({
    success: true,
    data: {
      analytics,
      currentStatus: {
        latest: latestEntry,
        bmi: currentBMI,
        weightChange
      }
    }
  });
});

// @desc    Get progress charts data
// @route   GET /api/progress/charts
// @access  Private
const getProgressCharts = asyncHandler(async (req, res, next) => {
  const { 
    period = '6', // months
    metrics = 'weight,bodyFat' 
  } = req.query;
  
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - parseInt(period));
  
  const entries = await Progress.getUserProgress(req.user.id, 100, startDate);
  
  const requestedMetrics = metrics.split(',');
  const chartData = {};
  
  // Initialize chart data arrays
  requestedMetrics.forEach(metric => {
    chartData[metric] = [];
  });
  
  // Process entries into chart format
  entries.reverse().forEach(entry => {
    const dataPoint = {
      date: entry.date,
      mood: entry.mood,
      energy: entry.energy
    };
    
    requestedMetrics.forEach(metric => {
      let value = null;
      
      switch (metric) {
        case 'weight':
          value = entry.weight;
          break;
        case 'bodyFat':
          value = entry.bodyFatPercentage;
          break;
        case 'muscleMass':
          value = entry.muscleMass;
          break;
        case 'chest':
          value = entry.bodyMeasurements?.chest;
          break;
        case 'waist':
          value = entry.bodyMeasurements?.waist;
          break;
        case 'hips':
          value = entry.bodyMeasurements?.hips;
          break;
        case 'biceps':
          value = entry.bodyMeasurements?.biceps;
          break;
        case 'thighs':
          value = entry.bodyMeasurements?.thighs;
          break;
      }
      
      if (value !== null && value !== undefined) {
        chartData[metric].push({
          ...dataPoint,
          value
        });
      }
    });
  });
  
  // Calculate trends for each metric
  const trends = {};
  Object.keys(chartData).forEach(metric => {
    const data = chartData[metric];
    if (data.length >= 2) {
      const firstValue = data[0].value;
      const lastValue = data[data.length - 1].value;
      const change = lastValue - firstValue;
      const percentageChange = (change / firstValue) * 100;
      
      trends[metric] = {
        change,
        percentageChange: Math.round(percentageChange * 10) / 10,
        direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
      };
    }
  });
  
  res.status(200).json({
    success: true,
    data: {
      charts: chartData,
      trends,
      period: `${period} months`
    }
  });
});

// @desc    Get goal progress
// @route   GET /api/progress/goals
// @access  Private
const getGoalProgress = asyncHandler(async (req, res, next) => {
  const latestEntry = await Progress.findOne({ userId: req.user.id })
    .sort({ date: -1 });
  
  if (!latestEntry || !latestEntry.goals || latestEntry.goals.length === 0) {
    return res.status(200).json({
      success: true,
      message: 'No goals found',
      data: []
    });
  }
  
  const goalProgress = latestEntry.getGoalProgress();
  
  res.status(200).json({
    success: true,
    count: goalProgress.length,
    data: goalProgress
  });
});

// @desc    Update goals
// @route   PUT /api/progress/goals
// @access  Private
const updateGoals = asyncHandler(async (req, res, next) => {
  const { goals } = req.body;
  
  if (!goals || !Array.isArray(goals)) {
    return next(new AppError('Goals must be provided as an array', 400));
  }
  
  // Get latest progress entry or create new one
  let latestEntry = await Progress.findOne({ userId: req.user.id })
    .sort({ date: -1 });
  
  if (!latestEntry) {
    // Create new progress entry with goals
    latestEntry = await Progress.create({
      userId: req.user.id,
      goals,
      date: new Date()
    });
  } else {
    // Update existing entry's goals
    latestEntry.goals = goals;
    await latestEntry.save();
  }
  
  const goalProgress = latestEntry.getGoalProgress();
  
  res.status(200).json({
    success: true,
    message: 'Goals updated successfully',
    data: goalProgress
  });
});

// @desc    Get milestone entries
// @route   GET /api/progress/milestones
// @access  Private
const getMilestones = asyncHandler(async (req, res, next) => {
  const { limit = 10 } = req.query;
  
  const milestones = await Progress.find({
    userId: req.user.id,
    milestone: true
  })
  .sort({ date: -1 })
  .limit(parseInt(limit));
  
  res.status(200).json({
    success: true,
    count: milestones.length,
    data: milestones
  });
});

// @desc    Get body composition over time
// @route   GET /api/progress/composition
// @access  Private
const getBodyComposition = asyncHandler(async (req, res, next) => {
  const { period = '12' } = req.query; // months
  
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - parseInt(period));
  
  const entries = await Progress.find({
    userId: req.user.id,
    date: { $gte: startDate },
    $or: [
      { weight: { $exists: true } },
      { bodyFatPercentage: { $exists: true } },
      { muscleMass: { $exists: true } }
    ]
  })
  .sort({ date: 1 })
  .select('date weight bodyFatPercentage muscleMass');
  
  // Calculate lean body mass where possible
  const compositionData = entries.map(entry => {
    const data = {
      date: entry.date,
      weight: entry.weight,
      bodyFatPercentage: entry.bodyFatPercentage,
      muscleMass: entry.muscleMass
    };
    
    // Calculate fat mass and lean mass if weight and body fat % are available
    if (entry.weight && entry.bodyFatPercentage) {
      data.fatMass = (entry.weight * entry.bodyFatPercentage) / 100;
      data.leanMass = entry.weight - data.fatMass;
    }
    
    return data;
  });
  
  res.status(200).json({
    success: true,
    count: compositionData.length,
    data: compositionData
  });
});

module.exports = {
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
};
