// Setup script: Creates all sheet tabs with headers and seeds the admin user
// Usage: node utils/setupSheets.js
// Prerequisites: Place google-credentials.json in the backend folder first

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { getGoogleSheetsClient, getSpreadsheetId } = require('../config/googleSheets');
const { SHEETS, COLUMNS } = require('../config/constants');
const { generateId } = require('./idGenerator');

const setupSheets = async () => {
  try {
    console.log('Connecting to Google Sheets...');
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = getSpreadsheetId();
    console.log(`Connected to spreadsheet: ${spreadsheetId}`);

    // Get existing sheets
    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    const existingSheets = meta.data.sheets.map((s) => s.properties.title);

    // 1. Create missing sheet tabs
    const sheetsToCreate = Object.values(SHEETS).filter((name) => !existingSheets.includes(name));

    if (sheetsToCreate.length > 0) {
      console.log(`\nCreating sheets: ${sheetsToCreate.join(', ')}`);
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
          requests: sheetsToCreate.map((title) => ({
            addSheet: { properties: { title } },
          })),
        },
      });
      console.log('Sheets created successfully.');
    } else {
      console.log('\nAll sheet tabs already exist.');
    }

    // 2. Add headers to each sheet
    console.log('\nSetting up headers...');
    for (const sheetName of Object.values(SHEETS)) {
      const columns = COLUMNS[sheetName];
      if (!columns) continue;

      try {
        // Check if header row already exists
        const existing = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: `${sheetName}!A1:Z1`,
        });

        if (existing.data.values && existing.data.values.length > 0) {
          console.log(`  ${sheetName}: headers already exist, skipping.`);
          continue;
        }

        // Write header row
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `${sheetName}!A1`,
          valueInputOption: 'RAW',
          resource: { values: [columns] },
        });
        console.log(`  ${sheetName}: headers written.`);
      } catch (err) {
        console.error(`  ${sheetName}: error setting headers - ${err.message}`);
      }
    }

    // 3. Seed admin user
    console.log('\nChecking admin user...');
    const adminSheet = SHEETS.ADMIN_USERS;
    const adminRows = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${adminSheet}!A:Z`,
    });

    const rows = adminRows.data.values || [];
    const hasAdmin = rows.length > 1; // More than just the header row

    if (hasAdmin) {
      console.log('Admin user already exists in the sheet.');
    } else {
      const username = 'manish_singh';
      const password = 'Manish@2026';
      const passwordHash = await bcrypt.hash(password, 10);
      const adminId = generateId('ADM');

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${adminSheet}!A:Z`,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource: { values: [[adminId, username, passwordHash]] },
      });

      console.log('Admin user created successfully!');
      console.log(`  Username: ${username}`);
      console.log(`  Password: ${password}`);
    }

    console.log('\nSetup complete! Your Google Sheet is ready.');
    console.log(`Open it here: https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`);
    process.exit(0);
  } catch (error) {
    console.error('Setup failed:', error.message);
    if (error.message.includes('ENOENT') || error.message.includes('credentials')) {
      console.error('\n--- IMPORTANT ---');
      console.error('You need to place google-credentials.json in the backend folder.');
      console.error('See the setup instructions to create a service account key.');
    }
    process.exit(1);
  }
};

setupSheets();
