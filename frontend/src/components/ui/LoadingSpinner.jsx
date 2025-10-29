import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary',
  className = '',
  text = null 
}) => {
  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  }

  const colorClasses = {
    primary: 'text-primary-600 dark:text-primary-400',
    white: 'text-white',
    gray: 'text-gray-600 dark:text-gray-400',
    red: 'text-red-600 dark:text-red-400',
    green: 'text-green-600 dark:text-green-400',
    blue: 'text-blue-600 dark:text-blue-400'
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear'
        }}
        className="flex items-center"
      >
        <Loader2 className={`${sizeClasses[size]} ${colorClasses[color]}`} />
      </motion.div>
      {text && (
        <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
          {text}
        </span>
      )}
    </div>
  )
}

export default LoadingSpinner