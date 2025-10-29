# FitQuest Database Schema Design 🗄️

## Overview

This document outlines the complete database schema for FitQuest, including all collections, relationships, and data modeling decisions. The application uses MongoDB as the primary database with Mongoose as the ODM.

---

## 📊 Collections Overview

```
FitQuest Database
├── users              # User accounts and profiles
├── exercises           # Exercise library
├── workouts            # Workout templates
├── workout_sessions    # Individual workout logs
├── follows             # User follow relationships
├── activities          # Social activity feed
├── achievements        # User achievements
├── personal_records    # Personal record tracking
└── notifications       # User notifications
```

---

## 👤 Users Collection

**Collection Name:** `users`

```javascript
{
  _id: ObjectId,
  username: String,              // Unique username
  email: String,                 // Unique email address
  password: String,              // Hashed password
  profile: {
    firstName: String,
    lastName: String,
    dateOfBirth: Date,
    gender: String,              // "male", "female", "other", "prefer_not_to_say"
    height: Number,              // in centimeters
    weight: Number,              // in kilograms
    fitnessLevel: String,        // "beginner", "intermediate", "advanced"
    goals: [String],             // ["weight_loss", "muscle_gain", "endurance", "strength"]
    bio: String,
    profilePicture: String,      // Cloudinary URL
    location: String,
    timezone: String
  },
  preferences: {
    units: String,               // "metric" or "imperial"
    privacy: {
      profileVisibility: String, // "public", "friends", "private"
      workoutVisibility: String, // "public", "friends", "private"
      statsVisibility: String    // "public", "friends", "private"
    },
    notifications: {
      email: Boolean,
      push: Boolean,
      workout_reminders: Boolean,
      social_updates: Boolean,
      achievement_updates: Boolean
    }
  },
  stats: {
    totalWorkouts: Number,       // Default: 0
    totalExercises: Number,      // Default: 0
    totalWorkoutTime: Number,    // in minutes, Default: 0
    totalWeightLifted: Number,   // in kg, Default: 0
    streakDays: Number,          // Current streak, Default: 0
    longestStreak: Number,       // Best streak, Default: 0
    joinDate: Date,
    lastWorkout: Date
  },
  isActive: Boolean,             // Default: true
  isVerified: Boolean,           // Email verification, Default: false
  role: String,                  // "user", "admin", Default: "user"
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  verificationToken: String,
  lastLogin: Date,
  createdAt: Date,               // Default: Date.now
  updatedAt: Date                // Default: Date.now
}
```

### Indexes
```javascript
// Unique indexes
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ username: 1 }, { unique: true })

// Performance indexes
db.users.createIndex({ "stats.totalWorkouts": -1 })
db.users.createIndex({ "stats.totalWeightLifted": -1 })
db.users.createIndex({ createdAt: -1 })
```

---

## 🏋️ Exercises Collection

**Collection Name:** `exercises`

