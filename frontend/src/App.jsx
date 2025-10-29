import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { motion } from 'framer-motion'

// Context Providers
import { AuthProvider } from './context/AuthContext'
import { WorkoutProvider } from './context/WorkoutContext'
import { ProgressProvider } from './context/ProgressContext'
import { SocialProvider } from './context/SocialContext'
import { ThemeProvider } from './context/ThemeContext'

// Layout Components
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import LoadingSpinner from './components/ui/LoadingSpinner'
import ErrorBoundary from './components/ui/ErrorBoundary'

// Pages
import LandingPage from './pages/LandingPage'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/Dashboard'
import WorkoutsPage from './pages/WorkoutsPage'
import ExercisesPage from './pages/ExercisesPage'
import ProgressPage from './pages/ProgressPage'
import ProfilePage from './pages/ProfilePage'
import SocialPage from './pages/SocialPage'
import WorkoutBuilder from './pages/WorkoutBuilder'
import WorkoutSession from './pages/WorkoutSession'
import NotFound from './pages/NotFound'

// Route Protection
import ProtectedRoute from './components/auth/ProtectedRoute'
import PublicRoute from './components/auth/PublicRoute'

// Hooks
import { useAuth } from './hooks/useAuth'
import { useTheme } from './hooks/useTheme'

function AppContent() {
  const { isLoading } = useAuth()
  const { theme } = useTheme()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 ${theme}`}>
      <ErrorBoundary>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          
          <motion.main 
            className="flex-grow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              
              {/* Auth Routes (redirect if already logged in) */}
              <Route path="/auth/login" element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } />
              <Route path="/auth/register" element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/workouts" element={
                <ProtectedRoute>
                  <WorkoutsPage />
                </ProtectedRoute>
              } />
              
              <Route path="/workouts/builder" element={
                <ProtectedRoute>
                  <WorkoutBuilder />
                </ProtectedRoute>
              } />
              
              <Route path="/workouts/session/:id" element={
                <ProtectedRoute>
                  <WorkoutSession />
                </ProtectedRoute>
              } />
              
              <Route path="/exercises" element={
                <ProtectedRoute>
                  <ExercisesPage />
                </ProtectedRoute>
              } />
              
              <Route path="/progress" element={
                <ProtectedRoute>
                  <ProgressPage />
                </ProtectedRoute>
              } />
              
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              
              <Route path="/social" element={
                <ProtectedRoute>
                  <SocialPage />
                </ProtectedRoute>
              } />
              
              {/* 404 Page */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </motion.main>
          
          <Footer />
        </div>
        
        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            className: 'dark:bg-gray-800 dark:text-white',
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#FFFFFF',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#FFFFFF',
              },
            },
          }}
        />
      </ErrorBoundary>
    </div>
  )
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <WorkoutProvider>
            <ProgressProvider>
              <SocialProvider>
                <AppContent />
              </SocialProvider>
            </ProgressProvider>
          </WorkoutProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  )
}

export default App