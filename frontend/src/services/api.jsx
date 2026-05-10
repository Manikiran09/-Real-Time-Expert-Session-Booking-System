import axios from 'axios'
import { API_BASE_URL } from '../config/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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

const unwrapData = (payload) => payload?.data ?? payload

export const expertService = {
  getAll: async (params = {}) => unwrapData(await apiClient.get('/experts', { params })),
  getById: async (id) => unwrapData(await apiClient.get(`/experts/${id}`)),
}

export const bookingService = {
  create: async (data) => unwrapData(await apiClient.post('/bookings', data)),
  getAll: async () => unwrapData(await apiClient.get('/bookings')),
  getById: async (id) => unwrapData(await apiClient.get(`/bookings/${id}`)),
  cancel: async (id) => unwrapData(await apiClient.delete(`/bookings/${id}`)),
  getMyBookings: async (email) =>
    unwrapData(await apiClient.get('/bookings', { params: { email } })),
}

export default apiClient
