const Booking = require('../models/Booking');
const TimeSlot = require('../models/TimeSlot');
const Expert = require('../models/Expert');
const { getCancelledCutoffDate } = require('../utils/bookingMaintenance');
const { validateBooking, validateBookingStatusUpdate } = require('../middleware/validation');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Normalise any date value to a 'YYYY-MM-DD' string.
 * Handles: plain 'YYYY-MM-DD' strings, ISO strings, and Date objects.
 */
const toDateStr = (d) => {
  if (!d) return '';
  if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  return new Date(d).toISOString().split('T')[0];
};

// ---------------------------------------------------------------------------
// POST /api/bookings
//
// Double-booking prevention WITHOUT transactions (works on standalone MongoDB):
//  1. Atomically flip isBooked false→true via findOneAndUpdate.
//     The filter includes isBooked:false so only one concurrent request wins.
//  2. Unique index on Booking.timeSlotId (partial, non-cancelled) is a
//     second safety net catching any race that slips through step 1.
//  3. On Booking.save() failure the slot reservation is rolled back.
// ---------------------------------------------------------------------------
exports.createBooking = async (req, res, next) => {
  try {
    const { error, value } = validateBooking(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const {
      expertId, timeSlotId,
      clientName, clientEmail, clientPhone,
      bookingDate, startTime, endTime, notes,
    } = value;

    // 1. Verify expert
    const expert = await Expert.findById(expertId);
    if (!expert) {
      return res.status(404).json({ success: false, message: 'Expert not found' });
    }

    // 2. Verify slot exists and belongs to this expert
    const existingSlot = await TimeSlot.findById(timeSlotId);
    if (!existingSlot) {
      return res.status(404).json({ success: false, message: 'Time slot not found' });
    }
    if (String(existingSlot.expertId) !== String(expertId)) {
      return res.status(400).json({
        success: false,
        message: 'Selected time slot does not belong to this expert',
      });
    }

    // 3. Validate date/time matches the slot record
    const requestedDate = toDateStr(bookingDate);
    const slotDate = toDateStr(existingSlot.date);
    if (requestedDate !== slotDate || startTime !== existingSlot.startTime || endTime !== existingSlot.endTime) {
      return res.status(400).json({
        success: false,
        message: 'Booking date/time does not match selected time slot',
      });
    }

    // 4. Pre-generate booking doc (not saved yet) so we have its _id for the slot
    const booking = new Booking({
      expertId,
      timeSlotId,
      clientName,
      clientEmail,
      clientPhone,
      bookingDate: requestedDate,
      startTime,
      endTime,
      notes: notes || '',
      amount: expert.hourlyRate,
      status: 'Pending',
    });

    // 5. Atomically claim the slot — only wins if isBooked is still false.
    //    No replica set / transaction required.
    const reservedSlot = await TimeSlot.findOneAndUpdate(
      {
        _id: timeSlotId,
        expertId,
        isBooked: false,
        // Handle real DB docs that may be missing capacity/currentBookings
        $or: [
          { capacity: { $exists: true }, $expr: { $lt: ['$currentBookings', '$capacity'] } },
          { capacity: { $exists: false } },
          { currentBookings: { $exists: false } },
        ],
      },
      {
        $set: { isBooked: true, bookedBy: booking._id },
        $inc: { currentBookings: 1 },
      },
      { new: true }
    );

    if (!reservedSlot) {
      return res.status(409).json({
        success: false,
        message: 'Time slot is already booked. Please choose another slot.',
      });
    }

    // 6. Persist the booking
    try {
      await booking.save();
    } catch (saveErr) {
      // Roll back the slot so it becomes available again
      await TimeSlot.findByIdAndUpdate(timeSlotId, {
        $set: { isBooked: false, bookedBy: null },
        $inc: { currentBookings: -1 },
      });

      if (saveErr.code === 11000) {
        return res.status(409).json({
          success: false,
          message: 'This time slot has already been booked. Please choose another slot.',
        });
      }
      throw saveErr;
    }

    // 7. Increment expert booking counter (best-effort)
    await Expert.findByIdAndUpdate(expertId, { $inc: { totalBookings: 1 } });

    // 8. Real-time notification
    const io = req.app.get('io');
    if (io) {
      io.emit('slot-booked', { expertId, timeSlotId, status: 'booked', bookingId: booking._id });
    }

    return res.status(201).json({ success: true, message: 'Booking created successfully', data: booking });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'This time slot has already been booked. Please choose another slot.',
      });
    }
    next(error);
  }
};

// ---------------------------------------------------------------------------
// GET /api/bookings?email=
// ---------------------------------------------------------------------------
exports.getBookingsByEmail = async (req, res, next) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const bookings = await Booking.find({
      clientEmail: email.trim().toLowerCase(),
      $or: [
        { status: { $ne: 'Cancelled' } },
        { cancelledAt: { $gt: getCancelledCutoffDate() } },
        { cancelledAt: null },
      ],
    })
      .populate('expertId', 'name category hourlyRate profileImage')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// GET /api/bookings/:id
// ---------------------------------------------------------------------------
exports.getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('expertId')
      .populate('timeSlotId')
      .lean();

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    return res.status(200).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// PATCH /api/bookings/:id/status
// ---------------------------------------------------------------------------
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error, value } = validateBookingStatusUpdate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    if (value.status === 'Cancelled') {
      return _cancelBookingById(id, req, res, next);
    }

    const booking = await Booking.findByIdAndUpdate(
      id,
      { status: value.status, cancelledAt: null },
      { new: true, runValidators: true }
    );
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const io = req.app.get('io');
    if (io) io.emit('booking-status-updated', { bookingId: id, newStatus: value.status });

    return res.status(200).json({
      success: true,
      message: 'Booking status updated successfully',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// DELETE /api/bookings/:id  — cancel booking
//
// Without transactions, atomicity is achieved by:
//  1. findOneAndUpdate with { status: { $ne: 'Cancelled' } } — exactly one
//     concurrent request wins; others get a 400 "already cancelled".
//  2. TimeSlot freed with a single findByIdAndUpdate — atomic at document level.
// ---------------------------------------------------------------------------
exports.cancelBooking = async (req, res, next) => {
  return _cancelBookingById(req.params.id, req, res, next);
};

// Shared implementation used by cancelBooking and updateBookingStatus
async function _cancelBookingById(id, req, res, next) {
  try {
    // Atomically mark as Cancelled — filter prevents double-cancel
    const booking = await Booking.findOneAndUpdate(
      { _id: id, status: { $ne: 'Cancelled' } },
      { $set: { status: 'Cancelled', cancelledAt: new Date() } },
      { new: true }
    );

    if (!booking) {
      const exists = await Booking.exists({ _id: id });
      if (!exists) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }
      return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
    }

    // Free the time slot in one atomic write
    await TimeSlot.findByIdAndUpdate(booking.timeSlotId, {
      $set: { isBooked: false, bookedBy: null, currentBookings: 0 },
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('booking-status-updated', { bookingId: String(id), newStatus: 'Cancelled' });
      io.emit('slot-freed', {
        expertId: booking.expertId,
        timeSlotId: booking.timeSlotId,
        status: 'available',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = exports;
