import { apiMethods } from './api'

export const socialService = {
  // Follow/Unfollow user
  followUser: async (userId) => {
    return await apiMethods.post(`/users/${userId}/follow`)
  },

  // Get followers
  getFollowers: async (userId = null, params = {}) => {
    const url = userId ? `/users/${userId}/followers` : '/users/profile/followers'
    return await apiMethods.get(url, params)
  },

  // Get following
  getFollowing: async (userId = null, params = {}) => {
    const url = userId ? `/users/${userId}/following` : '/users/profile/following'
    return await apiMethods.get(url, params)
  },

  // Get activity feed
  getActivityFeed: async (params = {}) => {
    return await apiMethods.get('/social/feed', params)
  },

  // Like activity
  likeActivity: async (activityId) => {
    return await apiMethods.post(`/social/activities/${activityId}/like`)
  },

  // Comment on activity
  commentOnActivity: async (activityId, comment) => {
    return await apiMethods.post(`/social/activities/${activityId}/comment`, { text: comment })
  },

  // Search users
  searchUsers: async (query, params = {}) => {
    return await apiMethods.get('/users/search', { q: query, ...params })
  },

  // Get suggested users
  getSuggestedUsers: async (params = {}) => {
    return await apiMethods.get('/users/suggestions', params)
  },

  // Get notifications
  getNotifications: async (params = {}) => {
    return await apiMethods.get('/notifications', params)
  },

  // Mark notification as read
  markNotificationRead: async (notificationId) => {
    return await apiMethods.put(`/notifications/${notificationId}/read`)
  },

  // Mark all notifications as read
  markAllNotificationsRead: async () => {
    return await apiMethods.put('/notifications/mark-all-read')
  },

  // Get user profile (public)
  getUserProfile: async (userId) => {
    return await apiMethods.get(`/users/${userId}`)
  }
}
