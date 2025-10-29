# FitQuest API Documentation 🚀

## Overview

This document provides comprehensive documentation for all FitQuest API endpoints. The API follows RESTful principles and uses JSON for request/response payloads.

**Base URL:** `https://api.fitquest.com/api/v1`  
**Development URL:** `http://localhost:5000/api/v1`

---

## 🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

### Rate Limiting
- **General endpoints**: 100 requests per hour per IP
- **Auth endpoints**: 5 requests per minute per IP
- **Upload endpoints**: 10 requests per hour per user

---

## 📋 API Endpoints Overview

```
Authentication       /auth/*
Users               /users/*
Exercises           /exercises/*
Workouts            /workouts/*
Workout Sessions    /sessions/*
Social Features     /social/*
Analytics           /analytics/*
Uploads             /uploads/*
Notifications       /notifications/*
```

---

## 🔑 Authentication Endpoints

### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "username": "string (required, 3-20 chars)",
  "email": "string (required, valid email)",
  "password": "string (required, min 8 chars)",
  "firstName": "string (required)",
  "lastName": "string (required)",
  "dateOfBirth": "date (required)",
  "gender": "string (optional: male|female|other|prefer_not_to_say)"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "jwt_token",
    "user": {
      "_id": "user_id",
      "username": "username",
      "email": "email",
      "profile": { ... },
      "isVerified": false
    }
  }
}
```

**Errors:**
- `400`: Validation errors
- `409`: Email or username already exists

---

### POST /auth/login
Authenticate user and return JWT token.

**Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt_token",
    "user": { ... }
  }
}
```

**Errors:**
- `400`: Missing credentials
- `401`: Invalid credentials
- `403`: Account not verified/suspended

---

### POST /auth/logout
Logout user and invalidate token.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### POST /auth/forgot-password
Request password reset email.

**Request Body:**
```json
{
  "email": "string (required)"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

---

### POST /auth/reset-password
Reset password using token from email.

**Request Body:**
```json
{
  "token": "string (required)",
  "password": "string (required, min 8 chars)"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

---

### POST /auth/verify-email
Verify email address using token.

**Request Body:**
```json
{
  "token": "string (required)"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

---

## 👤 User Endpoints

### GET /users/profile
Get current user's profile.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "username": "username",
    "email": "email",
    "profile": {
      "firstName": "string",
      "lastName": "string",
      "dateOfBirth": "date",
      "gender": "string",
      "height": "number",
      "weight": "number",
      "fitnessLevel": "string",
      "goals": ["array"],
      "bio": "string",
      "profilePicture": "string",
      "location": "string"
    },
    "stats": {
      "totalWorkouts": "number",
      "totalExercises": "number",
      "totalWorkoutTime": "number",
      "streakDays": "number"
    },
    "preferences": { ... }
  }
}
```

---

### PUT /users/profile
Update user profile.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "profile": {
    "firstName": "string (optional)",
    "lastName": "string (optional)",
    "height": "number (optional)",
    "weight": "number (optional)",
    "fitnessLevel": "string (optional)",
    "goals": "array (optional)",
    "bio": "string (optional)",
    "location": "string (optional)"
  },
  "preferences": {
    "units": "string (optional)",
    "privacy": { ... },
    "notifications": { ... }
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": { ... }
}
```

---

### GET /users/:userId
Get public user profile.

**Parameters:**
- `userId`: User ID

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "username": "username",
    "profile": { ... },
    "stats": { ... },
    "isFollowing": "boolean",
    "followersCount": "number",
    "followingCount": "number"
  }
}
```

---

### GET /users/search
Search for users.

**Query Parameters:**
- `q`: Search query (username, name)
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20, max: 50)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "_id": "user_id",
        "username": "username",
        "profile": {
          "firstName": "string",
          "lastName": "string",
          "profilePicture": "string"
        },
        "stats": {
          "totalWorkouts": "number"
        },
        "isFollowing": "boolean"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalUsers": 100,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

## 🏋️ Exercise Endpoints

### GET /exercises
Get paginated list of exercises.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20, max: 50)
- `category`: Filter by category
- `muscle`: Filter by muscle group
- `equipment`: Filter by equipment
- `difficulty`: Filter by difficulty
- `search`: Search query

