const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sheetService = require('../services/googleSheetService');
require('dotenv').config();

exports.customerSignup = async (req, res) => {
  try {
    const { name, phone, email, password, address } = req.body;
    const existing = await sheetService.findRow('Customers', 'email', email);
    if (existing) return res.status(400).json({ error: 'User already exists' });
    const passwordHash = await bcrypt.hash(password, 10);
    const customerId = `CUST_${Date.now()}`;
    const { pushToken } = req.body;
    await sheetService.addRow('Customers', { customerId, name, phone, email, passwordHash, address, pushToken });
    res.status(201).json({ message: 'Customer created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const sheetName = role === 'admin' ? 'AdminUsers' : 'Customers';
    const user = await sheetService.findRow(sheetName, 'email', email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign(
      { id: role === 'admin' ? user.adminId : user.customerId, email: user.email, role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.json({ token, user: { name: user.name || 'Admin', email: user.email, role } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
