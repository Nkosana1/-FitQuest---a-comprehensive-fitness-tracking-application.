import { apiMethods } from './api'

export const workoutService = {
  // Get all workouts
  getWorkouts: async (params = {}) => {
    return await apiMethods.get('/workouts', params)
  },

  // Get single workout
  getWorkout: async (id) => {
    return await apiMethods.get(`/workouts/${id}`)
  },

  // Create new workout
  createWorkout: async (workoutData) => {
    return await apiMethods.post('/workouts', workoutData)
  },

  // Update workout
  updateWorkout: async (id, workoutData) => {
    return await apiMethods.put(`/workouts/${id}`, workoutData)
  },

  // Delete workout
  deleteWorkout: async (id) => {
    return await apiMethods.delete(`/workouts/${id}`)
  },

  // Duplicate workout
  duplicateWorkout: async (id) => {
    return await apiMethods.post(`/workouts/${id}/duplicate`)
  },

  // Like/Unlike workout
  likeWorkout: async (id) => {
    return await apiMethods.post(`/workouts/${id}/like`)
  },

  // Rate workout
  rateWorkout: async (id, rating) => {
    return await apiMethods.post(`/workouts/${id}/rate`, { rating })
  },

  // Get popular workouts
  getPopularWorkouts: async (params = {}) => {
    return await apiMethods.get('/workouts/popular', params)
  },

  // Get workout analytics (for creators)
  getWorkoutAnalytics: async (id) => {
    return await apiMethods.get(`/workouts/${id}/analytics`)
  },

  // Search workouts
  searchWorkouts: async (query, params = {}) => {
    return await apiMethods.get('/workouts', { search: query, ...params })
  }
}
