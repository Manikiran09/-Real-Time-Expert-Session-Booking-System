const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema(
  {
    expertId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Expert',
      required: true,
      index: true,
    },
    // Stored as 'YYYY-MM-DD' string — matches actual DB documents
    date: {
      type: String,
      required: [true, 'Please provide date'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'],
    },
    startTime: {
      type: String,
      required: [true, 'Please provide start time'],
    },
    endTime: {
      type: String,
      required: [true, 'Please provide end time'],
    },
    isBooked: {
      type: Boolean,
      default: false,
    },
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
    // capacity/currentBookings absent in real DB — default gracefully
    capacity: {
      type: Number,
      default: 1,
    },
    currentBookings: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Compound index to prevent double booking
timeSlotSchema.index({ expertId: 1, date: 1, startTime: 1 }, { unique: true });

module.exports = mongoose.model('TimeSlot', timeSlotSchema);