```javascript
{
  _id: ObjectId,
  name: String,                  // Exercise name
  description: String,           // Detailed description
  category: String,              // "chest", "back", "legs", "shoulders", "arms", "core", "cardio"
  subcategory: String,           // "biceps", "triceps", "quads", "hamstrings", etc.
  muscleGroups: {
    primary: [String],           // Primary muscles worked
    secondary: [String]          // Secondary muscles worked
  },
  equipment: [String],           // Required equipment
  difficulty: String,            // "beginner", "intermediate", "advanced"
  instructions: [String],        // Step-by-step instructions
  tips: [String],               // Exercise tips and form cues
  media: {
    images: [String],            // Cloudinary URLs
    videos: [String],            // Cloudinary URLs
    thumbnail: String            // Main thumbnail image
  },
  metrics: {
    trackWeight: Boolean,        // Can track weight
    trackReps: Boolean,          // Can track repetitions
    trackTime: Boolean,          // Can track time
    trackDistance: Boolean,      // Can track distance
    trackCalories: Boolean       // Can track calories
  },
  variations: [ObjectId],        // References to exercise variations
  tags: [String],               // Additional tags for searching
  isCustom: Boolean,            // User-created exercise
  createdBy: ObjectId,          // User who created (if custom)
  isApproved: Boolean,          // Admin approval for custom exercises
  usageCount: Number,           // How many times used
  rating: {
    average: Number,            // Average rating
    count: Number               // Number of ratings
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes
```javascript
// Search indexes
db.exercises.createIndex({ name: "text", description: "text", tags: "text" })
db.exercises.createIndex({ category: 1, subcategory: 1 })
db.exercises.createIndex({ "muscleGroups.primary": 1 })
db.exercises.createIndex({ difficulty: 1 })
db.exercises.createIndex({ equipment: 1 })
db.exercises.createIndex({ usageCount: -1 })
```

---

## 💪 Workouts Collection

**Collection Name:** `workouts`

```javascript
{
  _id: ObjectId,
  name: String,                  // Workout name
  description: String,           // Workout description
  creator: ObjectId,             // Reference to User
  type: String,                  // "strength", "cardio", "hybrid", "flexibility"
  difficulty: String,            // "beginner", "intermediate", "advanced"
  estimatedDuration: Number,     // in minutes
  targetMuscleGroups: [String],  // Primary muscle groups
  equipment: [String],           // Required equipment
  exercises: [{
    exercise: ObjectId,          // Reference to Exercise
    order: Number,               // Exercise order in workout
    sets: [{
      type: String,              // "working", "warmup", "dropset", "superset"
      targetReps: {
        min: Number,
        max: Number
      },
      targetWeight: Number,      // in kg
      targetTime: Number,        // in seconds
      targetDistance: Number,    // in meters
      restTime: Number,          // rest between sets in seconds
      notes: String
    }],
    superset: Boolean,           // Part of superset
    supersetGroup: Number        // Superset group identifier
  }],
  tags: [String],
  isTemplate: Boolean,           // Is this a reusable template
  isPublic: Boolean,             // Can others see/copy this workout
  likes: Number,                 // Like count
  uses: Number,                  // How many times used
  rating: {
    average: Number,
    count: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes
```javascript
db.workouts.createIndex({ creator: 1, createdAt: -1 })
db.workouts.createIndex({ type: 1, difficulty: 1 })
db.workouts.createIndex({ isPublic: 1, likes: -1 })
db.workouts.createIndex({ name: "text", description: "text", tags: "text" })
db.workouts.createIndex({ targetMuscleGroups: 1 })
```

---

## 📋 Workout Sessions Collection

**Collection Name:** `workout_sessions`

```javascript
{
  _id: ObjectId,
  user: ObjectId,                // Reference to User
  workout: ObjectId,             // Reference to Workout (optional for freestyle)
  name: String,                  // Session name
  date: Date,                    // Workout date
  startTime: Date,               // When workout started
  endTime: Date,                 // When workout ended
  duration: Number,              // Total duration in minutes
  exercises: [{
    exercise: ObjectId,          // Reference to Exercise
    order: Number,               // Exercise order
    sets: [{
      setNumber: Number,
      reps: Number,              // Actual reps performed
      weight: Number,            // Weight used (kg)
      time: Number,              // Time taken (seconds)
      distance: Number,          // Distance covered (meters)
      calories: Number,          // Calories burned
      restTime: Number,          // Rest time after set
      rpe: Number,               // Rate of Perceived Exertion (1-10)
      notes: String,
      isPersonalRecord: Boolean,
      completedAt: Date
    }],
    totalVolume: Number,         // Total weight * reps
    personalRecords: [String],   // PR types achieved ["max_weight", "max_reps", "max_volume"]
    notes: String
  }],
  totals: {
    totalSets: Number,
    totalReps: Number,
    totalWeight: Number,         // Total weight lifted
    totalVolume: Number,         // Total volume (weight * reps)
    totalCalories: Number,
    averageRpe: Number
  },
  bodyWeight: Number,            // User's weight on workout day
  mood: String,                  // "excellent", "good", "okay", "poor"
  energy: String,                // "high", "medium", "low"
  notes: String,                 // Overall workout notes
  location: String,
  isCompleted: Boolean,          // Default: false
  templateUsed: ObjectId,        // Reference to original workout template
  weather: String,               // For outdoor workouts
  tags: [String],
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes
```javascript
db.workout_sessions.createIndex({ user: 1, date: -1 })
db.workout_sessions.createIndex({ user: 1, isCompleted: 1, date: -1 })
db.workout_sessions.createIndex({ workout: 1, date: -1 })
db.workout_sessions.createIndex({ "exercises.exercise": 1, date: -1 })
db.workout_sessions.createIndex({ createdAt: -1 })
```

---

## 👥 Follows Collection

**Collection Name:** `follows`

```javascript
{
  _id: ObjectId,
  follower: ObjectId,            // User who is following
  following: ObjectId,           // User being followed
  status: String,                // "pending", "accepted", "blocked"
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes
```javascript
db.follows.createIndex({ follower: 1, following: 1 }, { unique: true })
db.follows.createIndex({ follower: 1, status: 1 })
db.follows.createIndex({ following: 1, status: 1 })
```

---

## 📰 Activities Collection

**Collection Name:** `activities`

```javascript
{
  _id: ObjectId,
  user: ObjectId,                // User who performed the activity
  type: String,                  // "workout_completed", "pr_achieved", "workout_shared", "followed_user"
  data: {
    workout: ObjectId,           // Reference to workout (if applicable)
    workoutSession: ObjectId,    // Reference to workout session
    exercise: ObjectId,          // Reference to exercise (for PRs)
    achievement: ObjectId,       // Reference to achievement
    followedUser: ObjectId,      // Reference to followed user
    personalRecord: {
      type: String,              // "max_weight", "max_reps", "max_volume"
      value: Number,
      previous: Number
    },
    message: String              // Custom message
  },
  visibility: String,            // "public", "friends", "private"
  likes: [ObjectId],            // Array of user IDs who liked
  comments: [{
    user: ObjectId,
    text: String,
    createdAt: Date
  }],
  createdAt: Date
}
```

### Indexes
```javascript
db.activities.createIndex({ user: 1, createdAt: -1 })
db.activities.createIndex({ type: 1, createdAt: -1 })
db.activities.createIndex({ visibility: 1, createdAt: -1 })
db.activities.createIndex({ createdAt: -1 })
```

---

## 🏆 Achievements Collection

**Collection Name:** `achievements`

```javascript
{
  _id: ObjectId,
  user: ObjectId,                // User who earned the achievement
  type: String,                  // "workout_streak", "weight_milestone", "volume_milestone", "exercise_master"
  name: String,                  // Achievement name
  description: String,           // Achievement description
  icon: String,                  // Icon identifier
  category: String,              // "consistency", "strength", "endurance", "social"
  tier: String,                  // "bronze", "silver", "gold", "platinum"
  criteria: {
    metric: String,              // "streak_days", "total_weight", "total_workouts"
    value: Number,               // Target value
    exercise: ObjectId           // Specific exercise (if applicable)
  },
  progress: {
    current: Number,
    target: Number,
    percentage: Number
  },
  earnedAt: Date,
  isUnlocked: Boolean,
  points: Number,                // Points awarded
  createdAt: Date
}
```

### Indexes
```javascript
db.achievements.createIndex({ user: 1, earnedAt: -1 })
db.achievements.createIndex({ user: 1, category: 1 })
db.achievements.createIndex({ type: 1, tier: 1 })
```

---

## 📈 Personal Records Collection

**Collection Name:** `personal_records`

```javascript
{
  _id: ObjectId,
  user: ObjectId,                // Reference to User
  exercise: ObjectId,            // Reference to Exercise
  type: String,                  // "max_weight", "max_reps", "max_volume", "max_time", "max_distance"
  value: Number,                 // Record value
  previousValue: Number,         // Previous record
  workoutSession: ObjectId,      // When this PR was achieved
  date: Date,                    // When achieved
  bodyWeight: Number,            // User's weight when PR was set
  notes: String,                 // Notes about the PR
  isActive: Boolean,             // Is this the current PR
  createdAt: Date
}
```

### Indexes
```javascript
db.personal_records.createIndex({ user: 1, exercise: 1, type: 1 })
db.personal_records.createIndex({ user: 1, date: -1 })
db.personal_records.createIndex({ exercise: 1, type: 1, value: -1 })
```

---

## 🔔 Notifications Collection

**Collection Name:** `notifications`

```javascript
{
  _id: ObjectId,
  recipient: ObjectId,           // User receiving the notification
  sender: ObjectId,              // User who triggered the notification (optional)
  type: String,                  // "follow_request", "workout_like", "achievement", "reminder"
  title: String,                 // Notification title
  message: String,               // Notification message
  data: {
    workout: ObjectId,
    activity: ObjectId,
    achievement: ObjectId,
    followRequest: ObjectId
  },
  isRead: Boolean,               // Default: false
  readAt: Date,
  priority: String,              // "low", "normal", "high"
  expiresAt: Date,              // Auto-delete date
  createdAt: Date
}
```

### Indexes
```javascript
db.notifications.createIndex({ recipient: 1, isRead: 1, createdAt: -1 })
db.notifications.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
```

---

## 🔗 Relationships & References

### User Relationships
- User → Workouts (One-to-Many)
- User → Workout Sessions (One-to-Many)
- User → Follows (Many-to-Many via junction table)
- User → Activities (One-to-Many)
- User → Achievements (One-to-Many)
- User → Personal Records (One-to-Many)
- User → Notifications (One-to-Many)

### Workout Relationships
- Workout → Exercises (Many-to-Many with embedded details)
- Workout → Workout Sessions (One-to-Many)
- Workout → Activities (One-to-Many)

### Exercise Relationships
- Exercise → Workouts (Many-to-Many)
- Exercise → Workout Sessions (Many-to-Many)
- Exercise → Personal Records (One-to-Many)

---

## 🚀 Performance Considerations

### Indexing Strategy
1. **Composite Indexes**: For frequently queried field combinations
2. **Text Indexes**: For search functionality across exercises and workouts
3. **TTL Indexes**: For automatic cleanup of expired notifications
4. **Partial Indexes**: For filtered queries (e.g., only active users)

### Data Aggregation
1. **User Stats**: Pre-calculated and updated via triggers
2. **Exercise Popularity**: Maintained as counters
3. **Leaderboards**: Cached and updated periodically
4. **Activity Feeds**: Optimized for timeline queries

### Scaling Considerations
1. **Sharding**: Plan for horizontal scaling by user ID
2. **Read Replicas**: For analytics and reporting queries
3. **Caching**: Redis for frequently accessed data
4. **Archiving**: Move old workout sessions to archive collections

---

## 🔐 Security & Privacy

### Data Protection
- Password hashing using bcryptjs
- JWT token-based authentication
- Input validation on all fields
- Rate limiting on sensitive operations

### Privacy Controls
- User-configurable privacy settings
- Data anonymization for analytics
- GDPR compliance for data deletion
- Audit trails for sensitive operations

---

## 📊 Sample Queries

### Common Queries

**Get User's Recent Workouts:**
```javascript
db.workout_sessions.find({
  user: ObjectId("..."),
  isCompleted: true
}).sort({ date: -1 }).limit(10)
```

**Find Popular Exercises:**
```javascript
db.exercises.find().sort({ usageCount: -1 }).limit(20)
```

**Get User's Personal Records:**
```javascript
db.personal_records.find({
  user: ObjectId("..."),
  isActive: true
}).populate('exercise')
```

**Activity Feed for Followed Users:**
```javascript
db.activities.aggregate([
  {
    $lookup: {
      from: "follows",
      localField: "user",
      foreignField: "following",
      as: "follow_relationship"
    }
  },
  {
    $match: {
      "follow_relationship.follower": ObjectId("..."),
      "follow_relationship.status": "accepted",
      visibility: { $in: ["public", "friends"] }
    }
  },
  { $sort: { createdAt: -1 } },
  { $limit: 50 }
])
```

---

**This schema design provides a solid foundation for the FitQuest application while maintaining flexibility for future enhancements.**
