import { apiMethods } from './api'

export const exerciseService = {
  // Get all exercises
  getExercises: async (params = {}) => {
    return await apiMethods.get('/exercises', params)
  },

  // Get single exercise
  getExercise: async (id) => {
    return await apiMethods.get(`/exercises/${id}`)
  },

  // Create new exercise
  createExercise: async (exerciseData) => {
    return await apiMethods.post('/exercises', exerciseData)
  },

  // Update exercise
  updateExercise: async (id, exerciseData) => {
    return await apiMethods.put(`/exercises/${id}`, exerciseData)
  },

  // Delete exercise
  deleteExercise: async (id) => {
    return await apiMethods.delete(`/exercises/${id}`)
  },

  // Get exercises by muscle group
  getExercisesByMuscleGroup: async (muscleGroup, params = {}) => {
    return await apiMethods.get(`/exercises/muscle/${muscleGroup}`, params)
  },

  // Search exercises
  searchExercises: async (query, params = {}) => {
    return await apiMethods.get('/exercises/search', { q: query, ...params })
  },

  // Get popular exercises
  getPopularExercises: async (params = {}) => {
    return await apiMethods.get('/exercises/popular', params)
  },

  // Rate exercise
  rateExercise: async (id, rating) => {
    return await apiMethods.post(`/exercises/${id}/rate`, { rating })
  },

  // Get exercise filters/categories
  getExerciseFilters: async () => {
    return await apiMethods.get('/exercises/filters')
  },

  // Get exercise variations
  getExerciseVariations: async (id) => {
    return await apiMethods.get(`/exercises/${id}/variations`)
  },

  // Add exercise variation
  addExerciseVariation: async (id, variationId) => {
    return await apiMethods.post(`/exercises/${id}/variations`, { variationId })
  },

  // Upload exercise media
  uploadExerciseMedia: async (id, files) => {
    const formData = new FormData()
    
    files.images?.forEach((file) => {
      formData.append('images', file)
    })
    
    files.videos?.forEach((file) => {
      formData.append('videos', file)
    })
    
    return await apiMethods.postFile(`/exercises/${id}/media`, {}, null, null, formData)
  }
}
