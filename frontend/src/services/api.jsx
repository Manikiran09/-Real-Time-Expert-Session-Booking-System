import axios from 'axios'
import { API_BASE_URL } from '../config/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 10000,
})

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle responses
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken')
      window.location.href = '/login'
    }
    
    if (error.response?.status === 403) {
      console.error('Access forbidden. Please check CORS configuration.')
    }
    
    if (error.response?.status === 0 || error.code === 'ECONNABORTED') {
      return Promise.reject({
        message: 'Network error. Backend server may be unavailable.',
      })
    }
    
    return Promise.reject(error.response?.data || { message: error.message })
  }
)

export const expertService = {
  getAll: () => apiClient.get('/experts'),
  getById: (id) => apiClient.get(`/experts/${id}`),
  getSlots: (id) => apiClient.get(`/experts/${id}/slots`),
}

export const bookingService = {
  create: (data) => apiClient.post('/bookings', data),
  getAll: () => apiClient.get('/bookings'),
  getById: (id) => apiClient.get(`/bookings/${id}`),
  cancel: (id) => apiClient.put(`/bookings/${id}/cancel`),
  getMyBookings: () => apiClient.get('/bookings/my-bookings'),
}

export default apiClient
