const mongoose = require('mongoose');

const expertSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide expert name'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please provide category'],
      enum: ['Finance', 'Technology', 'Marketing', 'Healthcare', 'Legal', 'Other'],
    },
    experience: {
      type: Number,
      required: [true, 'Please provide years of experience'],
      min: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    bio: {
      type: String,
      trim: true,
    },
    hourlyRate: {
      type: Number,
      required: [true, 'Please provide hourly rate'],
      min: 0,
    },
    profileImage: {
      type: String,
      default: 'https://via.placeholder.com/150',
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
    totalBookings: {
      type: Number,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Expert', expertSchema);
