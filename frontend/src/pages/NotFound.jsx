import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, ArrowLeft, Search } from 'lucide-react'
import Button from '../components/ui/Button'

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-md mx-auto"
      >
        {/* 404 Illustration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <div className="text-6xl font-bold text-primary-600 dark:text-primary-400 mb-4">
            404
          </div>
          <div className="bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
            <svg
              className="w-24 h-24 mx-auto opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.457.901-6.03 2.378M16 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Page Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Sorry, we couldn't find the page you're looking for. The page might have been moved, 
            deleted, or you entered the wrong URL.
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="space-y-4"
        >
          <Link to="/dashboard" className="block">
            <Button
              leftIcon={<Home className="h-4 w-4" />}
              size="lg"
              fullWidth
            >
              Go to Dashboard
            </Button>
          </Link>

          <div className="flex space-x-3">
            <button
              onClick={() => window.history.back()}
              className="flex-1"
            >
              <Button
                variant="outline"
                leftIcon={<ArrowLeft className="h-4 w-4" />}
                fullWidth
              >
                Go Back
              </Button>
            </button>

            <Link to="/exercises" className="flex-1">
              <Button
                variant="outline"
                leftIcon={<Search className="h-4 w-4" />}
                fullWidth
              >
                Browse
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Help Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Need help? {' '}
            <Link
              to="/contact"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
            >
              Contact our support team
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default NotFound
