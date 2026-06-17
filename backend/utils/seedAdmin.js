// Script to create an initial admin user in Google Sheets
// Run this ONCE after setting up Google Sheets API
// Usage: node utils/seedAdmin.js

require('dotenv').config();
const bcrypt = require('bcryptjs');
const sheetsService = require('../services/sheetsService');
const { SHEETS } = require('../config/constants');
const { generateId } = require('./idGenerator');

const seedAdmin = async () => {
  try {
    const username = 'manish_singh';
    const password = 'Manish@2026';

    // Check if admin already exists
    const existing = await sheetsService.findRow(SHEETS.ADMIN_USERS, 'username', username);
    if (existing) {
      console.log('Admin user already exists.');
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const adminId = generateId('ADM');

    await sheetsService.appendRow(SHEETS.ADMIN_USERS, {
      adminId,
      username,
      passwordHash,
    });

    console.log('Admin user created successfully!');
    console.log(`  Username: ${username}`);
    console.log(`  Password: ${password}`);
    console.log('  PLEASE CHANGE THE PASSWORD AFTER FIRST LOGIN!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error.message);
    process.exit(1);
  }
};

seedAdmin();
