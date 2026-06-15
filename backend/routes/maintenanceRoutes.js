const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, maintenanceController.getMaintenanceHistory);
router.post('/', authenticate, authorize('admin'), maintenanceController.addMaintenanceRecord);

module.exports = router;
