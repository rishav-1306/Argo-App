const { google } = require('googleapis');
const path = require('path');
require('dotenv').config();

let sheetsClient = null;

const getGoogleSheetsClient = async () => {
  if (sheetsClient) return sheetsClient;

  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: path.resolve(process.env.GOOGLE_CREDENTIALS_PATH),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const authClient = await auth.getClient();
    sheetsClient = google.sheets({ version: 'v4', auth: authClient });
    return sheetsClient;
  } catch (error) {
    console.error('Google Sheets auth error:', error.message);
    throw new Error('Failed to initialize Google Sheets client');
  }
};

const getSpreadsheetId = () => process.env.GOOGLE_SHEET_ID;

module.exports = { getGoogleSheetsClient, getSpreadsheetId };
