# FitQuest - Fitness Tracking Application

![React](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3-38b2ac?logo=tailwindcss&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47a248?logo=mongodb&logoColor=white)
![Render](https://img.shields.io/badge/Render-Backend-000000)
![Vercel](https://img.shields.io/badge/Vercel-Frontend-000000?logo=vercel&logoColor=white)
![CI](https://github.com/Nkosana1/-FitQuest---a-comprehensive-fitness-tracking-application./actions/workflows/ci.yml/badge.svg)

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

## 🔗 Live Links & Resources

- Live Application: https://fitquest.vercel.app
- Backend API: https://fitquest-api.onrender.com
- GitHub Repository: https://github.com/yourusername/fitquest
- API Documentation: https://fitquest-api.onrender.com/api/docs

### Admin & Database
- MongoDB Atlas Cluster: https://cloud.mongodb.com/v2/your-cluster-id
- Vercel Dashboard: https://vercel.com/yourusername
- Render Dashboard: https://dashboard.render.com/yourusername

### Monitoring
- Vercel Analytics: https://vercel.com/yourusername/fitquest/analytics
- Render Metrics: https://dashboard.render.com/your-service-id/metrics

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

## 🔗 Live Demo
- Frontend: https://fitquest.vercel.app
- Backend API: https://fitquest-api.onrender.com
- Repo: https://github.com/yourusername/fitquest

Demo credentials (read-only)
- Email: demo@example.com
- Password: DemoPassword123!

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
