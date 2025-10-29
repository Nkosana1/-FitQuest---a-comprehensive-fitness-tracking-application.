import { apiMethods } from './api'

export const recordService = {
  // Get personal records
  getPersonalRecords: async (params = {}) => {
    return await apiMethods.get('/records', params)
  },

  // Get single personal record
  getPersonalRecord: async (id) => {
    return await apiMethods.get(`/records/${id}`)
  },

  // Add personal record
  addPersonalRecord: async (recordData) => {
    return await apiMethods.post('/records', recordData)
  },

  // Update personal record
  updatePersonalRecord: async (id, recordData) => {
    return await apiMethods.put(`/records/${id}`, recordData)
  },

  // Delete personal record
  deletePersonalRecord: async (id) => {
    return await apiMethods.delete(`/records/${id}`)
  },

  // Get records for specific exercise
  getExerciseRecords: async (exerciseId) => {
    return await apiMethods.get(`/records/exercise/${exerciseId}`)
  },

  // Get recent records
  getRecentRecords: async (params = {}) => {
    return await apiMethods.get('/records/recent', params)
  },

  // Get records summary
  getRecordsSummary: async () => {
    return await apiMethods.get('/records/summary')
  },

  // Get exercise leaderboard
  getExerciseLeaderboard: async (exerciseId, params = {}) => {
    return await apiMethods.get(`/records/exercise/${exerciseId}/leaderboard`, params)
  },

  // Get strength standards
  getStrengthStandards: async (exerciseId) => {
    return await apiMethods.get(`/records/exercise/${exerciseId}/standards`)
  },

  // Get record progress over time
  getRecordProgress: async (exerciseId, params = {}) => {
    return await apiMethods.get(`/records/exercise/${exerciseId}/progress`, params)
  }
}
