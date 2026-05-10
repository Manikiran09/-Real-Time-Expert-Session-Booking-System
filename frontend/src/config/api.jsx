export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000/api'

export const API_ENDPOINTS = {
  // Expert endpoints
  EXPERTS: '/experts',
  EXPERT_DETAIL: (id) => `/experts/${id}`,
  EXPERT_CATEGORIES: '/experts/categories',

  // Booking endpoints
  BOOKINGS: '/bookings',
  BOOKING_DETAIL: (id) => `/bookings/${id}`,
  BOOKING_CANCEL: (id) => `/bookings/${id}`,   // DELETE /:id
  BOOKING_STATUS: (id) => `/bookings/${id}/status`,
  MY_BOOKINGS: (email) => `/bookings?email=${encodeURIComponent(email)}`,
}
