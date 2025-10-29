import { createContext, useContext, useReducer, useCallback } from 'react'
import { progressService } from '../services/progressService'
import { recordService } from '../services/recordService'
import toast from 'react-hot-toast'

// Initial state
const initialState = {
  progressEntries: [],
  personalRecords: [],
  goals: [],
  analytics: null,
  chartData: {},
  milestones: [],
  bodyComposition: [],
  isLoading: false,
  error: null
}

// Action types
const ProgressActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  
  // Progress entries
  SET_PROGRESS_ENTRIES: 'SET_PROGRESS_ENTRIES',
  ADD_PROGRESS_ENTRY: 'ADD_PROGRESS_ENTRY',
  UPDATE_PROGRESS_ENTRY: 'UPDATE_PROGRESS_ENTRY',
  DELETE_PROGRESS_ENTRY: 'DELETE_PROGRESS_ENTRY',
  
  // Personal records
  SET_PERSONAL_RECORDS: 'SET_PERSONAL_RECORDS',
  ADD_PERSONAL_RECORD: 'ADD_PERSONAL_RECORD',
  UPDATE_PERSONAL_RECORD: 'UPDATE_PERSONAL_RECORD',
  DELETE_PERSONAL_RECORD: 'DELETE_PERSONAL_RECORD',
  
  // Goals
  SET_GOALS: 'SET_GOALS',
  UPDATE_GOALS: 'UPDATE_GOALS',
  
  // Analytics
  SET_ANALYTICS: 'SET_ANALYTICS',
  SET_CHART_DATA: 'SET_CHART_DATA',
  SET_MILESTONES: 'SET_MILESTONES',
  SET_BODY_COMPOSITION: 'SET_BODY_COMPOSITION'
}

// Reducer
const progressReducer = (state, action) => {
  switch (action.type) {
    case ProgressActionTypes.SET_LOADING:
      return { ...state, isLoading: action.payload }
    
    case ProgressActionTypes.SET_ERROR:
      return { ...state, error: action.payload, isLoading: false }
    
    case ProgressActionTypes.CLEAR_ERROR:
      return { ...state, error: null }
    
    case ProgressActionTypes.SET_PROGRESS_ENTRIES:
      return { ...state, progressEntries: action.payload, isLoading: false }
    
    case ProgressActionTypes.ADD_PROGRESS_ENTRY:
      return { 
        ...state, 
        progressEntries: [action.payload, ...state.progressEntries],
        isLoading: false 
      }
    
    case ProgressActionTypes.UPDATE_PROGRESS_ENTRY:
      return {
        ...state,
        progressEntries: state.progressEntries.map(entry =>
          entry._id === action.payload._id ? action.payload : entry
        ),
        isLoading: false
      }
    
    case ProgressActionTypes.DELETE_PROGRESS_ENTRY:
      return {
        ...state,
        progressEntries: state.progressEntries.filter(entry => entry._id !== action.payload),
        isLoading: false
      }
    
    case ProgressActionTypes.SET_PERSONAL_RECORDS:
      return { ...state, personalRecords: action.payload, isLoading: false }
    
    case ProgressActionTypes.ADD_PERSONAL_RECORD:
      return { 
        ...state, 
        personalRecords: [action.payload, ...state.personalRecords],
        isLoading: false 
      }
    
    case ProgressActionTypes.UPDATE_PERSONAL_RECORD:
      return {
        ...state,
        personalRecords: state.personalRecords.map(record =>
          record._id === action.payload._id ? action.payload : record
        ),
        isLoading: false
      }
    
    case ProgressActionTypes.DELETE_PERSONAL_RECORD:
      return {
        ...state,
        personalRecords: state.personalRecords.filter(record => record._id !== action.payload),
        isLoading: false
      }
    
    case ProgressActionTypes.SET_GOALS:
      return { ...state, goals: action.payload, isLoading: false }
    
    case ProgressActionTypes.UPDATE_GOALS:
      return { ...state, goals: action.payload, isLoading: false }
    
    case ProgressActionTypes.SET_ANALYTICS:
      return { ...state, analytics: action.payload, isLoading: false }
    
    case ProgressActionTypes.SET_CHART_DATA:
      return { ...state, chartData: { ...state.chartData, ...action.payload }, isLoading: false }
    
    case ProgressActionTypes.SET_MILESTONES:
      return { ...state, milestones: action.payload, isLoading: false }
    
    case ProgressActionTypes.SET_BODY_COMPOSITION:
      return { ...state, bodyComposition: action.payload, isLoading: false }
    
    default:
      return state
  }
}

