import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  leftIcon = null,
  rightIcon = null,
  className = '',
  fullWidth = false,
  type = 'button',
  onClick,
  ...props
}, ref) => {
  const baseClasses = [
    'inline-flex',
    'items-center',
    'justify-center',
    'font-medium',
    'rounded-lg',
    'border',
    'transition-all',
    'duration-200',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed'
  ]

  const variants = {
    primary: [
      'bg-primary-600',
      'text-white',
      'border-primary-600',
      'hover:bg-primary-700',
      'hover:border-primary-700',
      'focus:ring-primary-500',
      'dark:bg-primary-600',
      'dark:border-primary-600',
      'dark:hover:bg-primary-700',
      'dark:hover:border-primary-700'
    ],
    secondary: [
      'bg-gray-100',
      'text-gray-900',
      'border-gray-300',
      'hover:bg-gray-200',
      'hover:border-gray-400',
      'focus:ring-gray-500',
      'dark:bg-gray-700',
      'dark:text-gray-100',
      'dark:border-gray-600',
      'dark:hover:bg-gray-600',
      'dark:hover:border-gray-500'
    ],
    outline: [
      'bg-transparent',
      'text-primary-600',
      'border-primary-300',
      'hover:bg-primary-50',
      'hover:border-primary-400',
      'focus:ring-primary-500',
      'dark:text-primary-400',
      'dark:border-primary-600',
      'dark:hover:bg-primary-900/20',
      'dark:hover:border-primary-500'
    ],
    ghost: [
      'bg-transparent',
      'text-gray-600',
      'border-transparent',
      'hover:bg-gray-100',
      'hover:text-gray-900',
      'focus:ring-gray-500',
      'dark:text-gray-400',
      'dark:hover:bg-gray-800',
      'dark:hover:text-gray-100'
    ],
    danger: [
      'bg-red-600',
      'text-white',
      'border-red-600',
      'hover:bg-red-700',
      'hover:border-red-700',
      'focus:ring-red-500',
      'dark:bg-red-600',
      'dark:border-red-600',
      'dark:hover:bg-red-700',
      'dark:hover:border-red-700'
    ],
    success: [
      'bg-green-600',
      'text-white',
      'border-green-600',
      'hover:bg-green-700',
      'hover:border-green-700',
      'focus:ring-green-500',
      'dark:bg-green-600',
      'dark:border-green-600',
      'dark:hover:bg-green-700',
      'dark:hover:border-green-700'
    ]
  }

  const sizes = {
    xs: ['px-2', 'py-1', 'text-xs'],
    sm: ['px-3', 'py-1.5', 'text-sm'],
    md: ['px-4', 'py-2', 'text-sm'],
    lg: ['px-6', 'py-3', 'text-base'],
    xl: ['px-8', 'py-4', 'text-lg']
  }

  const classes = [
    ...baseClasses,
    ...variants[variant],
    ...sizes[size],
    fullWidth ? 'w-full' : '',
    className
  ].filter(Boolean).join(' ')

  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={classes}
      onClick={onClick}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Loading...
        </>
      ) : (
        <>
          {leftIcon && <span className="mr-2">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="ml-2">{rightIcon}</span>}
        </>
      )}
    </motion.button>
  )
})

Button.displayName = 'Button'

export default Button
