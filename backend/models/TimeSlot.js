const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema(
  {
    expertId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Expert',
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: [true, 'Please provide date'],
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
