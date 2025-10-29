import { apiMethods } from './api'

export const workoutLogService = {
  // Get workout logs
  getWorkoutLogs: async (params = {}) => {
    return await apiMethods.get('/logs', params)
  },

  // Get single workout log
  getWorkoutLog: async (id) => {
    return await apiMethods.get(`/logs/${id}`)
  },

  // Log a workout
  logWorkout: async (logData) => {
    return await apiMethods.post('/logs', logData)
  },

  // Update workout log
  updateWorkoutLog: async (id, logData) => {
    return await apiMethods.put(`/logs/${id}`, logData)
  },

  // Delete workout log
  deleteWorkoutLog: async (id) => {
    return await apiMethods.delete(`/logs/${id}`)
  },

  // Get workout history for specific workout
  getWorkoutHistory: async (workoutId, params = {}) => {
    return await apiMethods.get(`/logs/workout/${workoutId}`, params)
  },

  // Get exercise history
  getExerciseHistory: async (exerciseId, params = {}) => {
    return await apiMethods.get(`/logs/exercise/${exerciseId}`, params)
  },

  // Get workout statistics
  getWorkoutStats: async (params = {}) => {
    return await apiMethods.get('/logs/stats', params)
  }
}
