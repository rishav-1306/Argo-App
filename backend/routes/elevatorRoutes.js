const express = require('express');
const router = express.Router();
const {
  getAllElevators,
  getElevatorById,
  getElevatorsByCustomer,
  createElevator,
  createElevatorValidation,
  updateElevator,
  deleteElevator,
} = require('../controllers/elevatorController');
const { adminOnly, customerOnly } = require('../middleware/auth');

// Admin routes
router.get('/', ...adminOnly, getAllElevators);
router.post('/', ...adminOnly, createElevatorValidation, createElevator);
router.get('/customer/:customerId', ...adminOnly, getElevatorsByCustomer);

// Customer routes - get own elevators (MUST be before /:id)
router.get('/my', ...customerOnly, (req, res, next) => {
  req.params.customerId = req.user.id;
  next();
}, getElevatorsByCustomer);

// Shared - specific routes after named routes
router.get('/:id', ...adminOnly, getElevatorById);
router.put('/:id', ...adminOnly, updateElevator);
router.delete('/:id', ...adminOnly, deleteElevator);

module.exports = router;
