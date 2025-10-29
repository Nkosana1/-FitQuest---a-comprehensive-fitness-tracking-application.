import { apiMethods } from './api'

export const progressService = {
  // Get progress entries
  getProgressEntries: async (params = {}) => {
    return await apiMethods.get('/progress', params)
  },

  // Get single progress entry
  getProgressEntry: async (id) => {
    return await apiMethods.get(`/progress/${id}`)
  },

  // Add progress entry
  addProgressEntry: async (entryData) => {
    return await apiMethods.post('/progress', entryData)
  },

  // Update progress entry
  updateProgressEntry: async (id, entryData) => {
    return await apiMethods.put(`/progress/${id}`, entryData)
  },

  // Delete progress entry
  deleteProgressEntry: async (id) => {
    return await apiMethods.delete(`/progress/${id}`)
  },

  // Get progress analytics
  getAnalytics: async (params = {}) => {
    return await apiMethods.get('/progress/analytics', params)
  },

  // Get chart data
  getChartData: async (params = {}) => {
    return await apiMethods.get('/progress/charts', params)
  },

  // Get goals
  getGoals: async () => {
    return await apiMethods.get('/progress/goals')
  },

  // Update goals
  updateGoals: async (goals) => {
    return await apiMethods.put('/progress/goals', { goals })
  },

  // Get milestones
  getMilestones: async (params = {}) => {
    return await apiMethods.get('/progress/milestones', params)
  },

  // Get body composition data
  getBodyComposition: async (params = {}) => {
    return await apiMethods.get('/progress/composition', params)
  },

  // Upload progress photos
  uploadProgressPhotos: async (id, files) => {
    const formData = new FormData()
    
    files.forEach((file) => {
      formData.append('photos', file)
    })
    
    return await apiMethods.postFile(`/progress/${id}/photos`, {}, null, null, formData)
  }
}
