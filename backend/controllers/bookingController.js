const Booking = require('../models/Booking');
const TimeSlot = require('../models/TimeSlot');
const Expert = require('../models/Expert');
const mongoose = require('mongoose');
const { getCancelledCutoffDate } = require('../utils/bookingMaintenance');
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

    // Use session for transaction to prevent race condition
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Verify expert exists inside the transaction
      const expert = await Expert.findById(expertId).session(session);
      if (!expert) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({
          success: false,
          message: 'Expert not found',
        });
      }

      // Validate requested slot metadata before reserving the slot
      const existingSlot = await TimeSlot.findById(timeSlotId).session(session);
      if (!existingSlot) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({
          success: false,
          message: 'Time slot not found',
        });
      }

      if (String(existingSlot.expertId) !== String(expertId)) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: 'Selected time slot does not belong to this expert',
        });
      }

      const requestedDate = new Date(bookingDate).toISOString().split('T')[0];
      const slotDate = new Date(existingSlot.date).toISOString().split('T')[0];
      if (requestedDate !== slotDate || startTime !== existingSlot.startTime || endTime !== existingSlot.endTime) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: 'Booking date/time does not match selected time slot',
        });
      }

      // Create booking document now so we can store booking id in slot reservation
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
        amount: expert.hourlyRate,
        status: 'Pending',
      });

      // Atomically reserve the slot only if still available
      const reservedSlot = await TimeSlot.findOneAndUpdate(
        {
          _id: timeSlotId,
          expertId,
          isBooked: false,
          $expr: { $lt: ['$currentBookings', '$capacity'] },
        },
        {
          $set: {
            isBooked: true,
            bookedBy: booking._id,
          },
          $inc: { currentBookings: 1 },
        },
        { new: true, session }
      );

      if (!reservedSlot) {
        await session.abortTransaction();
        session.endSession();
        return res.status(409).json({
          success: false,
          message: 'Time slot is already booked. Please choose another slot.',
        });
      }

      // Save booking
      await booking.save({ session });

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
    if (error && error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'This time slot has already been booked. Please choose another slot.',
      });
    }
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
      .find({
        $or: [
          { status: { $ne: 'Cancelled' } },
          { cancelledAt: { $gt: getCancelledCutoffDate() } },
          { cancelledAt: null },
        ],
      })
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

    if (value.status === 'Cancelled') {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const booking = await Booking.findById(id).session(session);

        if (!booking) {
          await session.abortTransaction();
          session.endSession();
          return res.status(404).json({
            success: false,
            message: 'Booking not found',
          });
        }

        booking.status = 'Cancelled';
        booking.cancelledAt = new Date();
        await booking.save({ session });

        const timeSlot = await TimeSlot.findById(booking.timeSlotId).session(session);
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

        const io = req.app.get('io');
        if (io) {
          io.emit('booking-status-updated', {
            bookingId: id,
            newStatus: value.status,
          });
          io.emit('slot-freed', {
            expertId: booking.expertId,
            timeSlotId: booking.timeSlotId,
            status: 'available',
          });
        }

        return res.status(200).json({
          success: true,
          message: 'Booking status updated successfully',
          data: booking,
        });
      } catch (transactionError) {
        await session.abortTransaction();
        session.endSession();
        throw transactionError;
      }
    }

    const booking = await Booking.findByIdAndUpdate(
      id,
      { status: value.status, cancelledAt: null },
      { new: true, runValidators: true }
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

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
      booking.cancelledAt = new Date();
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
          expertId: booking.expertId,
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
