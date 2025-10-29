const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Progress entry must belong to a user']
  },
  date: {
    type: Date,
    required: [true, 'Please specify measurement date'],
    default: Date.now
  },
  weight: {
    type: Number, // in kg
    min: [20, 'Weight must be realistic'],
    max: [500, 'Weight must be realistic']
  },
  bodyFatPercentage: {
    type: Number,
    min: [0, 'Body fat percentage cannot be negative'],
    max: [60, 'Body fat percentage too high']
  },
  muscleMass: {
    type: Number, // in kg
    min: [0, 'Muscle mass cannot be negative']
  },
  bodyMeasurements: {
    chest: {
      type: Number, // in cm
      min: [0, 'Chest measurement cannot be negative']
    },
    waist: {
      type: Number, // in cm
      min: [0, 'Waist measurement cannot be negative']
    },
    hips: {
      type: Number, // in cm
      min: [0, 'Hip measurement cannot be negative']
    },
    biceps: {
      type: Number, // in cm
      min: [0, 'Bicep measurement cannot be negative']
    },
    thighs: {
      type: Number, // in cm
      min: [0, 'Thigh measurement cannot be negative']
    },
    neck: {
      type: Number, // in cm
      min: [0, 'Neck measurement cannot be negative']
    },
    forearms: {
      type: Number, // in cm
      min: [0, 'Forearm measurement cannot be negative']
    },
    calves: {
      type: Number, // in cm
      min: [0, 'Calf measurement cannot be negative']
    }
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    trim: true
  },
  photos: [{
    url: {
      type: String, // Cloudinary URL
      required: true
    },
    type: {
      type: String,
      enum: ['front', 'side', 'back', 'progress'],
      default: 'progress'
    },
    description: {
      type: String,
      maxlength: [200, 'Photo description cannot exceed 200 characters']
    }
  }],
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
  motivation: {
    type: String,
    enum: ['very_low', 'low', 'medium', 'high', 'very_high'],
    default: 'medium'
  },
  sleepHours: {
    type: Number,
    min: [0, 'Sleep hours cannot be negative'],
    max: [24, 'Sleep hours cannot exceed 24']
  },
  sleepQuality: {
    type: String,
    enum: ['very_poor', 'poor', 'fair', 'good', 'excellent'],
    default: 'fair'
  },
  stressLevel: {
    type: String,
    enum: ['very_low', 'low', 'medium', 'high', 'very_high'],
    default: 'medium'
  },
  workoutFrequency: {
    type: Number, // workouts per week
    min: [0, 'Workout frequency cannot be negative'],
    max: [21, 'Workout frequency too high'] // 3 times per day max
  },
  dietQuality: {
    type: String,
    enum: ['very_poor', 'poor', 'fair', 'good', 'excellent'],
    default: 'fair'
  },
  waterIntake: {
    type: Number, // liters per day
    min: [0, 'Water intake cannot be negative'],
    max: [10, 'Water intake too high']
  },
  supplements: [{
    name: {
      type: String,
      required: true,
      maxlength: [100, 'Supplement name cannot exceed 100 characters']
    },
    dosage: {
      type: String,
      maxlength: [50, 'Dosage cannot exceed 50 characters']
    },
    timing: {
      type: String,
      enum: ['morning', 'pre_workout', 'post_workout', 'evening', 'with_meals'],
      default: 'with_meals'
    }
  }],
  injuries: [{
    bodyPart: {
      type: String,
      required: true,
      maxlength: [100, 'Body part cannot exceed 100 characters']
    },
    severity: {
      type: String,
      enum: ['minor', 'moderate', 'severe'],
      default: 'minor'
    },
    description: {
      type: String,
      maxlength: [500, 'Injury description cannot exceed 500 characters']
    },
    status: {
      type: String,
      enum: ['healing', 'recovered', 'chronic'],
      default: 'healing'
    }
  }],
  goals: [{
    type: {
      type: String,
      enum: ['weight_loss', 'weight_gain', 'muscle_gain', 'strength', 'endurance', 'flexibility', 'body_fat', 'measurements'],
      required: true
    },
    target: {
      type: Number,
      required: true
    },
    current: {
      type: Number,
      required: true
    },
    deadline: {
      type: Date
    },
    unit: {
      type: String,
      enum: ['kg', 'lbs', 'cm', 'inches', '%', 'reps', 'minutes'],
      required: true
    },
    achieved: {
      type: Boolean,
      default: false
    }
  }],
  tags: [{
    type: String,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  milestone: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
ProgressSchema.index({ userId: 1, date: -1 });
ProgressSchema.index({ userId: 1, milestone: 1 });
ProgressSchema.index({ date: -1 });

// Virtual for BMI calculation
ProgressSchema.virtual('bmi').get(function() {
  if (!this.weight || !this.userId) return null;
  
  // This would need to be populated with user's height
  // For now, return null - should be calculated in controller with user data
  return null;
});

// Virtual for photo count
ProgressSchema.virtual('photoCount').get(function() {
  return this.photos ? this.photos.length : 0;
});

// Virtual for measurement changes (needs previous entry for comparison)
ProgressSchema.virtual('measurementChanges').get(function() {
  // This would need previous entry for comparison
  // Should be calculated in controller or aggregation pipeline
  return null;
});

// Method to calculate BMI with user height
ProgressSchema.methods.calculateBMI = function(heightInCm) {
  if (!this.weight || !heightInCm) return null;
  
  const heightInM = heightInCm / 100;
  const bmi = this.weight / (heightInM * heightInM);
  return Math.round(bmi * 10) / 10;
};

// Method to get goal progress
ProgressSchema.methods.getGoalProgress = function() {
  return this.goals.map(goal => {
    const progress = Math.min(Math.abs(goal.current - (goal.target - goal.current)) / Math.abs(goal.target - goal.current) * 100, 100);
    return {
      ...goal.toObject(),
      progress: Math.round(progress * 10) / 10,
      remaining: goal.target - goal.current,
      percentComplete: Math.round((goal.current / goal.target) * 100 * 10) / 10
    };
  });
};

// Method to check if entry is a milestone
ProgressSchema.methods.checkMilestone = function(previousEntry) {
  if (!previousEntry) return false;
  
  // Check for significant weight changes (5% or more)
  if (this.weight && previousEntry.weight) {
    const weightChange = Math.abs(this.weight - previousEntry.weight);
    const percentChange = (weightChange / previousEntry.weight) * 100;
    if (percentChange >= 5) {
      this.milestone = true;
      return true;
    }
  }
  
  // Check for body fat percentage changes (2% or more)
  if (this.bodyFatPercentage && previousEntry.bodyFatPercentage) {
    const bfChange = Math.abs(this.bodyFatPercentage - previousEntry.bodyFatPercentage);
    if (bfChange >= 2) {
      this.milestone = true;
      return true;
    }
  }
  
  // Check for significant measurement changes (5cm or more for major measurements)
  if (this.bodyMeasurements && previousEntry.bodyMeasurements) {
    const majorMeasurements = ['chest', 'waist', 'hips'];
    for (const measurement of majorMeasurements) {
      if (this.bodyMeasurements[measurement] && previousEntry.bodyMeasurements[measurement]) {
        const change = Math.abs(this.bodyMeasurements[measurement] - previousEntry.bodyMeasurements[measurement]);
        if (change >= 5) {
          this.milestone = true;
          return true;
        }
      }
    }
  }
  
  return false;
};

// Static method to get user progress history
ProgressSchema.statics.getUserProgress = function(userId, limit = 50, startDate = null, endDate = null) {
  const query = { userId };
  
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }
  
  return this.find(query)
    .sort({ date: -1 })
    .limit(limit);
};

// Static method to get progress analytics
ProgressSchema.statics.getProgressAnalytics = function(userId, months = 12) {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);
  
  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: { $gte: startDate }
      }
    },
    {
      $sort: { date: 1 }
    },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' }
        },
        avgWeight: { $avg: '$weight' },
        avgBodyFat: { $avg: '$bodyFatPercentage' },
        avgMood: { $avg: { $switch: {
          branches: [
            { case: { $eq: ['$mood', 'terrible'] }, then: 1 },
            { case: { $eq: ['$mood', 'bad'] }, then: 2 },
            { case: { $eq: ['$mood', 'okay'] }, then: 3 },
            { case: { $eq: ['$mood', 'good'] }, then: 4 },
            { case: { $eq: ['$mood', 'excellent'] }, then: 5 }
          ],
          default: 3
        }}},
        avgEnergy: { $avg: { $switch: {
          branches: [
            { case: { $eq: ['$energy', 'very_low'] }, then: 1 },
            { case: { $eq: ['$energy', 'low'] }, then: 2 },
            { case: { $eq: ['$energy', 'medium'] }, then: 3 },
            { case: { $eq: ['$energy', 'high'] }, then: 4 },
            { case: { $eq: ['$energy', 'very_high'] }, then: 5 }
          ],
          default: 3
        }}},
        entries: { $sum: 1 },
        milestones: { $sum: { $cond: ['$milestone', 1, 0] } }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 }
    }
  ]);
};

// Static method to get latest measurements
ProgressSchema.statics.getLatestMeasurements = function(userId) {
  return this.findOne({ userId })
    .sort({ date: -1 })
    .select('weight bodyFatPercentage bodyMeasurements date');
};

module.exports = mongoose.model('Progress', ProgressSchema);