**Response (200):**
```json
{
  "success": true,
  "data": {
    "exercises": [
      {
        "_id": "exercise_id",
        "name": "string",
        "description": "string",
        "category": "string",
        "muscleGroups": {
          "primary": ["array"],
          "secondary": ["array"]
        },
        "equipment": ["array"],
        "difficulty": "string",
        "media": {
          "thumbnail": "string",
          "images": ["array"],
          "videos": ["array"]
        },
        "rating": {
          "average": "number",
          "count": "number"
        }
      }
    ],
    "pagination": { ... },
    "filters": {
      "categories": ["array"],
      "muscleGroups": ["array"],
      "equipment": ["array"],
      "difficulties": ["array"]
    }
  }
}
```

---

### GET /exercises/:exerciseId
Get detailed exercise information.

**Parameters:**
- `exerciseId`: Exercise ID

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "exercise_id",
    "name": "string",
    "description": "string",
    "category": "string",
    "subcategory": "string",
    "muscleGroups": { ... },
    "equipment": ["array"],
    "difficulty": "string",
    "instructions": ["array"],
    "tips": ["array"],
    "media": { ... },
    "metrics": {
      "trackWeight": "boolean",
      "trackReps": "boolean",
      "trackTime": "boolean",
      "trackDistance": "boolean"
    },
    "variations": ["array"],
    "personalRecords": [
      {
        "type": "string",
        "value": "number",
        "date": "date"
      }
    ]
  }
}
```

---

### POST /exercises
Create a new custom exercise.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "string (required)",
  "description": "string (required)",
  "category": "string (required)",
  "subcategory": "string (optional)",
  "muscleGroups": {
    "primary": ["array (required)"],
    "secondary": ["array (optional)"]
  },
  "equipment": ["array (optional)"],
  "difficulty": "string (required)",
  "instructions": ["array (required)"],
  "tips": ["array (optional)"],
  "metrics": {
    "trackWeight": "boolean (default: true)",
    "trackReps": "boolean (default: true)",
    "trackTime": "boolean (default: false)",
    "trackDistance": "boolean (default: false)"
  },
  "tags": ["array (optional)"]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Exercise created successfully",
  "data": { ... }
}
```

---

### GET /exercises/categories
Get all exercise categories and muscle groups.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "name": "string",
        "subcategories": ["array"]
      }
    ],
    "muscleGroups": {
      "upper": ["array"],
      "lower": ["array"],
      "core": ["array"]
    },
    "equipment": ["array"],
    "difficulties": ["array"]
  }
}
```

---

## 💪 Workout Endpoints

### GET /workouts
Get user's workouts and public templates.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20, max: 50)
- `type`: Filter by workout type
- `difficulty`: Filter by difficulty
- `duration`: Filter by duration range
- `muscle`: Filter by muscle groups
- `public`: Only public templates (true/false)
- `templates`: Only templates (true/false)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "workouts": [
      {
        "_id": "workout_id",
        "name": "string",
        "description": "string",
        "type": "string",
        "difficulty": "string",
        "estimatedDuration": "number",
        "targetMuscleGroups": ["array"],
        "equipment": ["array"],
        "exerciseCount": "number",
        "creator": {
          "_id": "user_id",
          "username": "string",
          "profile": {
            "firstName": "string",
            "lastName": "string"
          }
        },
        "isTemplate": "boolean",
        "isPublic": "boolean",
        "likes": "number",
        "uses": "number",
        "rating": {
          "average": "number",
          "count": "number"
        },
        "createdAt": "date"
      }
    ],
    "pagination": { ... }
  }
}
```

---

### GET /workouts/:workoutId
Get detailed workout information.

