import { createContext, useContext, useReducer, useEffect } from 'react'
import { authService } from '../services/authService'
import toast from 'react-hot-toast'

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  isLoading: true,
  error: null
}

// Action types
const AuthActionTypes = {
  AUTH_START: 'AUTH_START',
  AUTH_SUCCESS: 'AUTH_SUCCESS',
  AUTH_FAIL: 'AUTH_FAIL',
  LOGOUT: 'LOGOUT',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_USER: 'UPDATE_USER',
  SET_LOADING: 'SET_LOADING'
}

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AuthActionTypes.AUTH_START:
      return {
        ...state,
        isLoading: true,
        error: null
      }
    
    case AuthActionTypes.AUTH_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      }
    
    case AuthActionTypes.AUTH_FAIL:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload
      }
    
    case AuthActionTypes.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      }
    
    case AuthActionTypes.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      }
    
    case AuthActionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      }
    
    case AuthActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null
      }
    
    default:
      return state
  }
}

// Create context
const AuthContext = createContext()

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      
      if (token) {
        try {
          const response = await authService.getProfile()
          dispatch({
            type: AuthActionTypes.AUTH_SUCCESS,
            payload: {
              user: response.data,
              token
            }
          })
        } catch (error) {
          localStorage.removeItem('token')
          dispatch({ type: AuthActionTypes.AUTH_FAIL, payload: null })
        }
      } else {
        dispatch({ type: AuthActionTypes.SET_LOADING, payload: false })
      }
    }

    checkAuth()
  }, [])

  // Login function
  const login = async (credentials) => {
    try {
      dispatch({ type: AuthActionTypes.AUTH_START })
      
      const response = await authService.login(credentials)
      const { token, user } = response.data
      
      localStorage.setItem('token', token)
      
      dispatch({
        type: AuthActionTypes.AUTH_SUCCESS,
        payload: { user, token }
      })
      
      toast.success('Welcome back!')
      return { success: true }
      
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || 'Login failed'
      dispatch({
        type: AuthActionTypes.AUTH_FAIL,
        payload: errorMessage
      })
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: AuthActionTypes.AUTH_START })
      
      const response = await authService.register(userData)
      const { token, user } = response.data
      
      localStorage.setItem('token', token)
      
      dispatch({
        type: AuthActionTypes.AUTH_SUCCESS,
        payload: { user, token }
      })
      
      toast.success('Welcome to FitQuest!')
      return { success: true }
      
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || 'Registration failed'
      dispatch({
        type: AuthActionTypes.AUTH_FAIL,
        payload: errorMessage
      })
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Logout function
  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('token')
      dispatch({ type: AuthActionTypes.LOGOUT })
      toast.success('Logged out successfully')
    }
  }

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      const response = await authService.updateProfile(userData)
      
      dispatch({
        type: AuthActionTypes.UPDATE_USER,
        payload: response.data
      })
      
      toast.success('Profile updated successfully')
      return { success: true, data: response.data }
      
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || 'Update failed'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Update password
  const updatePassword = async (passwordData) => {
    try {
      await authService.updatePassword(passwordData)
      toast.success('Password updated successfully')
      return { success: true }
      
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || 'Password update failed'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Forgot password
  const forgotPassword = async (email) => {
    try {
      await authService.forgotPassword(email)
      toast.success('Password reset email sent')
      return { success: true }
      
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || 'Failed to send reset email'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Clear error
  const clearError = () => {
    dispatch({ type: AuthActionTypes.CLEAR_ERROR })
  }

  // Context value
  const value = {
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    login,
    register,
    logout,
    updateProfile,
    updatePassword,
    forgotPassword,
    clearError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
