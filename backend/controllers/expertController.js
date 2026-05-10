const Expert = require('../models/Expert');
const TimeSlot = require('../models/TimeSlot');
const { validateExpertQuery } = require('../middleware/validation');

// Get all experts with pagination and filtering
exports.getAllExperts = async (req, res, next) => {
  try {
    const { error, value } = validateExpertQuery(req.query);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { page, limit, category, search, sortBy } = value;
    const skip = (page - 1) * limit;

    // Build filter
    let filter = { isActive: true };
    if (category) {
      filter.category = category;
    }
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    // Execute query
    const experts = await Expert.find(filter)
      .sort({ [sortBy]: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Expert.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: experts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get expert by ID with available slots
exports.getExpertById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const expert = await Expert.findById(id).lean();
    if (!expert) {
      return res.status(404).json({
        success: false,
        message: 'Expert not found',
      });
    }

    // date field is stored as 'YYYY-MM-DD' string — use string comparison
    const nowUTC = new Date();
    const todayStr = nowUTC.toISOString().split('T')[0]; // 'YYYY-MM-DD'
    const endDate = new Date(nowUTC.getTime() + 30 * 24 * 60 * 60 * 1000);
    const endStr = endDate.toISOString().split('T')[0];

    const timeSlots = await TimeSlot.find({
      expertId: id,
      date: { $gte: todayStr, $lte: endStr },
    })
      .sort({ date: 1, startTime: 1 })
      .lean();

    // Group slots by date — date is already a 'YYYY-MM-DD' string
    const slotsByDate = {};
    timeSlots.forEach((slot) => {
      const dateKey = typeof slot.date === 'string'
        ? slot.date
        : new Date(slot.date).toISOString().split('T')[0]; // fallback for any legacy Date docs
      if (!slotsByDate[dateKey]) {
        slotsByDate[dateKey] = [];
      }
      // Ensure capacity/currentBookings exist for docs missing these fields
      slotsByDate[dateKey].push({
        capacity: 1,
        currentBookings: 0,
        ...slot,
      });
    });

    res.status(200).json({
      success: true,
      data: {
        ...expert,
        availableSlots: slotsByDate,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get expert categories
exports.getCategories = async (req, res, next) => {
  try {
    const categories = ['Finance', 'Technology', 'Marketing', 'Healthcare', 'Legal', 'Other'];
    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
