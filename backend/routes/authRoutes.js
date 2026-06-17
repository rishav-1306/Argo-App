const express = require('express');
const router = express.Router();
const {
  adminLogin,
  adminLoginValidation,
  customerSignup,
  customerSignupValidation,
  customerLogin,
  customerLoginValidation,
  updatePushToken,
} = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

// Admin login
router.post('/admin/login', authLimiter, adminLoginValidation, adminLogin);

// Customer auth
router.post('/customer/signup', authLimiter, customerSignupValidation, customerSignup);
router.post('/customer/login', authLimiter, customerLoginValidation, customerLogin);

// Update push token (authenticated)
router.post('/push-token', verifyToken, updatePushToken);

module.exports = router;
