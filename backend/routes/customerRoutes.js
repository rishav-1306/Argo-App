const express = require('express');
const router = express.Router();
const {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  createCustomerValidation,
  updateCustomer,
  deleteCustomer,
} = require('../controllers/customerController');
const { adminOnly, customerOnly } = require('../middleware/auth');

// Admin routes
router.get('/', ...adminOnly, getAllCustomers);
router.post('/', ...adminOnly, createCustomerValidation, createCustomer);
router.put('/:id', ...adminOnly, updateCustomer);
router.delete('/:id', ...adminOnly, deleteCustomer);

// Shared
router.get('/:id', ...adminOnly, getCustomerById);

module.exports = router;