**Parameters:**
- `workoutId`: Workout ID

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "workout_id",
    "name": "string",
    "description": "string",
    "creator": { ... },
    "type": "string",
    "difficulty": "string",
    "estimatedDuration": "number",
    "targetMuscleGroups": ["array"],
    "equipment": ["array"],
    "exercises": [
      {
        "exercise": {
          "_id": "exercise_id",
          "name": "string",
          "media": { ... }
        },
        "order": "number",
        "sets": [
          {
            "type": "string",
            "targetReps": {
              "min": "number",
              "max": "number"
            },
            "targetWeight": "number",
            "targetTime": "number",
            "restTime": "number",
            "notes": "string"
          }
        ],
        "superset": "boolean",
        "supersetGroup": "number"
      }
    ],
    "tags": ["array"],
    "isTemplate": "boolean",
    "isPublic": "boolean",
    "likes": "number",
    "uses": "number",
    "rating": { ... },
    "hasLiked": "boolean",
    "canEdit": "boolean"
  }
}
```

---

### POST /workouts
Create a new workout.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "string (required)",
  "description": "string (optional)",
  "type": "string (required)",
  "difficulty": "string (required)",
  "estimatedDuration": "number (optional)",
  "exercises": [
    {
      "exercise": "string (exercise_id, required)",
      "order": "number (required)",
      "sets": [
        {
          "type": "string (default: working)",
          "targetReps": {
            "min": "number (optional)",
            "max": "number (optional)"
          },
          "targetWeight": "number (optional)",
          "targetTime": "number (optional)",
          "restTime": "number (optional)",
          "notes": "string (optional)"
        }
      ],
      "superset": "boolean (default: false)",
      "supersetGroup": "number (optional)"
    }
  ],
  "tags": ["array (optional)"],
  "isTemplate": "boolean (default: false)",
  "isPublic": "boolean (default: false)"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Workout created successfully",
  "data": { ... }
}
```

---

### PUT /workouts/:workoutId
Update an existing workout.

**Headers:** `Authorization: Bearer <token>`
**Parameters:** `workoutId`: Workout ID

**Request Body:** Same as POST /workouts

**Response (200):**
```json
{
  "success": true,
  "message": "Workout updated successfully",
  "data": { ... }
}
```

---

### DELETE /workouts/:workoutId
Delete a workout.

**Headers:** `Authorization: Bearer <token>`
**Parameters:** `workoutId`: Workout ID

**Response (200):**
```json
{
  "success": true,
  "message": "Workout deleted successfully"
}
```

---

### POST /workouts/:workoutId/like
Like/unlike a workout.

**Headers:** `Authorization: Bearer <token>`
**Parameters:** `workoutId`: Workout ID

**Response (200):**
```json
{
  "success": true,
  "message": "Workout liked successfully",
  "data": {
    "liked": "boolean",
    "likesCount": "number"
  }
}
```

---

## 📊 Workout Session Endpoints

### GET /sessions
Get user's workout sessions.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20, max: 50)
- `startDate`: Filter from date
- `endDate`: Filter to date
- `completed`: Filter by completion status
- `exercise`: Filter by specific exercise

**Response (200):**
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "_id": "session_id",
        "name": "string",
        "date": "date",
        "duration": "number",
        "exerciseCount": "number",
        "totalSets": "number",
        "totalVolume": "number",
        "isCompleted": "boolean",
        "workout": {
          "_id": "workout_id",
          "name": "string"
        },
        "personalRecords": ["array"]
      }
    ],
    "pagination": { ... },
    "stats": {
      "totalSessions": "number",
      "totalDuration": "number",
      "totalVolume": "number",
      "averageDuration": "number"
    }
  }
}
```

---

### GET /sessions/:sessionId
Get detailed workout session.

**Headers:** `Authorization: Bearer <token>`
**Parameters:** `sessionId`: Session ID

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "session_id",
    "name": "string",
    "date": "date",
    "startTime": "date",
    "endTime": "date",
    "duration": "number",
    "exercises": [
      {
        "exercise": {
          "_id": "exercise_id",
          "name": "string",
          "media": { ... }
        },
        "order": "number",
        "sets": [
          {
            "setNumber": "number",
            "reps": "number",
            "weight": "number",
            "time": "number",
            "restTime": "number",
            "rpe": "number",
            "notes": "string",
            "isPersonalRecord": "boolean",
            "completedAt": "date"
          }
        ],
        "totalVolume": "number",
        "personalRecords": ["array"],
        "notes": "string"
      }
    ],
    "totals": {
      "totalSets": "number",
      "totalReps": "number",
      "totalWeight": "number",
      "totalVolume": "number",
      "averageRpe": "number"
    },
    "bodyWeight": "number",
    "mood": "string",
    "energy": "string",
    "notes": "string",
    "isCompleted": "boolean"
  }
}
```

---

