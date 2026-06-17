const { body, validationResult } = require('express-validator');
const sheetsService = require('../services/sheetsService');
const { SHEETS } = require('../config/constants');
const { generateId } = require('../utils/idGenerator');

// ==================== GET ALL MAINTENANCE RECORDS ====================
const getAllMaintenance = async (req, res, next) => {
  try {
    const records = await sheetsService.getRows(SHEETS.MAINTENANCE);
    res.json({ success: true, data: records });
  } catch (error) {
    next(error);
  }
};

// ==================== GET MAINTENANCE BY ELEVATOR ====================
const getMaintenanceByElevator = async (req, res, next) => {
  try {
    const { elevatorId } = req.params;
    const records = await sheetsService.findRows(SHEETS.MAINTENANCE, 'elevatorId', elevatorId);
    res.json({ success: true, data: records });
  } catch (error) {
    next(error);
  }
};

// ==================== ADD MAINTENANCE RECORD ====================
const addMaintenanceValidation = [
  body('elevatorId').notEmpty().withMessage('Elevator ID is required'),
  body('serviceDate').notEmpty().withMessage('Service date is required'),
  body('nextServiceDate').optional().trim(),
  body('remarks').optional().trim(),
  body('technicianName').optional().trim(),
];

const addMaintenance = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { elevatorId, serviceDate, nextServiceDate, remarks, technicianName } = req.body;

    // Verify elevator exists
    const elevator = await sheetsService.findRow(SHEETS.ELEVATORS, 'elevatorId', elevatorId);
    if (!elevator) {
      return res.status(404).json({ success: false, message: 'Elevator not found.' });
    }

    const maintenanceId = generateId('MNT');

    const maintenanceData = {
      maintenanceId,
      elevatorId,
      serviceDate,
      nextServiceDate: nextServiceDate || '',
      remarks: remarks || '',
      technicianName: technicianName || '',
    };

    await sheetsService.appendRow(SHEETS.MAINTENANCE, maintenanceData);

    // Update elevator's lastMaintenance and nextMaintenance
    const elevatorRowIndex = await sheetsService.findRowIndex(SHEETS.ELEVATORS, 'elevatorId', elevatorId);
    elevator.lastMaintenance = serviceDate;
    if (nextServiceDate) elevator.nextMaintenance = nextServiceDate;

    await sheetsService.updateRow(SHEETS.ELEVATORS, elevatorRowIndex, elevator);

    res.status(201).json({ success: true, data: maintenanceData });
  } catch (error) {
    next(error);
  }
};

// ==================== UPDATE MAINTENANCE RECORD ====================
const updateMaintenance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const rowIndex = await sheetsService.findRowIndex(SHEETS.MAINTENANCE, 'maintenanceId', id);
    if (rowIndex === -1) {
      return res.status(404).json({ success: false, message: 'Maintenance record not found.' });
    }

    const record = await sheetsService.findRow(SHEETS.MAINTENANCE, 'maintenanceId', id);
    const updatedData = { ...record, ...updates, maintenanceId: record.maintenanceId };

    await sheetsService.updateRow(SHEETS.MAINTENANCE, rowIndex, updatedData);
    res.json({ success: true, data: updatedData });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllMaintenance,
  getMaintenanceByElevator,
  addMaintenance,
  addMaintenanceValidation,
  updateMaintenance,
};
