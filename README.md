# FitQuest 🏋️‍♂️

A comprehensive fitness tracking application with social features and advanced analytics.

![FitQuest Logo](./docs/assets/logo.png)

## 🌟 Overview

FitQuest is a modern, full-stack fitness tracking application that helps users monitor their workouts, track progress, and connect with a community of fitness enthusiasts. Built with the MERN stack, it provides an intuitive interface for managing fitness journeys with powerful analytics and social features.

## 🚀 Features

### Core Functionality
- **User Authentication** - Secure registration, login, and profile management
- **Workout Tracking** - Create, log, and track custom workouts
- **Exercise Library** - Comprehensive database with demo videos
- **Progress Analytics** - Visual charts and statistics with Chart.js
- **Personal Records** - Track PRs and achievements
- **Mobile Responsive** - Optimized for all devices

### Social Features
- **Follow System** - Follow other users and see their progress
- **Workout Sharing** - Share workouts with the community
- **Leaderboards** - Compete with friends and community
- **Activity Feed** - See updates from followed users

### Advanced Features
- **Custom Exercise Creation** - Add your own exercises with videos
- **Workout Templates** - Save and reuse favorite workouts
- **Progress Photos** - Track visual progress over time
- **Achievement System** - Unlock badges and milestones
- **Data Export** - Export your fitness data

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **Multer** - File upload handling
- **Cloudinary** - Media storage and optimization

### Frontend
- **React 18** - UI library with hooks
- **React Router DOM** - Client-side routing
- **Context API** - State management
- **Tailwind CSS** - Utility-first CSS framework
- **Chart.js** - Data visualization
- **Lucide React** - Icon library
- **Framer Motion** - Animations

### Development Tools
- **Vite** - Build tool and dev server
- **ESLint** - Code linting
- **Nodemon** - Auto-restart for development

## 📁 Project Structure

```
FitQuest/
│
├── backend/                 # Node.js/Express API
│   ├── controllers/         # Route controllers
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── utils/              # Utility functions
│   ├── config/             # Configuration files
│   ├── uploads/            # File upload directory
│   └── server.js           # Entry point
│
├── frontend/               # React application
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── context/        # Context providers
│   │   ├── hooks/          # Custom hooks
│   │   ├── utils/          # Utility functions
│   │   ├── styles/         # Global styles
│   │   └── App.jsx         # Main app component
│   │
│   ├── tailwind.config.js  # Tailwind configuration
│   ├── vite.config.js      # Vite configuration
│   └── index.html          # HTML template
│
├── docs/                   # Documentation
│   ├── API.md              # API documentation
│   ├── DATABASE_SCHEMA.md  # Database design
│   ├── DEPLOYMENT.md       # Deployment guide
│   └── DEVELOPMENT_PLAN.md # Development phases
│
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Nkosana1/-FitQuest---a-comprehensive-fitness-tracking-application..git
   cd FitQuest
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Setup**
   
   Create `.env` in the backend directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/fitquest
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=30d
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   EMAIL_FROM=noreply@fitquest.com
   EMAIL_SERVICE=gmail
   EMAIL_USERNAME=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password
   ```

5. **Start the development servers**
   
   Backend (Terminal 1):
   ```bash
   cd backend
   npm run dev
   ```
   
   Frontend (Terminal 2):
   ```bash
   cd frontend
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 📊 Development Phases

### Phase 1: Foundation (Weeks 1-2)
- Project setup and basic authentication
- User registration and login
- Basic UI components and routing

### Phase 2: Core Features (Weeks 3-4)
- Exercise library and workout creation
- Workout logging and tracking
- Basic progress visualization

### Phase 3: Advanced Features (Weeks 5-6)
- Social features and user following
- Advanced analytics and charts
- File upload for exercise videos

### Phase 4: Polish & Deploy (Weeks 7-8)
- Performance optimization
- Testing and bug fixes
- Deployment and documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Lead Developer** - [Your Name](https://github.com/Nkosana1)

## 🙏 Acknowledgments

- Chart.js for beautiful data visualization
- Tailwind CSS for rapid UI development
- The open-source community for amazing tools

## 📞 Support

For support, email support@fitquest.com or create an issue in this repository.

---

**Happy Fitness Tracking! 💪**
