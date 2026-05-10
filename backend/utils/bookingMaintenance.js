const Booking = require('../models/Booking');

const CANCELLED_RETENTION_DAYS = 2;

const getCancelledCutoffDate = () => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - CANCELLED_RETENTION_DAYS);
  return cutoff;
};

const cleanupExpiredCancelledBookings = async () => {
  const cutoffDate = getCancelledCutoffDate();
  const result = await Booking.deleteMany({
    status: 'Cancelled',
    cancelledAt: { $lte: cutoffDate },
  });

  return {
    deletedCount: result.deletedCount || 0,
    cutoffDate,
  };
};

module.exports = {
  CANCELLED_RETENTION_DAYS,
  getCancelledCutoffDate,
  cleanupExpiredCancelledBookings,
};