### POST /sessions
Start a new workout session.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "string (required)",
  "workout": "string (workout_id, optional)",
  "date": "date (optional, defaults to now)",
  "exercises": [
    {
      "exercise": "string (exercise_id, required)",
      "order": "number (required)",
      "sets": [
        {
          "targetReps": {
            "min": "number",
            "max": "number"
          },
          "targetWeight": "number",
          "targetTime": "number",
          "restTime": "number"
        }
      ]
    }
  ],
  "bodyWeight": "number (optional)",
  "notes": "string (optional)"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Workout session started",
  "data": { ... }
}
```

---

### PUT /sessions/:sessionId
Update workout session progress.

**Headers:** `Authorization: Bearer <token>`
**Parameters:** `sessionId`: Session ID

**Request Body:**
```json
{
  "exercises": [
    {
      "exercise": "string (exercise_id)",
      "sets": [
        {
          "setNumber": "number",
          "reps": "number",
          "weight": "number",
          "time": "number",
          "rpe": "number",
          "notes": "string",
          "completedAt": "date"
        }
      ],
      "notes": "string"
    }
  ],
  "mood": "string",
  "energy": "string",
  "notes": "string",
  "isCompleted": "boolean"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Session updated successfully",
  "data": { ... }
}
```

---

### POST /sessions/:sessionId/complete
Complete a workout session.

**Headers:** `Authorization: Bearer <token>`
**Parameters:** `sessionId`: Session ID

**Response (200):**
```json
{
  "success": true,
  "message": "Workout session completed",
  "data": {
    "session": { ... },
    "personalRecords": [
      {
        "exercise": "string",
        "type": "string",
        "value": "number",
        "previous": "number"
      }
    ],
    "achievements": ["array"]
  }
}
```

---

## 👥 Social Endpoints

### POST /social/follow/:userId
Follow/unfollow a user.

**Headers:** `Authorization: Bearer <token>`
**Parameters:** `userId`: User ID to follow

**Response (200):**
```json
{
  "success": true,
  "message": "User followed successfully",
  "data": {
    "following": "boolean",
    "followersCount": "number"
  }
}
```

---

### GET /social/followers
Get user's followers.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20, max: 50)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "followers": [
      {
        "_id": "user_id",
        "username": "string",
        "profile": {
          "firstName": "string",
          "lastName": "string",
          "profilePicture": "string"
        },
        "isFollowing": "boolean",
        "followedAt": "date"
      }
    ],
    "pagination": { ... }
  }
}
```

---

### GET /social/following
Get users the current user is following.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20, max: 50)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "following": [
      {
        "_id": "user_id",
        "username": "string",
        "profile": { ... },
        "followedAt": "date"
      }
    ],
    "pagination": { ... }
  }
}
```

---

### GET /social/feed
Get activity feed from followed users.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20, max: 50)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "_id": "activity_id",
        "user": {
          "_id": "user_id",
          "username": "string",
          "profile": { ... }
        },
        "type": "string",
        "data": {
          "workout": { ... },
          "personalRecord": { ... },
          "message": "string"
        },
        "likes": ["array"],
        "comments": [
          {
            "user": { ... },
            "text": "string",
            "createdAt": "date"
          }
        ],
        "hasLiked": "boolean",
        "createdAt": "date"
      }
    ],
    "pagination": { ... }
  }
}
```

---

### POST /social/activities/:activityId/like
Like/unlike an activity.

**Headers:** `Authorization: Bearer <token>`
**Parameters:** `activityId`: Activity ID

**Response (200):**
```json
{
  "success": true,
  "message": "Activity liked successfully",
  "data": {
    "liked": "boolean",
    "likesCount": "number"
  }
}
```

---

### POST /social/activities/:activityId/comment
Comment on an activity.

**Headers:** `Authorization: Bearer <token>`
**Parameters:** `activityId`: Activity ID

**Request Body:**
```json
{
  "text": "string (required, max 500 chars)"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Comment added successfully",
  "data": {
    "_id": "comment_id",
    "user": { ... },
    "text": "string",
    "createdAt": "date"
  }
}
```

---

## 📈 Analytics Endpoints

