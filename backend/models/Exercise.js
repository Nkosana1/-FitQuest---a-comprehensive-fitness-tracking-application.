const mongoose = require('mongoose');

const ExerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add an exercise name'],
    maxlength: [100, 'Name cannot exceed 100 characters'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Please add an exercise description'],
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
    trim: true
  },
  muscleGroup: [{
    type: String,
    required: [true, 'Please specify muscle groups'],
    enum: ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms', 'abs', 'obliques', 'quads', 'hamstrings', 'calves', 'glutes', 'full_body']
  }],
  equipment: [{
    type: String,
    required: [true, 'Please specify required equipment'],
    enum: ['dumbbells', 'barbell', 'kettlebell', 'resistance_bands', 'pull_up_bar', 'bench', 'treadmill', 'stationary_bike', 'rowing_machine', 'bodyweight', 'cable_machine', 'smith_machine', 'other']
  }],
  demoVideo: {
    type: String, // Cloudinary URL or YouTube URL
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Exercise must have a creator']
  },
  category: {
    type: String,
    required: [true, 'Please specify exercise category'],
    enum: ['strength', 'cardio', 'flexibility', 'balance', 'plyometric', 'sports']
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  instructions: [{
    step: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      required: true,
      maxlength: [500, 'Instruction step cannot exceed 500 characters']
    }
  }],
  tips: [{
    type: String,
    maxlength: [300, 'Tip cannot exceed 300 characters']
  }],
  images: [{
    type: String // Cloudinary URLs
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  variations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exercise'
  }],
  metrics: {
    trackWeight: {
      type: Boolean,
      default: true
    },
    trackReps: {
      type: Boolean,
      default: true
    },
    trackTime: {
      type: Boolean,
      default: false
    },
    trackDistance: {
      type: Boolean,
      default: false
    }
  },
  averageRating: {
    type: Number,
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot exceed 5'],
    default: 0
  },
  totalRatings: {
    type: Number,
    default: 0,
    min: [0, 'Total ratings cannot be negative']
  },
  timesUsed: {
    type: Number,
    default: 0,
    min: [0, 'Times used cannot be negative']
  },
  caloriesBurnedPerMinute: {
    type: Number,
    min: [0, 'Calories cannot be negative'],
    default: 5 // Base estimate
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
ExerciseSchema.index({ name: 'text', description: 'text', tags: 'text' });
ExerciseSchema.index({ muscleGroup: 1 });
ExerciseSchema.index({ equipment: 1 });
ExerciseSchema.index({ category: 1, difficulty: 1 });
ExerciseSchema.index({ isPublic: 1, isApproved: 1 });
ExerciseSchema.index({ averageRating: -1, timesUsed: -1 });
ExerciseSchema.index({ createdBy: 1, createdAt: -1 });

// Virtual for primary muscle group
ExerciseSchema.virtual('primaryMuscleGroup').get(function() {
  return this.muscleGroup && this.muscleGroup.length > 0 ? this.muscleGroup[0] : null;
});

// Method to increment usage count
ExerciseSchema.methods.incrementUsage = async function() {
  this.timesUsed += 1;
  return await this.save();
});

// Method to add rating
ExerciseSchema.methods.addRating = async function(rating) {
  if (rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }
  
  const totalScore = this.averageRating * this.totalRatings + rating;
  this.totalRatings += 1;
  this.averageRating = totalScore / this.totalRatings;
  
  return await this.save();
};

// Method to check if exercise requires equipment
ExerciseSchema.methods.requiresEquipment = function() {
  return !this.equipment.includes('bodyweight');
};

// Method to get formatted instructions
ExerciseSchema.methods.getFormattedInstructions = function() {
  return this.instructions
    .sort((a, b) => a.step - b.step)
    .map(instruction => `${instruction.step}. ${instruction.description}`);
};

// Static method to find exercises by muscle group
ExerciseSchema.statics.findByMuscleGroup = function(muscleGroup) {
  return this.find({
    muscleGroup: { $in: [muscleGroup] },
    isPublic: true,
    isApproved: true
  }).sort({ averageRating: -1, timesUsed: -1 });
};

// Static method to find exercises by equipment
ExerciseSchema.statics.findByEquipment = function(equipment) {
  return this.find({
    equipment: { $in: equipment },
    isPublic: true,
    isApproved: true
  }).sort({ averageRating: -1, timesUsed: -1 });
};

// Static method to get popular exercises
ExerciseSchema.statics.getPopular = function(limit = 10) {
  return this.find({
    isPublic: true,
    isApproved: true
  })
  .sort({ timesUsed: -1, averageRating: -1 })
  .limit(limit);
};

module.exports = mongoose.model('Exercise', ExerciseSchema);
