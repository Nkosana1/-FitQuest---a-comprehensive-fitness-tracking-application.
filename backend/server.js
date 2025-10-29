const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const exerciseRoutes = require('./routes/exercises');
const workoutRoutes = require('./routes/workouts');
const sessionRoutes = require('./routes/sessions');
const socialRoutes = require('./routes/social');
const analyticsRoutes = require('./routes/analytics');
const uploadRoutes = require('./routes/uploads');
const notificationRoutes = require('./routes/notifications');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const auth = require('./middleware/auth');

const app = express();

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : 'http://localhost:5173',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'FitQuest API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/exercises', exerciseRoutes);
app.use('/api/v1/workouts', workoutRoutes);
app.use('/api/v1/sessions', sessionRoutes);
app.use('/api/v1/social', socialRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/uploads', uploadRoutes);
app.use('/api/v1/notifications', notificationRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      type: 'NOT_FOUND_ERROR',
      message: 'API endpoint not found'
    }
  });
});

// Global error handler
app.use(errorHandler);

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`
🚀 FitQuest API Server running!
📡 Port: ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
📅 Started at: ${new Date().toISOString()}
    `);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  mongoose.connection.close();
  process.exit(0);
});

module.exports = app;
