const express = require('express');
const router = express.Router();
const {
  createBooking,
  getBookingsByEmail,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
} = require('../controllers/bookingController');

// Create booking
router.post('/', createBooking);

// Get bookings by email
router.get('/', getBookingsByEmail);

// Get booking by ID
router.get('/:id', getBookingById);

// Update booking status
router.patch('/:id/status', updateBookingStatus);

// Cancel booking
router.delete('/:id', cancelBooking);

module.exports = router;
