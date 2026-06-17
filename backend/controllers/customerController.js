const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const sheetsService = require('../services/sheetsService');
const { SHEETS } = require('../config/constants');
const { generateId } = require('../utils/idGenerator');

// ==================== GET ALL CUSTOMERS ====================
const getAllCustomers = async (req, res, next) => {
  try {
    const customers = await sheetsService.getRows(SHEETS.CUSTOMERS);
    // Remove sensitive data
    const safeCustomers = customers.map(({ passwordHash, pushToken, ...rest }) => rest);
    res.json({ success: true, data: safeCustomers });
  } catch (error) {
    next(error);
  }
};

// ==================== GET CUSTOMER BY ID ====================
const getCustomerById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const customer = await sheetsService.findRow(SHEETS.CUSTOMERS, 'customerId', id);

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    const { passwordHash, pushToken, ...safeCustomer } = customer;
    res.json({ success: true, data: safeCustomer });
  } catch (error) {
    next(error);
  }
};

// ==================== CREATE CUSTOMER (ADMIN) ====================
const createCustomerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('address').optional().trim(),
];

const createCustomer = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, phone, email, password, address } = req.body;

    const existingEmail = await sheetsService.findRow(SHEETS.CUSTOMERS, 'email', email);
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'Email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const customerId = generateId('CUST');

    const customerData = {
      customerId,
      name,
      phone,
      email,
      passwordHash,
      address: address || '',
      pushToken: '',
    };

    await sheetsService.appendRow(SHEETS.CUSTOMERS, customerData);

    const { passwordHash: _, pushToken: __, ...safeCustomer } = customerData;
    res.status(201).json({ success: true, data: safeCustomer });
  } catch (error) {
    next(error);
  }
};

// ==================== UPDATE CUSTOMER ====================
const updateCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, phone, email, address } = req.body;

    const rowIndex = await sheetsService.findRowIndex(SHEETS.CUSTOMERS, 'customerId', id);
    if (rowIndex === -1) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    const customer = await sheetsService.findRow(SHEETS.CUSTOMERS, 'customerId', id);

    const updatedData = {
      ...customer,
      name: name !== undefined ? name : customer.name,
      phone: phone !== undefined ? phone : customer.phone,
      email: email !== undefined ? email : customer.email,
      address: address !== undefined ? address : customer.address,
    };

    await sheetsService.updateRow(SHEETS.CUSTOMERS, rowIndex, updatedData);

    const { passwordHash, pushToken, ...safeCustomer } = updatedData;
    res.json({ success: true, data: safeCustomer });
  } catch (error) {
    next(error);
  }
};

// ==================== DELETE CUSTOMER ====================
const deleteCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;

    const rowIndex = await sheetsService.findRowIndex(SHEETS.CUSTOMERS, 'customerId', id);
    if (rowIndex === -1) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    await sheetsService.deleteRow(SHEETS.CUSTOMERS, rowIndex);
    res.json({ success: true, message: 'Customer deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  createCustomerValidation,
  updateCustomer,
  deleteCustomer,
};
