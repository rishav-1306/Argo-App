const { body, validationResult } = require('express-validator');
const sheetsService = require('../services/sheetsService');
const { SHEETS, REQUEST_STATUS } = require('../config/constants');
const { generateId } = require('../utils/idGenerator');

// ==================== GET ALL SERVICE REQUESTS ====================
const getAllServiceRequests = async (req, res, next) => {
  try {
    const requests = await sheetsService.getRows(SHEETS.SERVICE_REQUESTS);
    res.json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
};

// ==================== GET REQUESTS BY CUSTOMER ====================
const getRequestsByCustomer = async (req, res, next) => {
  try {
    const customerId = req.params.customerId || req.user.id;
    const requests = await sheetsService.findRows(SHEETS.SERVICE_REQUESTS, 'customerId', customerId);
    res.json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
};

// ==================== CREATE SERVICE REQUEST (CUSTOMER) ====================
const createRequestValidation = [
  body('elevatorId').notEmpty().withMessage('Elevator ID is required'),
  body('issue').trim().notEmpty().withMessage('Issue description is required'),
];

const createRequest = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { elevatorId, issue } = req.body;
    const customerId = req.user.id;

    // Verify elevator belongs to customer
    const elevator = await sheetsService.findRow(SHEETS.ELEVATORS, 'elevatorId', elevatorId);
    if (!elevator || elevator.customerId !== customerId) {
      return res.status(404).json({ success: false, message: 'Elevator not found or not assigned to you.' });
    }

    const requestId = generateId('REQ');

    const requestData = {
      requestId,
      customerId,
      elevatorId,
      issue,
      status: REQUEST_STATUS.PENDING,
      createdAt: new Date().toISOString(),
    };

    await sheetsService.appendRow(SHEETS.SERVICE_REQUESTS, requestData);

    res.status(201).json({ success: true, data: requestData });
  } catch (error) {
    next(error);
  }
};

// ==================== UPDATE REQUEST STATUS (ADMIN) ====================
const updateRequestStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = Object.values(REQUEST_STATUS);
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const rowIndex = await sheetsService.findRowIndex(SHEETS.SERVICE_REQUESTS, 'requestId', id);
    if (rowIndex === -1) {
      return res.status(404).json({ success: false, message: 'Service request not found.' });
    }

    const request = await sheetsService.findRow(SHEETS.SERVICE_REQUESTS, 'requestId', id);
    request.status = status;

    await sheetsService.updateRow(SHEETS.SERVICE_REQUESTS, rowIndex, request);
    res.json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllServiceRequests,
  getRequestsByCustomer,
  createRequest,
  createRequestValidation,
  updateRequestStatus,
};
