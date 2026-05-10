const Joi = require('joi');

// Expert validation
const validateExpertQuery = (data) => {
  const schema = Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10),
    category: Joi.string().valid('Finance', 'Technology', 'Marketing', 'Healthcare', 'Legal', 'Other'),
    search: Joi.string().trim(),
    sortBy: Joi.string().default('rating'),
  });
  return schema.validate(data);
};

// Booking validation
const validateBooking = (data) => {
  const schema = Joi.object({
    expertId: Joi.string().required(),
    timeSlotId: Joi.string().required(),
    clientName: Joi.string().trim().required(),
    clientEmail: Joi.string().email().required(),
    clientPhone: Joi.string().trim().required(),
    bookingDate: Joi.date().required(),
    startTime: Joi.string().required(),
    endTime: Joi.string().required(),
    notes: Joi.string().trim().default(''),
  });
  return schema.validate(data);
};

// Booking status update validation
const validateBookingStatusUpdate = (data) => {
  const schema = Joi.object({
    status: Joi.string().valid('Pending', 'Confirmed', 'Completed', 'Cancelled').required(),
  });
  return schema.validate(data);
};

module.exports = {
  validateExpertQuery,
  validateBooking,
  validateBookingStatusUpdate,
};
