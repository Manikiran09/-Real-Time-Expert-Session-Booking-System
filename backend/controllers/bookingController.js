const Booking = require('../models/Booking');
const TimeSlot = require('../models/TimeSlot');
const Expert = require('../models/Expert');
const { validateBooking, validateBookingStatusUpdate } = require('../middleware/validation');

// Create booking with double-booking prevention
exports.createBooking = async (req, res, next) => {
  try {
    const { error, value } = validateBooking(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const {
      expertId,
      timeSlotId,
      clientName,
      clientEmail,
      clientPhone,
      bookingDate,
      startTime,
      endTime,
      notes,
    } = value;

    // Check if time slot exists and is available
    const timeSlot = await TimeSlot.findById(timeSlotId);
    if (!timeSlot) {
      return res.status(404).json({
        success: false,
        message: 'Time slot not found',
      });
    }

    if (timeSlot.isBooked || timeSlot.currentBookings >= timeSlot.capacity) {
      return res.status(400).json({
        success: false,
        message: 'Time slot is already booked',
      });
    }

    // Verify expert exists
    const expert = await Expert.findById(expertId);
    if (!expert) {
      return res.status(404).json({
        success: false,
        message: 'Expert not found',
      });
    }

    // Get expert's hourly rate
    const amount = expert.hourlyRate;

    // Create booking
    const booking = new Booking({
      expertId,
      timeSlotId,
      clientName,
      clientEmail,
      clientPhone,
      bookingDate,
      startTime,
      endTime,
      notes,
      amount,
      status: 'Pending',
    });

    // Use session for transaction to prevent race condition
    const session = await require('mongoose').startSession();
    session.startTransaction();

    try {
      // Save booking
      await booking.save({ session });

      // Update time slot with transaction
      await TimeSlot.findByIdAndUpdate(
        timeSlotId,
        {
          isBooked: true,
          bookedBy: booking._id,
          currentBookings: timeSlot.currentBookings + 1,
        },
        { session }
      );

      // Update expert stats
      await Expert.findByIdAndUpdate(
        expertId,
        { $inc: { totalBookings: 1 } },
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      // Emit real-time update via Socket.io
      const io = req.app.get('io');
      if (io) {
        io.emit('slot-booked', {
          expertId,
          timeSlotId,
          status: 'booked',
          bookingId: booking._id,
        });
      }

      res.status(201).json({
        success: true,
        message: 'Booking created successfully',
        data: booking,
      });
    } catch (transactionError) {
      await session.abortTransaction();
      session.endSession();
      throw transactionError;
    }
  } catch (error) {
    next(error);
  }
};

// Get bookings by email
exports.getBookingsByEmail = async (req, res, next) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const bookings = await Booking.find({ clientEmail: email })
      .populate('expertId', 'name category hourlyRate profileImage')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

// Get booking by ID
exports.getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id)
      .populate('expertId')
      .populate('timeSlotId')
      .lean();

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// Update booking status
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error, value } = validateBookingStatusUpdate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const booking = await Booking.findByIdAndUpdate(
      id,
      { status: value.status },
      { new: true, runValidators: true }
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('booking-status-updated', {
        bookingId: id,
        newStatus: value.status,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Booking status updated successfully',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// Cancel booking
exports.cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (booking.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled',
      });
    }

    // Use transaction
    const session = await require('mongoose').startSession();
    session.startTransaction();

    try {
      // Update booking status
      booking.status = 'Cancelled';
      await booking.save({ session });

      // Free up time slot
      const timeSlot = await TimeSlot.findById(booking.timeSlotId);
      if (timeSlot) {
        timeSlot.isBooked = false;
        timeSlot.currentBookings = Math.max(0, timeSlot.currentBookings - 1);
        if (timeSlot.currentBookings === 0) {
          timeSlot.bookedBy = null;
        }
        await timeSlot.save({ session });
      }

      await session.commitTransaction();
      session.endSession();

      // Emit real-time update
      const io = req.app.get('io');
      if (io) {
        io.emit('slot-freed', {
          timeSlotId: booking.timeSlotId,
          status: 'available',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Booking cancelled successfully',
        data: booking,
      });
    } catch (transactionError) {
      await session.abortTransaction();
      session.endSession();
      throw transactionError;
    }
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
