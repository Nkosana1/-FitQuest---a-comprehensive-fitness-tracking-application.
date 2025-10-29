import { createContext, useContext, useReducer, useCallback } from 'react'
import { socialService } from '../services/socialService'
import toast from 'react-hot-toast'

// Initial state
const initialState = {
  followers: [],
  following: [],
  activityFeed: [],
  suggestedUsers: [],
  searchResults: [],
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null
}

// Action types
const SocialActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  
  // Followers/Following
  SET_FOLLOWERS: 'SET_FOLLOWERS',
  SET_FOLLOWING: 'SET_FOLLOWING',
  ADD_FOLLOWER: 'ADD_FOLLOWER',
  REMOVE_FOLLOWER: 'REMOVE_FOLLOWER',
  ADD_FOLLOWING: 'ADD_FOLLOWING',
  REMOVE_FOLLOWING: 'REMOVE_FOLLOWING',
  
  // Activity Feed
  SET_ACTIVITY_FEED: 'SET_ACTIVITY_FEED',
  ADD_ACTIVITY: 'ADD_ACTIVITY',
  UPDATE_ACTIVITY: 'UPDATE_ACTIVITY',
  
  // User Discovery
  SET_SUGGESTED_USERS: 'SET_SUGGESTED_USERS',
  SET_SEARCH_RESULTS: 'SET_SEARCH_RESULTS',
  
  // Notifications
  SET_NOTIFICATIONS: 'SET_NOTIFICATIONS',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  MARK_NOTIFICATION_READ: 'MARK_NOTIFICATION_READ',
  MARK_ALL_NOTIFICATIONS_READ: 'MARK_ALL_NOTIFICATIONS_READ',
  SET_UNREAD_COUNT: 'SET_UNREAD_COUNT'
}

// Reducer
const socialReducer = (state, action) => {
  switch (action.type) {
    case SocialActionTypes.SET_LOADING:
      return { ...state, isLoading: action.payload }
    
    case SocialActionTypes.SET_ERROR:
      return { ...state, error: action.payload, isLoading: false }
    
    case SocialActionTypes.CLEAR_ERROR:
      return { ...state, error: null }
    
    case SocialActionTypes.SET_FOLLOWERS:
      return { ...state, followers: action.payload, isLoading: false }
    
    case SocialActionTypes.SET_FOLLOWING:
      return { ...state, following: action.payload, isLoading: false }
    
    case SocialActionTypes.ADD_FOLLOWER:
      return { 
        ...state, 
        followers: [action.payload, ...state.followers],
        isLoading: false 
      }
    
    case SocialActionTypes.REMOVE_FOLLOWER:
      return {
        ...state,
        followers: state.followers.filter(user => user._id !== action.payload),
        isLoading: false
      }
    
    case SocialActionTypes.ADD_FOLLOWING:
      return { 
        ...state, 
        following: [action.payload, ...state.following],
        isLoading: false 
      }
    
    case SocialActionTypes.REMOVE_FOLLOWING:
      return {
        ...state,
        following: state.following.filter(user => user._id !== action.payload),
        isLoading: false
      }
    
    case SocialActionTypes.SET_ACTIVITY_FEED:
      return { ...state, activityFeed: action.payload, isLoading: false }
    
    case SocialActionTypes.ADD_ACTIVITY:
      return { 
        ...state, 
        activityFeed: [action.payload, ...state.activityFeed],
        isLoading: false 
      }
    
    case SocialActionTypes.UPDATE_ACTIVITY:
      return {
        ...state,
        activityFeed: state.activityFeed.map(activity =>
          activity._id === action.payload._id ? action.payload : activity
        ),
        isLoading: false
      }
    
    case SocialActionTypes.SET_SUGGESTED_USERS:
      return { ...state, suggestedUsers: action.payload, isLoading: false }
    
    case SocialActionTypes.SET_SEARCH_RESULTS:
      return { ...state, searchResults: action.payload, isLoading: false }
    
    case SocialActionTypes.SET_NOTIFICATIONS:
      return { ...state, notifications: action.payload, isLoading: false }
    
    case SocialActionTypes.ADD_NOTIFICATION:
      return { 
        ...state, 
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + 1,
        isLoading: false 
      }
    
    case SocialActionTypes.MARK_NOTIFICATION_READ:
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification._id === action.payload 
            ? { ...notification, isRead: true }
            : notification
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
        isLoading: false
      }
    
    case SocialActionTypes.MARK_ALL_NOTIFICATIONS_READ:
      return {
        ...state,
        notifications: state.notifications.map(notification => ({
          ...notification,
          isRead: true
        })),
        unreadCount: 0,
        isLoading: false
      }
    
    case SocialActionTypes.SET_UNREAD_COUNT:
      return { ...state, unreadCount: action.payload }
    
    default:
      return state
  }
}

