import { apiMethods } from './api'

export const authService = {
  // Register new user
  register: async (userData) => {
    return await apiMethods.post('/auth/register', userData)
  },

  // Login user
  login: async (credentials) => {
    return await apiMethods.post('/auth/login', credentials)
  },

  // Logout user
  logout: async () => {
    return await apiMethods.post('/auth/logout')
  },

  // Get current user profile
  getProfile: async () => {
    return await apiMethods.get('/auth/me')
  },

  // Update user profile
  updateProfile: async (userData) => {
    return await apiMethods.put('/auth/update-details', userData)
  },

  // Update password
  updatePassword: async (passwordData) => {
    return await apiMethods.put('/auth/update-password', passwordData)
  },

  // Forgot password
  forgotPassword: async (email) => {
    return await apiMethods.post('/auth/forgot-password', { email })
  },

  // Reset password
  resetPassword: async (token, password) => {
    return await apiMethods.put(`/auth/reset-password/${token}`, { password })
  },

  // Verify email
  verifyEmail: async (token) => {
    return await apiMethods.post(`/auth/verify-email/${token}`)
  },

  // Upload profile picture
  uploadProfilePicture: async (file) => {
    return await apiMethods.postFile('/users/profile/photo', {}, 'profilePic', file)
  }
}