// Create context
const ProgressContext = createContext()

// ProgressProvider component
export const ProgressProvider = ({ children }) => {
  const [state, dispatch] = useReducer(progressReducer, initialState)

  // Error handler
  const handleError = useCallback((error, defaultMessage = 'An error occurred') => {
    const errorMessage = error.response?.data?.error?.message || defaultMessage
    dispatch({ type: ProgressActionTypes.SET_ERROR, payload: errorMessage })
    toast.error(errorMessage)
    return errorMessage
  }, [])

  // Fetch progress entries
  const fetchProgressEntries = useCallback(async (params = {}) => {
    try {
      dispatch({ type: ProgressActionTypes.SET_LOADING, payload: true })
      const response = await progressService.getProgressEntries(params)
      dispatch({ type: ProgressActionTypes.SET_PROGRESS_ENTRIES, payload: response.data })
      return response.data
    } catch (error) {
      handleError(error, 'Failed to fetch progress entries')
      return []
    }
  }, [handleError])

  // Add progress entry
  const addProgressEntry = useCallback(async (entryData) => {
    try {
      dispatch({ type: ProgressActionTypes.SET_LOADING, payload: true })
      const response = await progressService.addProgressEntry(entryData)
      dispatch({ type: ProgressActionTypes.ADD_PROGRESS_ENTRY, payload: response.data })
      toast.success('Progress entry added successfully!')
      return { success: true, data: response.data }
    } catch (error) {
      const errorMessage = handleError(error, 'Failed to add progress entry')
      return { success: false, error: errorMessage }
    }
  }, [handleError])

  // Update progress entry
  const updateProgressEntry = useCallback(async (id, entryData) => {
    try {
      dispatch({ type: ProgressActionTypes.SET_LOADING, payload: true })
      const response = await progressService.updateProgressEntry(id, entryData)
      dispatch({ type: ProgressActionTypes.UPDATE_PROGRESS_ENTRY, payload: response.data })
      toast.success('Progress entry updated successfully!')
      return { success: true, data: response.data }
    } catch (error) {
      const errorMessage = handleError(error, 'Failed to update progress entry')
      return { success: false, error: errorMessage }
    }
  }, [handleError])

  // Delete progress entry
  const deleteProgressEntry = useCallback(async (id) => {
    try {
      dispatch({ type: ProgressActionTypes.SET_LOADING, payload: true })
      await progressService.deleteProgressEntry(id)
      dispatch({ type: ProgressActionTypes.DELETE_PROGRESS_ENTRY, payload: id })
      toast.success('Progress entry deleted successfully!')
      return { success: true }
    } catch (error) {
      const errorMessage = handleError(error, 'Failed to delete progress entry')
      return { success: false, error: errorMessage }
    }
  }, [handleError])

  // Fetch personal records
  const fetchPersonalRecords = useCallback(async (params = {}) => {
    try {
      dispatch({ type: ProgressActionTypes.SET_LOADING, payload: true })
      const response = await recordService.getPersonalRecords(params)
      dispatch({ type: ProgressActionTypes.SET_PERSONAL_RECORDS, payload: response.data })
      return response.data
    } catch (error) {
      handleError(error, 'Failed to fetch personal records')
      return []
    }
  }, [handleError])

  // Add personal record
  const addPersonalRecord = useCallback(async (recordData) => {
    try {
      dispatch({ type: ProgressActionTypes.SET_LOADING, payload: true })
      const response = await recordService.addPersonalRecord(recordData)
      dispatch({ type: ProgressActionTypes.ADD_PERSONAL_RECORD, payload: response.data })
      toast.success('Personal record added successfully!')
      return { success: true, data: response.data }
    } catch (error) {
      const errorMessage = handleError(error, 'Failed to add personal record')
      return { success: false, error: errorMessage }
    }
  }, [handleError])

  // Fetch goals
  const fetchGoals = useCallback(async () => {
    try {
      dispatch({ type: ProgressActionTypes.SET_LOADING, payload: true })
      const response = await progressService.getGoals()
      dispatch({ type: ProgressActionTypes.SET_GOALS, payload: response.data })
      return response.data
    } catch (error) {
      handleError(error, 'Failed to fetch goals')
      return []
    }
  }, [handleError])

  // Update goals
  const updateGoals = useCallback(async (goalsData) => {
    try {
      dispatch({ type: ProgressActionTypes.SET_LOADING, payload: true })
      const response = await progressService.updateGoals(goalsData)
      dispatch({ type: ProgressActionTypes.UPDATE_GOALS, payload: response.data })
      toast.success('Goals updated successfully!')
      return { success: true, data: response.data }
    } catch (error) {
      const errorMessage = handleError(error, 'Failed to update goals')
      return { success: false, error: errorMessage }
    }
  }, [handleError])

  // Fetch analytics
  const fetchAnalytics = useCallback(async (params = {}) => {
    try {
      dispatch({ type: ProgressActionTypes.SET_LOADING, payload: true })
      const response = await progressService.getAnalytics(params)
      dispatch({ type: ProgressActionTypes.SET_ANALYTICS, payload: response.data })
      return response.data
    } catch (error) {
      handleError(error, 'Failed to fetch analytics')
      return null
    }
  }, [handleError])

  // Fetch chart data
  const fetchChartData = useCallback(async (params = {}) => {
    try {
      dispatch({ type: ProgressActionTypes.SET_LOADING, payload: true })
      const response = await progressService.getChartData(params)
      dispatch({ type: ProgressActionTypes.SET_CHART_DATA, payload: response.data })
      return response.data
    } catch (error) {
      handleError(error, 'Failed to fetch chart data')
      return {}
    }
  }, [handleError])

  // Fetch milestones
  const fetchMilestones = useCallback(async (params = {}) => {
    try {
      dispatch({ type: ProgressActionTypes.SET_LOADING, payload: true })
      const response = await progressService.getMilestones(params)
      dispatch({ type: ProgressActionTypes.SET_MILESTONES, payload: response.data })
      return response.data
    } catch (error) {
      handleError(error, 'Failed to fetch milestones')
      return []
    }
  }, [handleError])

  // Fetch body composition
  const fetchBodyComposition = useCallback(async (params = {}) => {
    try {
      dispatch({ type: ProgressActionTypes.SET_LOADING, payload: true })
      const response = await progressService.getBodyComposition(params)
      dispatch({ type: ProgressActionTypes.SET_BODY_COMPOSITION, payload: response.data })
      return response.data
    } catch (error) {
      handleError(error, 'Failed to fetch body composition data')
      return []
    }
  }, [handleError])

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: ProgressActionTypes.CLEAR_ERROR })
  }, [])

  // Context value
  const value = {
    // State
    progressEntries: state.progressEntries,
    personalRecords: state.personalRecords,
    goals: state.goals,
    analytics: state.analytics,
    chartData: state.chartData,
    milestones: state.milestones,
    bodyComposition: state.bodyComposition,
    isLoading: state.isLoading,
    error: state.error,
    
    // Actions
    fetchProgressEntries,
    addProgressEntry,
    updateProgressEntry,
    deleteProgressEntry,
    fetchPersonalRecords,
    addPersonalRecord,
    fetchGoals,
    updateGoals,
    fetchAnalytics,
    fetchChartData,
    fetchMilestones,
    fetchBodyComposition,
    clearError
  }

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  )
}

// Custom hook to use progress context
export const useProgress = () => {
  const context = useContext(ProgressContext)
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider')
  }
  return context
}

export default ProgressContext
