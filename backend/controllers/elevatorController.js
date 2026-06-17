const { body, validationResult } = require('express-validator');
const sheetsService = require('../services/sheetsService');
const { SHEETS, ELEVATOR_STATUS } = require('../config/constants');
const { generateId } = require('../utils/idGenerator');

// ==================== GET ALL ELEVATORS ====================
const getAllElevators = async (req, res, next) => {
  try {
    const elevators = await sheetsService.getRows(SHEETS.ELEVATORS);

    // Enrich with customer name
    const customers = await sheetsService.getRows(SHEETS.CUSTOMERS);
    const customerMap = {};
    customers.forEach((c) => { customerMap[c.customerId] = c.name; });

    const enriched = elevators.map((e) => ({
      ...e,
      customerName: customerMap[e.customerId] || 'Unknown',
    }));

    res.json({ success: true, data: enriched });
  } catch (error) {
    next(error);
  }
};

// ==================== GET ELEVATOR BY ID ====================
const getElevatorById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const elevator = await sheetsService.findRow(SHEETS.ELEVATORS, 'elevatorId', id);

    if (!elevator) {
      return res.status(404).json({ success: false, message: 'Elevator not found.' });
    }

    // Enrich with customer name
    const customer = await sheetsService.findRow(SHEETS.CUSTOMERS, 'customerId', elevator.customerId);
    elevator.customerName = customer ? customer.name : 'Unknown';

    res.json({ success: true, data: elevator });
  } catch (error) {
    next(error);
  }
};

// ==================== GET ELEVATORS BY CUSTOMER ====================
const getElevatorsByCustomer = async (req, res, next) => {
  try {
    const customerId = req.params.customerId || req.user.id;
    const elevators = await sheetsService.findRows(SHEETS.ELEVATORS, 'customerId', customerId);
    res.json({ success: true, data: elevators });
  } catch (error) {
    next(error);
  }
};

// ==================== CREATE ELEVATOR ====================
const createElevatorValidation = [
  body('elevatorCode').trim().notEmpty().withMessage('Elevator code is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('installationDate').notEmpty().withMessage('Installation date is required'),
  body('warrantyExpiry').optional().trim(),
  body('nextMaintenance').optional().trim(),
  body('newCustomer.name').optional().trim(),
  body('newCustomer.phone').optional().trim(),
  body('newCustomer.email').optional().trim(),
];

const createElevator = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { customerId, elevatorCode, location, installationDate, warrantyExpiry, nextMaintenance, newCustomer } = req.body;

    let finalCustomerId = customerId;

    // If no existing customer selected but newCustomer details provided, create the customer first
    if (!finalCustomerId && newCustomer && newCustomer.name) {
      const bcrypt = require('bcryptjs');
      const newCustomerId = generateId('CUST');
      const tempPassword = newCustomer.phone || 'temp1234'; // Use phone as temp password or default
      const passwordHash = await bcrypt.hash(tempPassword, 10);

      const customerData = {
        customerId: newCustomerId,
        name: newCustomer.name,
        phone: newCustomer.phone || '',
        email: newCustomer.email || '',
        passwordHash,
        address: '',
        pushToken: '',
      };

      await sheetsService.appendRow(SHEETS.CUSTOMERS, customerData);
      finalCustomerId = newCustomerId;
    }

    if (!finalCustomerId) {
      return res.status(400).json({ success: false, message: 'Please select or add a customer.' });
    }

    const elevatorId = generateId('ELV');

    const elevatorData = {
      elevatorId,
      customerId: finalCustomerId,
      elevatorCode,
      location,
      installationDate,
      warrantyExpiry: warrantyExpiry || '',
      lastMaintenance: '',
      nextMaintenance: nextMaintenance || '',
      status: ELEVATOR_STATUS.ACTIVE,
    };

    await sheetsService.appendRow(SHEETS.ELEVATORS, elevatorData);

    res.status(201).json({ success: true, data: elevatorData });
  } catch (error) {
    next(error);
  }
};

// ==================== UPDATE ELEVATOR ====================
const updateElevator = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const rowIndex = await sheetsService.findRowIndex(SHEETS.ELEVATORS, 'elevatorId', id);
    if (rowIndex === -1) {
      return res.status(404).json({ success: false, message: 'Elevator not found.' });
    }

    const elevator = await sheetsService.findRow(SHEETS.ELEVATORS, 'elevatorId', id);

    const updatedData = {
      ...elevator,
      ...updates,
      elevatorId: elevator.elevatorId, // Prevent ID change
    };

    await sheetsService.updateRow(SHEETS.ELEVATORS, rowIndex, updatedData);
    res.json({ success: true, data: updatedData });
  } catch (error) {
    next(error);
  }
};

// ==================== DELETE ELEVATOR ====================
const deleteElevator = async (req, res, next) => {
  try {
    const { id } = req.params;

    const rowIndex = await sheetsService.findRowIndex(SHEETS.ELEVATORS, 'elevatorId', id);
    if (rowIndex === -1) {
      return res.status(404).json({ success: false, message: 'Elevator not found.' });
    }

    await sheetsService.deleteRow(SHEETS.ELEVATORS, rowIndex);
    res.json({ success: true, message: 'Elevator deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllElevators,
  getElevatorById,
  getElevatorsByCustomer,
  createElevator,
  createElevatorValidation,
  updateElevator,
  deleteElevator,
};
