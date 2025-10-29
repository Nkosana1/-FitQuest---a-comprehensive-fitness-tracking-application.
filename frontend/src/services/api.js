import axios from 'axios'
import toast from 'react-hot-toast'

// Base URL for API
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    const { response } = error

    // Handle network errors
    if (!response) {
      toast.error('Network error. Please check your connection.')
      return Promise.reject(error)
    }

    // Handle authentication errors
    if (response.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/auth/login'
      return Promise.reject(error)
    }

    // Handle server errors
    if (response.status >= 500) {
      toast.error('Server error. Please try again later.')
      return Promise.reject(error)
    }

    // Handle rate limiting
    if (response.status === 429) {
      toast.error('Too many requests. Please wait a moment.')
      return Promise.reject(error)
    }

    return Promise.reject(error)
  }
)

// Helper function to handle file uploads
export const createFormData = (data, fileField = null, file = null) => {
  const formData = new FormData()
  
  // Add file if provided
  if (fileField && file) {
    formData.append(fileField, file)
  }
  
  // Add other data
  Object.keys(data).forEach((key) => {
    if (data[key] !== null && data[key] !== undefined) {
      if (typeof data[key] === 'object' && !(data[key] instanceof File)) {
        formData.append(key, JSON.stringify(data[key]))
      } else {
        formData.append(key, data[key])
      }
    }
  })
  
  return formData
}

// Helper function to build query string
export const buildQueryString = (params) => {
  const searchParams = new URLSearchParams()
  
  Object.keys(params).forEach((key) => {
    if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
      if (Array.isArray(params[key])) {
        params[key].forEach((value) => searchParams.append(key, value))
      } else {
        searchParams.append(key, params[key])
      }
    }
  })
  
  return searchParams.toString()
}

// API methods
export const apiMethods = {
  // GET request
  get: async (url, params = {}) => {
    const queryString = buildQueryString(params)
    const fullUrl = queryString ? `${url}?${queryString}` : url
    return await api.get(fullUrl)
  },

  // POST request
  post: async (url, data = {}) => {
    return await api.post(url, data)
  },

  // PUT request
  put: async (url, data = {}) => {
    return await api.put(url, data)
  },

  // DELETE request
  delete: async (url) => {
    return await api.delete(url)
  },

  // POST request with file upload
  postFile: async (url, data = {}, fileField = null, file = null) => {
    const formData = createFormData(data, fileField, file)
    return await api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  // PUT request with file upload
  putFile: async (url, data = {}, fileField = null, file = null) => {
    const formData = createFormData(data, fileField, file)
    return await api.put(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
}

// Export axios instance for direct use if needed
export default api
