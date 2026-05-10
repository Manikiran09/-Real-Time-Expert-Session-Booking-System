import axios from 'axios';
import config from '../config/api';

const apiClient = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: config.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Experts API
export const expertsAPI = {
  getAllExperts: (page = 1, limit = 10, category = '', search = '') => {
    return apiClient.get('/experts', {
      params: {
        page,
        limit,
        category: category || undefined,
        search: search || undefined,
      },
    });
  },

  getExpertById: (id) => {
    return apiClient.get(`/experts/${id}`);
  },

  getCategories: () => {
    return apiClient.get('/experts/categories');
  },
};

// Bookings API
export const bookingsAPI = {
  createBooking: (bookingData) => {
    return apiClient.post('/bookings', bookingData);
  },

  getBookingsByEmail: (email) => {
    return apiClient.get('/bookings', {
      params: { email },
    });
  },

  getBookingById: (id) => {
    return apiClient.get(`/bookings/${id}`);
  },

  updateBookingStatus: (id, status) => {
    return apiClient.patch(`/bookings/${id}/status`, { status });
  },

  cancelBooking: (id) => {
    return apiClient.delete(`/bookings/${id}`);
  },
};

export default apiClient;
