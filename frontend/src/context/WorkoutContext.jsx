import { createContext, useContext, useReducer, useCallback } from 'react'
import { workoutService } from '../services/workoutService'
import { exerciseService } from '../services/exerciseService'
import { workoutLogService } from '../services/workoutLogService'
import toast from 'react-hot-toast'

// Initial state
const initialState = {
  workouts: [],
  exercises: [],
  currentWorkout: null,
  activeSession: null,
  workoutHistory: [],
  isLoading: false,
  error: null,
  filters: {
    category: '',
    difficulty: '',
    muscleGroup: '',
    equipment: []
  }
}

// Action types
const WorkoutActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  
  // Workouts
  SET_WORKOUTS: 'SET_WORKOUTS',
  ADD_WORKOUT: 'ADD_WORKOUT',
  UPDATE_WORKOUT: 'UPDATE_WORKOUT',
  DELETE_WORKOUT: 'DELETE_WORKOUT',
  SET_CURRENT_WORKOUT: 'SET_CURRENT_WORKOUT',
  
  // Exercises
  SET_EXERCISES: 'SET_EXERCISES',
  ADD_EXERCISE: 'ADD_EXERCISE',
  UPDATE_EXERCISE: 'UPDATE_EXERCISE',
  
  // Workout Sessions
  START_SESSION: 'START_SESSION',
  UPDATE_SESSION: 'UPDATE_SESSION',
  END_SESSION: 'END_SESSION',
  SET_WORKOUT_HISTORY: 'SET_WORKOUT_HISTORY',
  
  // Filters
  SET_FILTERS: 'SET_FILTERS',
  CLEAR_FILTERS: 'CLEAR_FILTERS'
}

// Reducer
const workoutReducer = (state, action) => {
  switch (action.type) {
    case WorkoutActionTypes.SET_LOADING:
      return { ...state, isLoading: action.payload }
    
    case WorkoutActionTypes.SET_ERROR:
      return { ...state, error: action.payload, isLoading: false }
    
    case WorkoutActionTypes.CLEAR_ERROR:
      return { ...state, error: null }
    
    case WorkoutActionTypes.SET_WORKOUTS:
      return { ...state, workouts: action.payload, isLoading: false }
    
    case WorkoutActionTypes.ADD_WORKOUT:
      return { 
        ...state, 
        workouts: [action.payload, ...state.workouts],
        isLoading: false 
      }
    
    case WorkoutActionTypes.UPDATE_WORKOUT:
      return {
        ...state,
        workouts: state.workouts.map(workout =>
          workout._id === action.payload._id ? action.payload : workout
        ),
        currentWorkout: state.currentWorkout?._id === action.payload._id 
          ? action.payload 
          : state.currentWorkout,
        isLoading: false
      }
    
    case WorkoutActionTypes.DELETE_WORKOUT:
      return {
        ...state,
        workouts: state.workouts.filter(workout => workout._id !== action.payload),
        currentWorkout: state.currentWorkout?._id === action.payload 
          ? null 
          : state.currentWorkout,
        isLoading: false
      }
    
    case WorkoutActionTypes.SET_CURRENT_WORKOUT:
      return { ...state, currentWorkout: action.payload, isLoading: false }
    
    case WorkoutActionTypes.SET_EXERCISES:
      return { ...state, exercises: action.payload, isLoading: false }
    
    case WorkoutActionTypes.ADD_EXERCISE:
      return { 
        ...state, 
        exercises: [action.payload, ...state.exercises],
        isLoading: false 
      }
    
    case WorkoutActionTypes.UPDATE_EXERCISE:
      return {
        ...state,
        exercises: state.exercises.map(exercise =>
          exercise._id === action.payload._id ? action.payload : exercise
        ),
        isLoading: false
      }
    
    case WorkoutActionTypes.START_SESSION:
      return { ...state, activeSession: action.payload, isLoading: false }
    
    case WorkoutActionTypes.UPDATE_SESSION:
      return { 
        ...state, 
        activeSession: { ...state.activeSession, ...action.payload },
        isLoading: false 
      }
    
    case WorkoutActionTypes.END_SESSION:
      return { 
        ...state, 
        activeSession: null,
        workoutHistory: [action.payload, ...state.workoutHistory],
        isLoading: false 
      }
    
    case WorkoutActionTypes.SET_WORKOUT_HISTORY:
      return { ...state, workoutHistory: action.payload, isLoading: false }
    
    case WorkoutActionTypes.SET_FILTERS:
      return { 
        ...state, 
        filters: { ...state.filters, ...action.payload } 
      }
    
    case WorkoutActionTypes.CLEAR_FILTERS:
      return { 
        ...state, 
        filters: initialState.filters 
      }
    
    default:
      return state
  }
}

