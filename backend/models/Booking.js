const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    expertId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Expert',
      required: true,
      index: true,
    },
    timeSlotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TimeSlot',
      required: true,
    },
    clientName: {
      type: String,
      required: [true, 'Please provide client name'],
      trim: true,
    },
    clientEmail: {
      type: String,
      required: [true, 'Please provide client email'],
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide valid email'],
      index: true,
    },
    clientPhone: {
      type: String,
      required: [true, 'Please provide client phone'],
      trim: true,
    },
    bookingDate: {
      type: Date,
      required: [true, 'Please provide booking date'],
    },
    startTime: {
      type: String,
      required: [true, 'Please provide start time'],
    },
    endTime: {
      type: String,
      required: [true, 'Please provide end time'],
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

// Index for faster queries
bookingSchema.index({ clientEmail: 1, status: 1 });
bookingSchema.index({ expertId: 1, bookingDate: 1 });
// Partial unique index: only one active (non-cancelled) booking per time slot
bookingSchema.index(
  { timeSlotId: 1 },
  { unique: true, partialFilterExpression: { status: { $ne: 'Cancelled' } } }
);
// Partial unique index: only one active booking per expert+date+time
bookingSchema.index(
  { expertId: 1, bookingDate: 1, startTime: 1 },
  { unique: true, partialFilterExpression: { status: { $ne: 'Cancelled' } } }
);

module.exports = mongoose.model('Booking', bookingSchema);
