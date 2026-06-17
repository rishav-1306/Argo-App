// ============================================================
// Argo App - Google Sheets API (Apps Script Web App)
// Paste this entire code into Google Apps Script editor
// ============================================================

const SHEET_CONFIG = {
  AdminUsers: ['adminId', 'username', 'passwordHash'],
  Customers: ['customerId', 'name', 'phone', 'email', 'passwordHash', 'address', 'pushToken'],
  Elevators: ['elevatorId', 'customerId', 'elevatorCode', 'location', 'installationDate', 'warrantyExpiry', 'lastMaintenance', 'nextMaintenance', 'status'],
  Maintenance: ['maintenanceId', 'elevatorId', 'serviceDate', 'nextServiceDate', 'remarks', 'technicianName'],
  ServiceRequests: ['requestId', 'customerId', 'elevatorId', 'issue', 'status', 'createdAt']
};

// Encode $ to prevent Google Sheets from treating values as formulas
function encodeDollar(val) {
  if (typeof val !== 'string') return val;
  if (val.startsWith('$')) return "'" + val;
  return val;
}

// Decode the ' prefix back
function decodeDollar(val) {
  if (typeof val !== 'string') return val;
  if (val.startsWith("'")) return val.substring(1);
  return val;
}

// Auto-setup: create all sheet tabs with headers
function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  Object.keys(SHEET_CONFIG).forEach(name => {
    let sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
    }
    // Write headers if row 1 is empty
    if (sheet.getRange('A1').getValue() === '') {
      sheet.getRange(1, 1, 1, SHEET_CONFIG[name].length).setValues([SHEET_CONFIG[name]]);
    }
  });
  
  // Remove default "Sheet1" if it exists and is empty
  const defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet && defaultSheet.getLastRow() <= 1 && ss.getSheets().length > 1) {
    ss.deleteSheet(defaultSheet);
  }
  
  // Seed admin user if AdminUsers is empty (only header row)
  const adminSheet = ss.getSheetByName('AdminUsers');
  if (adminSheet.getLastRow() <= 1) {
    // Pre-hashed password for Manish@2026 (bcrypt, 10 rounds)
    const adminHash = "'$2b$10$wojl3DIhU8cyDvZ7cdggoe4KFr5UOevoAKZe42WQSbM4IJYRWbDXS";
    adminSheet.appendRow(['ADM-001', 'manish_singh', adminHash]);
  }
  
  Logger.log('Setup complete! All sheets created with headers.');
}

// ============================================================
// WEB APP ENDPOINTS
// ============================================================

function doGet(e) {
  const action = e.parameter.action;
  const sheet = e.parameter.sheet;
  
  try {
    if (action === 'getRows') {
      return jsonResponse(getRows(sheet));
    }
    if (action === 'findRow') {
      const column = e.parameter.column;
      const value = e.parameter.value;
      return jsonResponse(findRow(sheet, column, value));
    }
    if (action === 'findRows') {
      const column = e.parameter.column;
      const value = e.parameter.value;
      return jsonResponse(findRows(sheet, column, value));
    }
    if (action === 'findRowIndex') {
      const column = e.parameter.column;
      const value = e.parameter.value;
      return jsonResponse({ index: findRowIndex(sheet, column, value) });
    }
    if (action === 'getRowCount') {
      return jsonResponse({ count: getRowCount(sheet) });
    }
    return jsonResponse({ error: 'Unknown action: ' + action });
  } catch (err) {
    return jsonResponse({ error: err.message });
  }
}

function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  const action = body.action;
  const sheet = body.sheet;
  
  try {
    if (action === 'appendRow') {
      appendRow(sheet, body.data);
      return jsonResponse({ success: true });
    }
    if (action === 'updateRow') {
      updateRow(sheet, body.rowIndex, body.data);
      return jsonResponse({ success: true });
    }
    if (action === 'deleteRow') {
      deleteRow(sheet, body.rowIndex);
      return jsonResponse({ success: true });
    }
    return jsonResponse({ error: 'Unknown action: ' + action });
  } catch (err) {
    return jsonResponse({ error: err.message });
  }
}

// ============================================================
// CRUD FUNCTIONS
// ============================================================

function getSheet(name) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sheet) throw new Error('Sheet not found: ' + name);
  return sheet;
}

function getRows(sheetName) {
  const sheet = getSheet(sheetName);
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  
  const headers = data[0].map(h => String(h).trim());
  return data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = row[i] !== undefined && row[i] !== null ? decodeDollar(String(row[i]).trim()) : '';
    });
    return obj;
  });
}

function getRowCount(sheetName) {
  const sheet = getSheet(sheetName);
  return sheet.getLastRow();
}

function findRows(sheetName, column, value) {
  const rows = getRows(sheetName);
  return rows.filter(row => 
    String(row[column] || '').toLowerCase() === String(value).toLowerCase()
  );
}

function findRow(sheetName, column, value) {
  const rows = findRows(sheetName, column, value);
  return rows.length > 0 ? rows[0] : null;
}

function findRowIndex(sheetName, column, value) {
  const sheet = getSheet(sheetName);
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return -1;
  
  const headers = data[0].map(h => String(h).trim());
  const colIndex = headers.indexOf(column);
  if (colIndex === -1) return -1;
  
  const searchVal = String(value).toLowerCase();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][colIndex]).toLowerCase() === searchVal) {
      return i + 1; // 1-based row number
    }
  }
  return -1;
}

function appendRow(sheetName, rowData) {
  const sheet = getSheet(sheetName);
  const columns = SHEET_CONFIG[sheetName];
  if (!columns) throw new Error('Unknown sheet: ' + sheetName);
  
  const values = columns.map(col => encodeDollar(rowData[col] !== undefined ? String(rowData[col]) : ''));
  sheet.appendRow(values);
  SpreadsheetApp.flush();
}

function updateRow(sheetName, rowIndex, rowData) {
  const sheet = getSheet(sheetName);
  const columns = SHEET_CONFIG[sheetName];
  if (!columns) throw new Error('Unknown sheet: ' + sheetName);
  
  const values = columns.map(col => encodeDollar(rowData[col] !== undefined ? String(rowData[col]) : ''));
  sheet.getRange(rowIndex, 1, 1, columns.length).setValues([values]);
  SpreadsheetApp.flush();
}

function deleteRow(sheetName, rowIndex) {
  const sheet = getSheet(sheetName);
  sheet.deleteRow(rowIndex);
  SpreadsheetApp.flush();
}

// ============================================================
// HELPERS
// ============================================================

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
