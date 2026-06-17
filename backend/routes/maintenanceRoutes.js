const express = require('express');
const router = express.Router();
const {
  getAllMaintenance,
  getMaintenanceByElevator,
  addMaintenance,
  addMaintenanceValidation,
  updateMaintenance,
} = require('../controllers/maintenanceController');
const { adminOnly } = require('../middleware/auth');

router.get('/', ...adminOnly, getAllMaintenance);
router.get('/elevator/:elevatorId', ...adminOnly, getMaintenanceByElevator);
router.post('/', ...adminOnly, addMaintenanceValidation, addMaintenance);
router.put('/:id', ...adminOnly, updateMaintenance);

module.exports = router;
