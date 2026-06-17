const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const sheetsService = require('../services/sheetsService');
const { SHEETS } = require('../config/constants');
const { generateId } = require('../utils/idGenerator');
require('dotenv').config();

// Generate JWT token
const generateToken = (payload, expiry) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: expiry });
};

// ==================== ADMIN LOGIN ====================
const adminLoginValidation = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const adminLogin = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { username, password } = req.body;

    // Find admin by username
    const admin = await sheetsService.findRow(SHEETS.ADMIN_USERS, 'username', username.trim());
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = generateToken(
      { id: admin.adminId, username: admin.username, role: 'admin' },
      process.env.JWT_ADMIN_EXPIRY
    );

    res.json({
      success: true,
      token,
      user: { id: admin.adminId, username: admin.username, role: 'admin' },
    });
  } catch (error) {
    next(error);
  }
};

// ==================== CUSTOMER SIGNUP ====================
const customerSignupValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('address').optional().trim(),
];

const customerSignup = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, phone, email, password, address } = req.body;

    // Check if email already exists
    const existingEmail = await sheetsService.findRow(SHEETS.CUSTOMERS, 'email', email);
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    // Check if phone already exists
    const existingPhone = await sheetsService.findRow(SHEETS.CUSTOMERS, 'phone', phone);
    if (existingPhone) {
      return res.status(400).json({ success: false, message: 'Phone number already registered.' });
    }

    // Hash password
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

    const token = generateToken(
      { id: customerId, email, phone, role: 'customer' },
      process.env.JWT_CUSTOMER_EXPIRY
    );

    res.status(201).json({
      success: true,
      token,
      user: { id: customerId, name, phone, email, role: 'customer' },
    });
  } catch (error) {
    next(error);
  }
};

// ==================== CUSTOMER LOGIN ====================
const customerLoginValidation = [
  body('login').notEmpty().withMessage('Email or phone is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const customerLogin = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { login, password } = req.body;

    // Try email first, then phone
    let customer = await sheetsService.findRow(SHEETS.CUSTOMERS, 'email', login);
    if (!customer) {
      customer = await sheetsService.findRow(SHEETS.CUSTOMERS, 'phone', login);
    }

    if (!customer) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, customer.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = generateToken(
      { id: customer.customerId, email: customer.email, phone: customer.phone, role: 'customer' },
      process.env.JWT_CUSTOMER_EXPIRY
    );

    res.json({
      success: true,
      token,
      user: {
        id: customer.customerId,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        role: 'customer',
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==================== UPDATE PUSH TOKEN ====================
const updatePushToken = async (req, res, next) => {
  try {
    const { pushToken } = req.body;
    const customerId = req.user.id;

    const rowIndex = await sheetsService.findRowIndex(SHEETS.CUSTOMERS, 'customerId', customerId);
    if (rowIndex === -1) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    const customer = await sheetsService.findRow(SHEETS.CUSTOMERS, 'customerId', customerId);
    customer.pushToken = pushToken;

    await sheetsService.updateRow(SHEETS.CUSTOMERS, rowIndex, customer);

    res.json({ success: true, message: 'Push token updated.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  adminLogin,
  adminLoginValidation,
  customerSignup,
  customerSignupValidation,
  customerLogin,
  customerLoginValidation,
  updatePushToken,
};
