# FitQuest - Fitness Tracking Application

A comprehensive MERN stack application for tracking workouts, progress, and connecting with fitness enthusiasts.

## 🚀 Features

### Core Functionality
- **Workout Management**: Create, track, and log workouts
- **Exercise Library**: Browse exercises with demo videos
- **Progress Tracking**: Weight, measurements, and personal records
- **Social Features**: Follow users, share workouts, view activity feeds
- **Analytics**: Charts and insights for progress monitoring

### Technical Features
- JWT Authentication
- Responsive Design
- Real-time Updates
- File Uploads
- RESTful API
- Mobile-First Design

## 🛠 Tech Stack

### Frontend
- React 18
- React Router DOM
- Context API
- Tailwind CSS
- Chart.js
- Axios

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT
- bcryptjs
- Multer

### Deployment
- Vercel (Frontend)
- Render (Backend)
- MongoDB Atlas (Database)

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account
- Git

## 🏃‍♂️ Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/fitquest.git
   cd fitquest
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your MongoDB Atlas URI and JWT secret
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Edit .env with your backend API URL
   npm start
   ```

### Environment Variables

**Backend (.env)**
```env
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000
```

**Frontend (.env)**
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

## 🚀 Deployment

### Backend to Render
1. Connect GitHub repository to Render
2. Create new Web Service
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables

### Frontend to Vercel
1. Connect GitHub repository to Vercel
2. Set root directory to `frontend`
3. Build command: `npm run build`
4. Output directory: `build`

### Database to MongoDB Atlas
1. Create new cluster
2. Create database user
3. Get connection string
4. Add to environment variables

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Workout Endpoints
- `GET /api/workouts` - Get user's workouts
- `POST /api/workouts` - Create new workout
- `PUT /api/workouts/:id` - Update workout
- `DELETE /api/workouts/:id` - Delete workout

### Exercise Endpoints
- `GET /api/exercises` - Get exercise library
- `POST /api/exercises` - Create new exercise (admin)
- `GET /api/exercises/search` - Search exercises

### Progress Endpoints
- `POST /api/progress` - Add progress entry
- `GET /api/progress` - Get user progress
- `GET /api/progress/charts` - Get chart data

## 🏗 Project Structure

```
fitquest/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   └── config/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── utils/
├── docs/
└── README.md
```

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👥 Authors

Your Name - [GitHub](https://github.com/yourusername)

## 🙏 Acknowledgments

- Icons by Lucide React
- Charts by Chart.js
- UI components with Tailwind CSS
