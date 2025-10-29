const mongoose = require('mongoose');

const WorkoutLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Workout log must belong to a user']
  },
  workoutId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workout',
    required: [true, 'Workout log must reference a workout']
  },
  completedAt: {
    type: Date,
    required: [true, 'Please specify completion date'],
    default: Date.now
  },
  duration: {
    type: Number, // actual duration in minutes
    required: [true, 'Please specify workout duration'],
    min: [1, 'Duration must be at least 1 minute']
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    trim: true
  },
  exercisesCompleted: [{
    exercise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exercise',
      required: true
    },
    sets: [{
      setNumber: {
        type: Number,
        required: true,
        min: [1, 'Set number must be at least 1']
      },
      reps: {
        type: Number,
        min: [0, 'Reps cannot be negative']
      },
      weight: {
        type: Number, // in kg
        min: [0, 'Weight cannot be negative']
      },
      duration: {
        type: Number, // in seconds
        min: [0, 'Duration cannot be negative']
      },
      distance: {
        type: Number, // in meters
        min: [0, 'Distance cannot be negative']
      },
      restTime: {
        type: Number, // in seconds
        min: [0, 'Rest time cannot be negative']
      },
      rpe: {
        type: Number, // Rate of Perceived Exertion (1-10)
        min: [1, 'RPE must be between 1 and 10'],
        max: [10, 'RPE must be between 1 and 10']
      },
      notes: {
        type: String,
        maxlength: [200, 'Set notes cannot exceed 200 characters']
      },
      personalRecord: {
        type: Boolean,
        default: false
      }
    }],
    totalSets: {
      type: Number,
      min: [0, 'Total sets cannot be negative']
    },
    totalReps: {
      type: Number,
      min: [0, 'Total reps cannot be negative']
    },
    totalWeight: {
      type: Number, // total weight lifted for this exercise
      min: [0, 'Total weight cannot be negative']
    },
    totalVolume: {
      type: Number, // weight * reps total
      min: [0, 'Total volume cannot be negative']
    },
    avgRpe: {
      type: Number,
      min: [1, 'Average RPE must be between 1 and 10'],
      max: [10, 'Average RPE must be between 1 and 10']
    },
    exerciseNotes: {
      type: String,
      maxlength: [500, 'Exercise notes cannot exceed 500 characters']
    }
  }],
  totalSets: {
    type: Number,
    min: [0, 'Total sets cannot be negative'],
    default: 0
  },
  totalReps: {
    type: Number,
    min: [0, 'Total reps cannot be negative'],
    default: 0
  },
  totalWeight: {
    type: Number, // total weight lifted in entire workout
    min: [0, 'Total weight cannot be negative'],
    default: 0
  },
  totalVolume: {
    type: Number, // total volume (weight * reps) for entire workout
    min: [0, 'Total volume cannot be negative'],
    default: 0
  },
  caloriesBurned: {
    type: Number,
    min: [0, 'Calories burned cannot be negative'],
    default: 0
  },
  avgHeartRate: {
    type: Number,
    min: [40, 'Heart rate too low'],
    max: [220, 'Heart rate too high']
  },
  maxHeartRate: {
    type: Number,
    min: [40, 'Heart rate too low'],
    max: [220, 'Heart rate too high']
  },
  bodyWeight: {
    type: Number, // user's weight on workout day
    min: [20, 'Body weight must be realistic'],
    max: [500, 'Body weight must be realistic']
  },
  mood: {
    type: String,
    enum: ['terrible', 'bad', 'okay', 'good', 'excellent'],
    default: 'okay'
  },
  energy: {
    type: String,
    enum: ['very_low', 'low', 'medium', 'high', 'very_high'],
    default: 'medium'
  },
  workoutRating: {
    type: Number,
    min: [1, 'Rating must be between 1 and 5'],
    max: [5, 'Rating must be between 1 and 5']
  },
  tags: [{
    type: String,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  isPersonalRecord: {
    type: Boolean,
    default: false
  },
  personalRecordsAchieved: [{
    exercise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exercise'
    },
    recordType: {
      type: String,
      enum: ['max_weight', 'max_reps', 'max_volume', 'max_duration', 'one_rep_max']
    },
    value: Number,
    previousValue: Number
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
WorkoutLogSchema.index({ userId: 1, completedAt: -1 });
WorkoutLogSchema.index({ workoutId: 1 });
WorkoutLogSchema.index({ userId: 1, workoutId: 1 });
WorkoutLogSchema.index({ 'exercisesCompleted.exercise': 1 });
WorkoutLogSchema.index({ completedAt: -1 });

// Virtual for workout intensity (based on average RPE)
WorkoutLogSchema.virtual('intensity').get(function() {
  if (!this.exercisesCompleted || this.exercisesCompleted.length === 0) return null;
  
  const totalRpe = this.exercisesCompleted.reduce((sum, exercise) => {
    return sum + (exercise.avgRpe || 0);
  }, 0);
  
  const avgRpe = totalRpe / this.exercisesCompleted.length;
  
  if (avgRpe <= 4) return 'low';
  if (avgRpe <= 6) return 'moderate';
  if (avgRpe <= 8) return 'high';
  return 'very_high';
});

// Virtual for exercises completed count
WorkoutLogSchema.virtual('exerciseCount').get(function() {
  return this.exercisesCompleted ? this.exercisesCompleted.length : 0;
});

// Method to calculate totals from exercises
WorkoutLogSchema.methods.calculateTotals = function() {
  let totalSets = 0;
  let totalReps = 0;
  let totalWeight = 0;
  let totalVolume = 0;
  
  this.exercisesCompleted.forEach(exercise => {
    exercise.sets.forEach(set => {
      totalSets += 1;
      totalReps += set.reps || 0;
      totalWeight += set.weight || 0;
      totalVolume += (set.weight || 0) * (set.reps || 0);
    });
    
    // Update exercise totals
    exercise.totalSets = exercise.sets.length;
    exercise.totalReps = exercise.sets.reduce((sum, set) => sum + (set.reps || 0), 0);
    exercise.totalWeight = exercise.sets.reduce((sum, set) => sum + (set.weight || 0), 0);
    exercise.totalVolume = exercise.sets.reduce((sum, set) => sum + ((set.weight || 0) * (set.reps || 0)), 0);
    
    // Calculate average RPE
    const rpeValues = exercise.sets.filter(set => set.rpe).map(set => set.rpe);
    if (rpeValues.length > 0) {
      exercise.avgRpe = rpeValues.reduce((sum, rpe) => sum + rpe, 0) / rpeValues.length;
    }
  });
  
  this.totalSets = totalSets;
  this.totalReps = totalReps;
  this.totalWeight = totalWeight;
  this.totalVolume = totalVolume;
  
  return this;
};

// Method to estimate calories burned
WorkoutLogSchema.methods.estimateCalories = function() {
  if (!this.bodyWeight) return 0;
  
  // Basic estimation based on duration, body weight, and intensity
  let baseCaloriesPerMinute = 5; // Base rate for moderate exercise
  
  const intensity = this.intensity;
  switch (intensity) {
    case 'low':
      baseCaloriesPerMinute = 3;
      break;
    case 'moderate':
      baseCaloriesPerMinute = 5;
      break;
    case 'high':
      baseCaloriesPerMinute = 7;
      break;
    case 'very_high':
      baseCaloriesPerMinute = 9;
      break;
  }
  
  // Adjust for body weight (70kg baseline)
  const weightFactor = this.bodyWeight / 70;
  const estimatedCalories = this.duration * baseCaloriesPerMinute * weightFactor;
  
  this.caloriesBurned = Math.round(estimatedCalories);
  return this.caloriesBurned;
};

// Static method to get user's workout history
WorkoutLogSchema.statics.getUserHistory = function(userId, limit = 20, skip = 0) {
  return this.find({ userId })
    .populate('workoutId', 'title category difficulty')
    .populate('exercisesCompleted.exercise', 'name muscleGroup')
    .sort({ completedAt: -1 })
    .limit(limit)
    .skip(skip);
};

// Static method to get workout statistics for user
WorkoutLogSchema.statics.getUserStats = function(userId, startDate, endDate) {
  const matchQuery = { userId };
  
  if (startDate || endDate) {
    matchQuery.completedAt = {};
    if (startDate) matchQuery.completedAt.$gte = new Date(startDate);
    if (endDate) matchQuery.completedAt.$lte = new Date(endDate);
  }
  
  return this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalWorkouts: { $sum: 1 },
        totalDuration: { $sum: '$duration' },
        totalSets: { $sum: '$totalSets' },
        totalReps: { $sum: '$totalReps' },
        totalVolume: { $sum: '$totalVolume' },
        avgDuration: { $avg: '$duration' },
        avgWorkoutRating: { $avg: '$workoutRating' },
        totalCalories: { $sum: '$caloriesBurned' }
      }
    }
  ]);
};

module.exports = mongoose.model('WorkoutLog', WorkoutLogSchema);
