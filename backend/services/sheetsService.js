const axios = require('axios');
require('dotenv').config();

const BASE_URL = process.env.GOOGLE_APPS_SCRIPT_URL;

if (!BASE_URL) {
  console.error('[SHEETS] GOOGLE_APPS_SCRIPT_URL is not set in .env');
  console.error('[SHEETS] Please deploy the Apps Script and add the URL to .env');
}

// Encode values starting with $ to prevent Google Sheets from treating as formulas
const encodeDollar = (val) => {
  if (typeof val === 'string' && val.startsWith('$')) return "'" + val;
  return val;
};

// Decode ' prefix back to original value
const decodeDollar = (val) => {
  if (typeof val === 'string' && val.startsWith("'")) return val.substring(1);
  return val;
};

// Encode all values in a row data object
const encodeRowData = (data) => {
  const encoded = {};
  for (const [key, val] of Object.entries(data)) {
    encoded[key] = encodeDollar(val);
  }
  return encoded;
};

// Decode all values in a row object
const decodeRow = (row) => {
  if (!row || typeof row !== 'object') return row;
  const decoded = {};
  for (const [key, val] of Object.entries(row)) {
    decoded[key] = decodeDollar(val);
  }
  return decoded;
};

// Decode all rows
const decodeRows = (rows) => {
  if (!Array.isArray(rows)) return rows;
  return rows.map(decodeRow);
};

// Helper: make GET request to Apps Script
const doGet = async (params) => {
  const { data } = await axios.get(BASE_URL, { params, timeout: 30000 });
  if (data.error) throw new Error(data.error);
  return data;
};

// Helper: make POST request to Apps Script
const doPost = async (body) => {
  const { data } = await axios.post(BASE_URL, body, {
    timeout: 30000,
    headers: { 'Content-Type': 'text/plain' }, // Avoid CORS preflight
  });
  if (data.error) throw new Error(data.error);
  return data;
};

// Get all rows from a sheet (returns array of objects)
const getRows = async (sheetName) => {
  const rows = await doGet({ action: 'getRows', sheet: sheetName });
  return decodeRows(rows);
};

// Get row count (including header)
const getRowCount = async (sheetName) => {
  const result = await doGet({ action: 'getRowCount', sheet: sheetName });
  return result.count;
};

// Append a row to a sheet
const appendRow = async (sheetName, rowData) => {
  return doPost({ action: 'appendRow', sheet: sheetName, data: encodeRowData(rowData) });
};

// Update a specific row (1-based row index, where 1 is header)
const updateRow = async (sheetName, rowIndex, rowData) => {
  return doPost({ action: 'updateRow', sheet: sheetName, rowIndex, data: encodeRowData(rowData) });
};

// Delete a row (1-based row index, where 1 is header)
const deleteRow = async (sheetName, rowIndex) => {
  return doPost({ action: 'deleteRow', sheet: sheetName, rowIndex });
};

// Find rows matching a column value
const findRows = async (sheetName, column, value) => {
  const rows = await getRows(sheetName);
  return rows.filter((row) => String(row[column]).toLowerCase() === String(value).toLowerCase());
};

// Find a single row matching a column value
const findRow = async (sheetName, column, value) => {
  const rows = await findRows(sheetName, column, value);
  return rows.length > 0 ? rows[0] : null;
};

// Find row index (1-based, where 1 is header row) by column value
const findRowIndex = async (sheetName, column, value) => {
  const allRows = await getRows(sheetName);
  const index = allRows.findIndex(
    (row) => String(row[column]).toLowerCase() === String(value).toLowerCase()
  );
  return index >= 0 ? index + 2 : -1; // +2 because: 1-based and skip header
};

module.exports = {
  getRows,
  getRowCount,
  appendRow,
  updateRow,
  deleteRow,
  findRows,
  findRow,
  findRowIndex,
};
