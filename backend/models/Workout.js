const mongoose = require('mongoose');

const WorkoutSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a workout title'],
    maxlength: [100, 'Title cannot exceed 100 characters'],
    trim: true
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Workout must have a creator']
  },
  exercises: [{
    exercise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exercise',
      required: true
    },
    sets: {
      type: Number,
      required: true,
      min: [1, 'Must have at least 1 set']
    },
    reps: {
      type: Number,
      min: [1, 'Must have at least 1 rep']
    },
    weight: {
      type: Number,
      min: [0, 'Weight cannot be negative']
    },
    duration: {
      type: Number, // in seconds
      min: [0, 'Duration cannot be negative']
    },
    restTime: {
      type: Number, // in seconds
      default: 60,
      min: [0, 'Rest time cannot be negative']
    },
    notes: {
      type: String,
      maxlength: [500, 'Exercise notes cannot exceed 500 characters']
    },
    order: {
      type: Number,
      required: true,
      min: [1, 'Exercise order must be at least 1']
    }
  }],
  duration: {
    type: Number, // estimated duration in minutes
    min: [1, 'Duration must be at least 1 minute'],
    max: [300, 'Duration cannot exceed 300 minutes']
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: [true, 'Please specify workout difficulty']
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  category: {
    type: String,
    enum: ['strength', 'cardio', 'flexibility', 'sports', 'mixed'],
    default: 'mixed'
  },
  targetMuscleGroups: [{
    type: String,
    enum: ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms', 'abs', 'obliques', 'quads', 'hamstrings', 'calves', 'glutes', 'full_body']
  }],
  equipment: [{
    type: String,
    enum: ['dumbbells', 'barbell', 'kettlebell', 'resistance_bands', 'pull_up_bar', 'bench', 'treadmill', 'stationary_bike', 'rowing_machine', 'bodyweight', 'other']
  }],
  tags: [{
    type: String,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  timesUsed: {
    type: Number,
    default: 0,
    min: [0, 'Times used cannot be negative']
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
  isTemplate: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
WorkoutSchema.index({ createdBy: 1, createdAt: -1 });
WorkoutSchema.index({ isPublic: 1, averageRating: -1 });
WorkoutSchema.index({ difficulty: 1, category: 1 });
WorkoutSchema.index({ targetMuscleGroups: 1 });
WorkoutSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Virtual for like count
WorkoutSchema.virtual('likeCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

// Virtual for exercise count
WorkoutSchema.virtual('exerciseCount').get(function() {
  return this.exercises ? this.exercises.length : 0;
});

// Method to check if user liked this workout
WorkoutSchema.methods.hasUserLiked = function(userId) {
  return this.likes.includes(userId);
};

// Method to toggle like
WorkoutSchema.methods.toggleLike = async function(userId) {
  const userIndex = this.likes.indexOf(userId);
  
  if (userIndex === -1) {
    this.likes.push(userId);
  } else {
    this.likes.splice(userIndex, 1);
  }
  
  return await this.save();
};

// Method to calculate estimated calories burned
WorkoutSchema.methods.estimateCalories = function(userWeight = 70) {
  // Simple estimation based on duration and intensity
  let baseCaloriesPerMinute = 5; // Base rate
  
  switch (this.difficulty) {
    case 'beginner':
      baseCaloriesPerMinute = 4;
      break;
    case 'intermediate':
      baseCaloriesPerMinute = 6;
      break;
    case 'advanced':
      baseCaloriesPerMinute = 8;
      break;
  }
  
  // Adjust for body weight (70kg baseline)
  const weightFactor = userWeight / 70;
  const totalCalories = this.duration * baseCaloriesPerMinute * weightFactor;
  
  return Math.round(totalCalories);
};

module.exports = mongoose.model('Workout', WorkoutSchema);