// Create context
const WorkoutContext = createContext()

// WorkoutProvider component
export const WorkoutProvider = ({ children }) => {
  const [state, dispatch] = useReducer(workoutReducer, initialState)

  // Error handler
  const handleError = useCallback((error, defaultMessage = 'An error occurred') => {
    const errorMessage = error.response?.data?.error?.message || defaultMessage
    dispatch({ type: WorkoutActionTypes.SET_ERROR, payload: errorMessage })
    toast.error(errorMessage)
    return errorMessage
  }, [])

  // Fetch workouts
  const fetchWorkouts = useCallback(async (params = {}) => {
    try {
      dispatch({ type: WorkoutActionTypes.SET_LOADING, payload: true })
      const response = await workoutService.getWorkouts(params)
      dispatch({ type: WorkoutActionTypes.SET_WORKOUTS, payload: response.data })
      return response.data
    } catch (error) {
      handleError(error, 'Failed to fetch workouts')
      return []
    }
  }, [handleError])

  // Fetch single workout
  const fetchWorkout = useCallback(async (id) => {
    try {
      dispatch({ type: WorkoutActionTypes.SET_LOADING, payload: true })
      const response = await workoutService.getWorkout(id)
      dispatch({ type: WorkoutActionTypes.SET_CURRENT_WORKOUT, payload: response.data })
      return response.data
    } catch (error) {
      handleError(error, 'Failed to fetch workout')
      return null
    }
  }, [handleError])

  // Create workout
  const createWorkout = useCallback(async (workoutData) => {
    try {
      dispatch({ type: WorkoutActionTypes.SET_LOADING, payload: true })
      const response = await workoutService.createWorkout(workoutData)
      dispatch({ type: WorkoutActionTypes.ADD_WORKOUT, payload: response.data })
      toast.success('Workout created successfully!')
      return { success: true, data: response.data }
    } catch (error) {
      const errorMessage = handleError(error, 'Failed to create workout')
      return { success: false, error: errorMessage }
    }
  }, [handleError])

  // Update workout
  const updateWorkout = useCallback(async (id, workoutData) => {
    try {
      dispatch({ type: WorkoutActionTypes.SET_LOADING, payload: true })
      const response = await workoutService.updateWorkout(id, workoutData)
      dispatch({ type: WorkoutActionTypes.UPDATE_WORKOUT, payload: response.data })
      toast.success('Workout updated successfully!')
      return { success: true, data: response.data }
    } catch (error) {
      const errorMessage = handleError(error, 'Failed to update workout')
      return { success: false, error: errorMessage }
    }
  }, [handleError])

  // Delete workout
  const deleteWorkout = useCallback(async (id) => {
    try {
      dispatch({ type: WorkoutActionTypes.SET_LOADING, payload: true })
      await workoutService.deleteWorkout(id)
      dispatch({ type: WorkoutActionTypes.DELETE_WORKOUT, payload: id })
      toast.success('Workout deleted successfully!')
      return { success: true }
    } catch (error) {
      const errorMessage = handleError(error, 'Failed to delete workout')
      return { success: false, error: errorMessage }
    }
  }, [handleError])

  // Duplicate workout
  const duplicateWorkout = useCallback(async (id) => {
    try {
      dispatch({ type: WorkoutActionTypes.SET_LOADING, payload: true })
      const response = await workoutService.duplicateWorkout(id)
      dispatch({ type: WorkoutActionTypes.ADD_WORKOUT, payload: response.data })
      toast.success('Workout duplicated successfully!')
      return { success: true, data: response.data }
    } catch (error) {
      const errorMessage = handleError(error, 'Failed to duplicate workout')
      return { success: false, error: errorMessage }
    }
  }, [handleError])

  // Fetch exercises
  const fetchExercises = useCallback(async (params = {}) => {
    try {
      dispatch({ type: WorkoutActionTypes.SET_LOADING, payload: true })
      const response = await exerciseService.getExercises(params)
      dispatch({ type: WorkoutActionTypes.SET_EXERCISES, payload: response.data })
      return response.data
    } catch (error) {
      handleError(error, 'Failed to fetch exercises')
      return []
    }
  }, [handleError])

  // Start workout session
  const startWorkoutSession = useCallback(async (workoutData) => {
    try {
      dispatch({ type: WorkoutActionTypes.SET_LOADING, payload: true })
      const sessionData = {
        ...workoutData,
        startTime: new Date(),
        status: 'active'
      }
      dispatch({ type: WorkoutActionTypes.START_SESSION, payload: sessionData })
      toast.success('Workout session started!')
      return { success: true, data: sessionData }
    } catch (error) {
      const errorMessage = handleError(error, 'Failed to start workout session')
      return { success: false, error: errorMessage }
    }
  }, [handleError])

  // Update workout session
  const updateWorkoutSession = useCallback((sessionData) => {
    dispatch({ type: WorkoutActionTypes.UPDATE_SESSION, payload: sessionData })
  }, [])

  // End workout session
  const endWorkoutSession = useCallback(async (sessionData) => {
    try {
      dispatch({ type: WorkoutActionTypes.SET_LOADING, payload: true })
      const completeSessionData = {
        ...sessionData,
        endTime: new Date(),
        status: 'completed'
      }
      
      const response = await workoutLogService.logWorkout(completeSessionData)
      dispatch({ type: WorkoutActionTypes.END_SESSION, payload: response.data })
      toast.success('Workout completed!')
      return { success: true, data: response.data }
    } catch (error) {
      const errorMessage = handleError(error, 'Failed to complete workout')
      return { success: false, error: errorMessage }
    }
  }, [handleError])

  // Fetch workout history
  const fetchWorkoutHistory = useCallback(async (params = {}) => {
    try {
      dispatch({ type: WorkoutActionTypes.SET_LOADING, payload: true })
      const response = await workoutLogService.getWorkoutLogs(params)
      dispatch({ type: WorkoutActionTypes.SET_WORKOUT_HISTORY, payload: response.data })
      return response.data
    } catch (error) {
      handleError(error, 'Failed to fetch workout history')
      return []
    }
  }, [handleError])

  // Set filters
  const setFilters = useCallback((filters) => {
    dispatch({ type: WorkoutActionTypes.SET_FILTERS, payload: filters })
  }, [])

  // Clear filters
  const clearFilters = useCallback(() => {
    dispatch({ type: WorkoutActionTypes.CLEAR_FILTERS })
  }, [])

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: WorkoutActionTypes.CLEAR_ERROR })
  }, [])

  // Context value
  const value = {
    // State
    workouts: state.workouts,
    exercises: state.exercises,
    currentWorkout: state.currentWorkout,
    activeSession: state.activeSession,
    workoutHistory: state.workoutHistory,
    isLoading: state.isLoading,
    error: state.error,
    filters: state.filters,
    
    // Actions
    fetchWorkouts,
    fetchWorkout,
    createWorkout,
    updateWorkout,
    deleteWorkout,
    duplicateWorkout,
    fetchExercises,
    startWorkoutSession,
    updateWorkoutSession,
    endWorkoutSession,
    fetchWorkoutHistory,
    setFilters,
    clearFilters,
    clearError
  }

  return (
    <WorkoutContext.Provider value={value}>
      {children}
    </WorkoutContext.Provider>
  )
}

// Custom hook to use workout context
export const useWorkout = () => {
  const context = useContext(WorkoutContext)
  if (!context) {
    throw new Error('useWorkout must be used within a WorkoutProvider')
  }
  return context
}

export default WorkoutContext
