const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please add a username'],
    unique: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [20, 'Username cannot exceed 20 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false // Don't include password in queries by default
  },
  profilePic: {
    type: String, // Cloudinary URL
    default: ''
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    default: ''
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  profile: {
    firstName: {
      type: String,
      maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
      type: String,
      maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    dateOfBirth: {
      type: Date
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say'],
      default: 'prefer_not_to_say'
    },
    height: {
      type: Number, // in centimeters
      min: [50, 'Height must be realistic'],
      max: [300, 'Height must be realistic']
    },
    weight: {
      type: Number, // in kilograms
      min: [20, 'Weight must be realistic'],
      max: [500, 'Weight must be realistic']
    },
    fitnessLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    },
    goals: [{
      type: String,
      enum: ['weight_loss', 'muscle_gain', 'endurance', 'strength', 'flexibility', 'general_fitness']
    }],
    location: {
      type: String,
      maxlength: [100, 'Location cannot exceed 100 characters']
    },
    timezone: {
      type: String,
      default: 'UTC'
    }
  },
  preferences: {
    units: {
      type: String,
      enum: ['metric', 'imperial'],
      default: 'metric'
    },
    privacy: {
      profileVisibility: {
        type: String,
        enum: ['public', 'friends', 'private'],
        default: 'public'
      },
      workoutVisibility: {
        type: String,
        enum: ['public', 'friends', 'private'],
        default: 'friends'
      },
      statsVisibility: {
        type: String,
        enum: ['public', 'friends', 'private'],
        default: 'friends'
      }
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      workoutReminders: {
        type: Boolean,
        default: true
      },
      socialUpdates: {
        type: Boolean,
        default: true
      },
      achievementUpdates: {
        type: Boolean,
        default: true
      }
    }
  },
  stats: {
    totalWorkouts: {
      type: Number,
      default: 0
    },
    totalExercises: {
      type: Number,
      default: 0
    },
    totalWorkoutTime: {
      type: Number, // in minutes
      default: 0
    },
    totalWeightLifted: {
      type: Number, // in kg
      default: 0
    },
    streakDays: {
      type: Number,
      default: 0
    },
    longestStreak: {
      type: Number,
      default: 0
    },
    joinDate: {
      type: Date,
      default: Date.now
    },
    lastWorkout: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  verificationToken: String,
  lastLogin: Date
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.resetPasswordToken;
      delete ret.resetPasswordExpires;
      delete ret.verificationToken;
      return ret;
    }
  }
});

// Indexes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ username: 1 }, { unique: true });
UserSchema.index({ 'stats.totalWorkouts': -1 });
UserSchema.index({ 'stats.totalWeightLifted': -1 });
UserSchema.index({ createdAt: -1 });

// Encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d'
  });
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
UserSchema.methods.getResetPasswordToken = function() {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire
  this.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

// Generate email verification token
UserSchema.methods.getEmailVerificationToken = function() {
  const verificationToken = crypto.randomBytes(20).toString('hex');
  
  this.verificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  return verificationToken;
};

// Calculate age
UserSchema.virtual('profile.age').get(function() {
  if (!this.profile.dateOfBirth) return null;
  
  const today = new Date();
  const birthDate = new Date(this.profile.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// Calculate BMI
UserSchema.virtual('profile.bmi').get(function() {
  if (!this.profile.height || !this.profile.weight) return null;
  
  const heightInMeters = this.profile.height / 100;
  return Math.round((this.profile.weight / (heightInMeters * heightInMeters)) * 10) / 10;
});

// Get full name
UserSchema.virtual('profile.fullName').get(function() {
  return `${this.profile.firstName} ${this.profile.lastName}`;
});

module.exports = mongoose.model('User', UserSchema);
