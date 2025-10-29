# FitQuest API Documentation

Base URL: /api/v1

## Auth
- POST /auth/register
- POST /auth/login
- POST /auth/forgot-password
- POST /auth/reset-password/:token
- GET /auth/me

Example: Register
```bash
curl -X POST "$BASE/api/v1/auth/register" \
  -H 'Content-Type: application/json' \
  -d '{"username":"demo","email":"demo@example.com","password":"Password123!"}'
```

## Users
- GET /users/:id
- PATCH /users/:id
- GET /users/:id/followers
- GET /users/:id/following
- POST /users/:id/follow
- POST /users/:id/unfollow

## Exercises
- GET /exercises
- POST /exercises
- GET /exercises/:id
- PATCH /exercises/:id
- DELETE /exercises/:id

## Workouts
- GET /workouts
- POST /workouts
- GET /workouts/:id
- PATCH /workouts/:id
- DELETE /workouts/:id

## Logs
- GET /logs
- POST /logs
- GET /logs/:id

## Progress
- GET /progress
- POST /progress

## Records
- GET /records
- POST /records

## Social
- GET /social/feed
- GET /social/leaderboard

## Uploads
- POST /uploads

Notes
- All protected routes require Authorization: Bearer <token>.
- Standard error shape follows middleware/errorHandler.


