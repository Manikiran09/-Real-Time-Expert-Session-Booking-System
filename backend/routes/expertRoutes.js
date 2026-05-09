const express = require('express');
const router = express.Router();
const {
  getAllExperts,
  getExpertById,
  getCategories,
} = require('../controllers/expertController');

// Get categories
router.get('/categories', getCategories);

// Get all experts with pagination and filtering
router.get('/', getAllExperts);

// Get expert by ID with available slots
router.get('/:id', getExpertById);

module.exports = router;
