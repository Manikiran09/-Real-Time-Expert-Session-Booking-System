export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const API_ENDPOINTS = {
  // Expert endpoints
  EXPERTS: '/experts',
  EXPERT_DETAIL: (id) => `/experts/${id}`,
  EXPERT_SLOTS: (id) => `/experts/${id}/slots`,

  // Booking endpoints
  BOOKINGS: '/bookings',
  BOOKING_DETAIL: (id) => `/bookings/${id}`,
  BOOKING_CANCEL: (id) => `/bookings/${id}/cancel`,
  MY_BOOKINGS: '/bookings/my-bookings',

  // Auth endpoints (if needed)
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
}