### GET /analytics/dashboard
Get user's analytics dashboard data.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `period`: Time period (7d, 30d, 90d, 1y, all)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalWorkouts": "number",
      "totalDuration": "number",
      "totalVolume": "number",
      "currentStreak": "number",
      "longestStreak": "number"
    },
    "charts": {
      "workoutFrequency": [
        {
          "date": "date",
          "count": "number"
        }
      ],
      "volumeProgress": [
        {
          "date": "date",
          "volume": "number"
        }
      ],
      "exerciseDistribution": [
        {
          "category": "string",
          "count": "number",
          "percentage": "number"
        }
      ]
    },
    "personalRecords": [
      {
        "exercise": "string",
        "type": "string",
        "value": "number",
        "date": "date",
        "improvement": "number"
      }
    ],
    "goals": [
      {
        "type": "string",
        "target": "number",
        "current": "number",
        "percentage": "number"
      }
    ]
  }
}
```

---

### GET /analytics/progress/:exerciseId
Get progress analytics for specific exercise.

**Headers:** `Authorization: Bearer <token>`
**Parameters:** `exerciseId`: Exercise ID

**Query Parameters:**
- `period`: Time period (7d, 30d, 90d, 1y, all)
- `metric`: Metric to track (weight, reps, volume)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "exercise": {
      "_id": "exercise_id",
      "name": "string"
    },
    "personalRecords": [
      {
        "type": "string",
        "value": "number",
        "date": "date"
      }
    ],
    "progressData": [
      {
        "date": "date",
        "weight": "number",
        "reps": "number",
        "volume": "number",
        "oneRepMax": "number"
      }
    ],
    "statistics": {
      "totalSessions": "number",
      "totalSets": "number",
      "totalReps": "number",
      "totalVolume": "number",
      "averageWeight": "number",
      "averageReps": "number",
      "improvement": {
        "weight": "number",
        "reps": "number",
        "volume": "number"
      }
    }
  }
}
```

---

## 📁 Upload Endpoints

### POST /uploads/profile-picture
Upload user profile picture.

**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Request Body:**
- `image`: Image file (max 5MB, jpg/png)

**Response (200):**
```json
{
  "success": true,
  "message": "Profile picture uploaded successfully",
  "data": {
    "url": "string",
    "publicId": "string"
  }
}
```

---

### POST /uploads/exercise-media
Upload exercise demonstration media.

**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Request Body:**
- `media`: Image or video file (max 50MB for video, 5MB for image)
- `type`: "image" or "video"
- `exerciseId`: Exercise ID (optional)

**Response (200):**
```json
{
  "success": true,
  "message": "Media uploaded successfully",
  "data": {
    "url": "string",
    "publicId": "string",
    "type": "string",
    "duration": "number (for videos)"
  }
}
```

---

## 🔔 Notification Endpoints

### GET /notifications
Get user's notifications.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20, max: 50)
- `unread`: Only unread notifications (true/false)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "_id": "notification_id",
        "type": "string",
        "title": "string",
        "message": "string",
        "data": { ... },
        "isRead": "boolean",
        "sender": {
          "_id": "user_id",
          "username": "string",
          "profile": { ... }
        },
        "createdAt": "date"
      }
    ],
    "pagination": { ... },
    "unreadCount": "number"
  }
}
```

---

### PUT /notifications/:notificationId/read
Mark notification as read.

**Headers:** `Authorization: Bearer <token>`
**Parameters:** `notificationId`: Notification ID

**Response (200):**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

### PUT /notifications/mark-all-read
Mark all notifications as read.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "All notifications marked as read",
  "data": {
    "markedCount": "number"
  }
}
```

---

## 🚨 Error Responses

### Standard Error Format
```json
{
  "success": false,
  "error": {
    "type": "string",
    "message": "string",
    "details": "object (optional)",
    "code": "string (optional)"
  }
}
```

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid/missing token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `409`: Conflict (duplicate data)
- `413`: Payload Too Large
- `429`: Too Many Requests (rate limit)
- `500`: Internal Server Error

### Common Error Types
- `VALIDATION_ERROR`: Request validation failed
- `AUTHENTICATION_ERROR`: Invalid credentials
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `NOT_FOUND_ERROR`: Resource not found
- `DUPLICATE_ERROR`: Resource already exists
- `RATE_LIMIT_ERROR`: Too many requests
- `UPLOAD_ERROR`: File upload failed
- `SERVER_ERROR`: Internal server error

---

## 🔧 Testing

### Development Testing
Use the provided Postman collection or curl commands to test endpoints:

```bash
# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get user profile
curl -X GET http://localhost:5000/api/v1/users/profile \
  -H "Authorization: Bearer <your_jwt_token>"
```

### Production Testing
- Base URL: `https://api.fitquest.com/api/v1`
- All endpoints require HTTPS
- Rate limiting is enforced
- CORS is configured for frontend domains

---

**This API documentation is comprehensive and should cover all the endpoints needed for the FitQuest application.**
