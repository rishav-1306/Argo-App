const express = require('express');
const router = express.Router();
const {
  getAllServiceRequests,
  getRequestsByCustomer,
  createRequest,
  createRequestValidation,
  updateRequestStatus,
} = require('../controllers/serviceRequestController');
const { adminOnly, customerOnly } = require('../middleware/auth');

// Admin routes
router.get('/', ...adminOnly, getAllServiceRequests);
router.put('/:id/status', ...adminOnly, updateRequestStatus);

// Customer routes
router.get('/my', ...customerOnly, getRequestsByCustomer);
router.post('/', ...customerOnly, createRequestValidation, createRequest);

module.exports = router;