// Create context
const SocialContext = createContext()

// SocialProvider component
export const SocialProvider = ({ children }) => {
  const [state, dispatch] = useReducer(socialReducer, initialState)

  // Error handler
  const handleError = useCallback((error, defaultMessage = 'An error occurred') => {
    const errorMessage = error.response?.data?.error?.message || defaultMessage
    dispatch({ type: SocialActionTypes.SET_ERROR, payload: errorMessage })
    toast.error(errorMessage)
    return errorMessage
  }, [])

  // Follow user
  const followUser = useCallback(async (userId) => {
    try {
      dispatch({ type: SocialActionTypes.SET_LOADING, payload: true })
      const response = await socialService.followUser(userId)
      
      if (response.data.following) {
        // User followed successfully
        dispatch({ type: SocialActionTypes.ADD_FOLLOWING, payload: { _id: userId } })
        toast.success('User followed successfully!')
      } else {
        // User unfollowed
        dispatch({ type: SocialActionTypes.REMOVE_FOLLOWING, payload: userId })
        toast.success('User unfollowed successfully!')
      }
      
      return { success: true, data: response.data }
    } catch (error) {
      const errorMessage = handleError(error, 'Failed to follow/unfollow user')
      return { success: false, error: errorMessage }
    }
  }, [handleError])

  // Fetch followers
  const fetchFollowers = useCallback(async (userId = null, params = {}) => {
    try {
      dispatch({ type: SocialActionTypes.SET_LOADING, payload: true })
      const response = await socialService.getFollowers(userId, params)
      dispatch({ type: SocialActionTypes.SET_FOLLOWERS, payload: response.data })
      return response.data
    } catch (error) {
      handleError(error, 'Failed to fetch followers')
      return []
    }
  }, [handleError])

  // Fetch following
  const fetchFollowing = useCallback(async (userId = null, params = {}) => {
    try {
      dispatch({ type: SocialActionTypes.SET_LOADING, payload: true })
      const response = await socialService.getFollowing(userId, params)
      dispatch({ type: SocialActionTypes.SET_FOLLOWING, payload: response.data })
      return response.data
    } catch (error) {
      handleError(error, 'Failed to fetch following')
      return []
    }
  }, [handleError])

  // Fetch activity feed
  const fetchActivityFeed = useCallback(async (params = {}) => {
    try {
      dispatch({ type: SocialActionTypes.SET_LOADING, payload: true })
      const response = await socialService.getActivityFeed(params)
      dispatch({ type: SocialActionTypes.SET_ACTIVITY_FEED, payload: response.data })
      return response.data
    } catch (error) {
      handleError(error, 'Failed to fetch activity feed')
      return []
    }
  }, [handleError])

  // Like activity
  const likeActivity = useCallback(async (activityId) => {
    try {
      const response = await socialService.likeActivity(activityId)
      
      // Update the activity in the feed
      dispatch({
        type: SocialActionTypes.UPDATE_ACTIVITY,
        payload: {
          _id: activityId,
          ...response.data
        }
      })
      
      return { success: true, data: response.data }
    } catch (error) {
      const errorMessage = handleError(error, 'Failed to like activity')
      return { success: false, error: errorMessage }
    }
  }, [handleError])

  // Comment on activity
  const commentOnActivity = useCallback(async (activityId, comment) => {
    try {
      const response = await socialService.commentOnActivity(activityId, comment)
      
      // Update the activity in the feed
      dispatch({
        type: SocialActionTypes.UPDATE_ACTIVITY,
        payload: {
          _id: activityId,
          ...response.data
        }
      })
      
      toast.success('Comment added successfully!')
      return { success: true, data: response.data }
    } catch (error) {
      const errorMessage = handleError(error, 'Failed to add comment')
      return { success: false, error: errorMessage }
    }
  }, [handleError])

  // Search users
  const searchUsers = useCallback(async (query, params = {}) => {
    try {
      dispatch({ type: SocialActionTypes.SET_LOADING, payload: true })
      const response = await socialService.searchUsers(query, params)
      dispatch({ type: SocialActionTypes.SET_SEARCH_RESULTS, payload: response.data })
      return response.data
    } catch (error) {
      handleError(error, 'Failed to search users')
      return []
    }
  }, [handleError])

  // Fetch suggested users
  const fetchSuggestedUsers = useCallback(async (params = {}) => {
    try {
      dispatch({ type: SocialActionTypes.SET_LOADING, payload: true })
      const response = await socialService.getSuggestedUsers(params)
      dispatch({ type: SocialActionTypes.SET_SUGGESTED_USERS, payload: response.data })
      return response.data
    } catch (error) {
      handleError(error, 'Failed to fetch suggested users')
      return []
    }
  }, [handleError])

  // Fetch notifications
  const fetchNotifications = useCallback(async (params = {}) => {
    try {
      dispatch({ type: SocialActionTypes.SET_LOADING, payload: true })
      const response = await socialService.getNotifications(params)
      dispatch({ type: SocialActionTypes.SET_NOTIFICATIONS, payload: response.data })
      dispatch({ type: SocialActionTypes.SET_UNREAD_COUNT, payload: response.unreadCount || 0 })
      return response.data
    } catch (error) {
      handleError(error, 'Failed to fetch notifications')
      return []
    }
  }, [handleError])

  // Mark notification as read
  const markNotificationRead = useCallback(async (notificationId) => {
    try {
      await socialService.markNotificationRead(notificationId)
      dispatch({ type: SocialActionTypes.MARK_NOTIFICATION_READ, payload: notificationId })
      return { success: true }
    } catch (error) {
      const errorMessage = handleError(error, 'Failed to mark notification as read')
      return { success: false, error: errorMessage }
    }
  }, [handleError])

  // Mark all notifications as read
  const markAllNotificationsRead = useCallback(async () => {
    try {
      dispatch({ type: SocialActionTypes.SET_LOADING, payload: true })
      await socialService.markAllNotificationsRead()
      dispatch({ type: SocialActionTypes.MARK_ALL_NOTIFICATIONS_READ })
      toast.success('All notifications marked as read!')
      return { success: true }
    } catch (error) {
      const errorMessage = handleError(error, 'Failed to mark all notifications as read')
      return { success: false, error: errorMessage }
    }
  }, [handleError])

  // Add new activity (for real-time updates)
  const addActivity = useCallback((activity) => {
    dispatch({ type: SocialActionTypes.ADD_ACTIVITY, payload: activity })
  }, [])

  // Add new notification (for real-time updates)
  const addNotification = useCallback((notification) => {
    dispatch({ type: SocialActionTypes.ADD_NOTIFICATION, payload: notification })
  }, [])

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: SocialActionTypes.CLEAR_ERROR })
  }, [])

  // Context value
  const value = {
    // State
    followers: state.followers,
    following: state.following,
    activityFeed: state.activityFeed,
    suggestedUsers: state.suggestedUsers,
    searchResults: state.searchResults,
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    isLoading: state.isLoading,
    error: state.error,
    
    // Actions
    followUser,
    fetchFollowers,
    fetchFollowing,
    fetchActivityFeed,
    likeActivity,
    commentOnActivity,
    searchUsers,
    fetchSuggestedUsers,
    fetchNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    addActivity,
    addNotification,
    clearError
  }

  return (
    <SocialContext.Provider value={value}>
      {children}
    </SocialContext.Provider>
  )
}

// Custom hook to use social context
export const useSocial = () => {
  const context = useContext(SocialContext)
  if (!context) {
    throw new Error('useSocial must be used within a SocialProvider')
  }
  return context
}

export default SocialContext
