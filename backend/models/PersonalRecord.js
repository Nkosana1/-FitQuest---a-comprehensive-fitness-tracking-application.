const mongoose = require('mongoose');

const PersonalRecordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Personal record must belong to a user']
  },
  exerciseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exercise',
    required: [true, 'Personal record must reference an exercise']
  },
  recordType: {
    type: String,
    required: [true, 'Please specify record type'],
    enum: ['max_weight', 'max_reps', 'max_volume', 'one_rep_max', 'max_duration', 'max_distance']
  },
  weight: {
    type: Number, // in kg
    min: [0, 'Weight cannot be negative']
  },
  reps: {
    type: Number,
    min: [0, 'Reps cannot be negative']
  },
  duration: {
    type: Number, // in seconds
    min: [0, 'Duration cannot be negative']
  },
  distance: {
    type: Number, // in meters
    min: [0, 'Distance cannot be negative']
  },
  volume: {
    type: Number, // weight * reps
    min: [0, 'Volume cannot be negative']
  },
  oneRepMax: {
    type: Number, // calculated 1RM
    min: [0, '1RM cannot be negative']
  },
  dateAchieved: {
    type: Date,
    required: [true, 'Please specify when record was achieved'],
    default: Date.now
  },
  workoutLogId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkoutLog'
  },
  previousRecord: {
    value: Number,
    date: Date
  },
  improvement: {
    type: Number, // percentage or absolute improvement
    default: 0
  },
  bodyWeight: {
    type: Number, // user's body weight when record was set
    min: [20, 'Body weight must be realistic'],
    max: [500, 'Body weight must be realistic']
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters'],
    trim: true
  },
  verified: {
    type: Boolean,
    default: false // for community verification or video proof
  },
  tags: [{
    type: String,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  wilksScore: {
    type: Number, // for powerlifting records
    min: [0, 'Wilks score cannot be negative']
  },
  category: {
    type: String,
    enum: ['strength', 'endurance', 'power', 'technique'],
    default: 'strength'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
PersonalRecordSchema.index({ userId: 1, exerciseId: 1, recordType: 1 }, { unique: true });
PersonalRecordSchema.index({ userId: 1, dateAchieved: -1 });
PersonalRecordSchema.index({ exerciseId: 1, recordType: 1 });
PersonalRecordSchema.index({ dateAchieved: -1 });

// Virtual for record value based on type
PersonalRecordSchema.virtual('value').get(function() {
  switch (this.recordType) {
    case 'max_weight':
      return this.weight;
    case 'max_reps':
      return this.reps;
    case 'max_volume':
      return this.volume;
    case 'one_rep_max':
      return this.oneRepMax;
    case 'max_duration':
      return this.duration;
    case 'max_distance':
      return this.distance;
    default:
      return null;
  }
});

// Virtual for formatted record string
PersonalRecordSchema.virtual('formattedRecord').get(function() {
  switch (this.recordType) {
    case 'max_weight':
      return `${this.weight}kg`;
    case 'max_reps':
      return `${this.reps} reps`;
    case 'max_volume':
      return `${this.volume}kg total`;
    case 'one_rep_max':
      return `${this.oneRepMax}kg (1RM)`;
    case 'max_duration':
      return `${Math.floor(this.duration / 60)}:${(this.duration % 60).toString().padStart(2, '0')}`;
    case 'max_distance':
      return `${this.distance}m`;
    default:
      return 'Unknown';
  }
});

// Method to calculate one rep max using Epley formula
PersonalRecordSchema.methods.calculateOneRepMax = function() {
  if (!this.weight || !this.reps || this.reps === 1) {
    return this.weight || 0;
  }
  
  // Epley formula: 1RM = weight * (1 + reps/30)
  const oneRepMax = this.weight * (1 + this.reps / 30);
  this.oneRepMax = Math.round(oneRepMax * 10) / 10; // Round to 1 decimal place
  return this.oneRepMax;
};

// Method to calculate Wilks score (for powerlifting)
PersonalRecordSchema.methods.calculateWilksScore = function(gender = 'male') {
  if (!this.weight || !this.bodyWeight) return 0;
  
  // Simplified Wilks coefficient calculation
  const a = gender === 'male' ? -216.0475144 : -125.4255398;
  const b = gender === 'male' ? 16.2606339 : 13.71219419;
  const c = gender === 'male' ? -0.002388645 : -0.03307250;
  const d = gender === 'male' ? -0.00113732 : -0.0001050400;
  const e = gender === 'male' ? 7.01863E-06 : 9.38773E-06;
  const f = gender === 'male' ? -1.291E-08 : -2.3334E-08;
  
  const bw = this.bodyWeight;
  const coeff = 500 / (a + b * bw + c * Math.pow(bw, 2) + d * Math.pow(bw, 3) + e * Math.pow(bw, 4) + f * Math.pow(bw, 5));
  
  this.wilksScore = Math.round(this.weight * coeff * 100) / 100;
  return this.wilksScore;
};

// Method to calculate improvement percentage
PersonalRecordSchema.methods.calculateImprovement = function() {
  if (!this.previousRecord || !this.previousRecord.value) {
    this.improvement = 0;
    return 0;
  }
  
  const currentValue = this.value;
  const previousValue = this.previousRecord.value;
  
  if (previousValue === 0) {
    this.improvement = 100;
    return 100;
  }
  
  this.improvement = Math.round(((currentValue - previousValue) / previousValue) * 100 * 10) / 10;
  return this.improvement;
};

// Static method to get user's records for an exercise
PersonalRecordSchema.statics.getUserExerciseRecords = function(userId, exerciseId) {
  return this.find({ userId, exerciseId })
    .populate('exerciseId', 'name muscleGroup')
    .sort({ dateAchieved: -1 });
};

// Static method to get all user records
PersonalRecordSchema.statics.getAllUserRecords = function(userId, limit = 50) {
  return this.find({ userId })
    .populate('exerciseId', 'name muscleGroup category')
    .sort({ dateAchieved: -1 })
    .limit(limit);
};

// Static method to get recent PRs
PersonalRecordSchema.statics.getRecentPRs = function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.find({
    userId,
    dateAchieved: { $gte: startDate }
  })
  .populate('exerciseId', 'name muscleGroup')
  .sort({ dateAchieved: -1 });
};

// Static method to get leaderboard for exercise
PersonalRecordSchema.statics.getExerciseLeaderboard = function(exerciseId, recordType = 'max_weight', limit = 10) {
  const sortField = recordType === 'max_weight' ? 'weight' :
                   recordType === 'max_reps' ? 'reps' :
                   recordType === 'max_volume' ? 'volume' :
                   recordType === 'one_rep_max' ? 'oneRepMax' :
                   recordType === 'max_duration' ? 'duration' :
                   recordType === 'max_distance' ? 'distance' : 'weight';
  
  const sortQuery = {};
  sortQuery[sortField] = -1;
  
  return this.find({ exerciseId, recordType })
    .populate('userId', 'username profilePic')
    .populate('exerciseId', 'name')
    .sort(sortQuery)
    .limit(limit);
};

// Pre-save middleware to calculate derived values
PersonalRecordSchema.pre('save', function(next) {
  // Calculate volume if weight and reps are provided
  if (this.weight && this.reps) {
    this.volume = this.weight * this.reps;
  }
  
  // Calculate one rep max for strength records
  if (this.recordType === 'one_rep_max' || (this.weight && this.reps)) {
    this.calculateOneRepMax();
  }
  
  // Calculate improvement if previous record is provided
  if (this.previousRecord && this.previousRecord.value) {
    this.calculateImprovement();
  }
  
  next();
});

module.exports = mongoose.model('PersonalRecord', PersonalRecordSchema);
