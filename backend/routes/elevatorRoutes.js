const express = require('express');
const router = express.Router();
const elevatorController = require('../controllers/elevatorController');
const { authenticate, authorize } = require('../middleware/auth');
router.get('/', authenticate, elevatorController.getAllElevators);
router.post('/', authenticate, authorize('admin'), elevatorController.addElevator);
module.exports = router;
