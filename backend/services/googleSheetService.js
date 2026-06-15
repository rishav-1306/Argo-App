const { doc, initSheets } = require('../config/googleSheets');

const getSheetByName = async (name) => {
  await initSheets();
  return doc.sheetsByTitle[name];
};

const getAllRows = async (sheetName) => {
  const sheet = await getSheetByName(sheetName);
  const rows = await sheet.getRows();
  return rows.map(row => row.toObject());
};

const addRow = async (sheetName, data) => {
  const sheet = await getSheetByName(sheetName);
  const newRow = await sheet.addRow(data);
  return newRow.toObject();
};

const updateRow = async (sheetName, idColumn, idValue, data) => {
  const sheet = await getSheetByName(sheetName);
  const rows = await sheet.getRows();
  const row = rows.find(r => r.get(idColumn) === idValue);
  if (row) {
    Object.assign(row, data);
    await row.save();
    return row.toObject();
  }
  return null;
};

const findRow = async (sheetName, idColumn, idValue) => {
    const sheet = await getSheetByName(sheetName);
    const rows = await sheet.getRows();
    const row = rows.find(r => r.get(idColumn) === idValue);
    return row ? row.toObject() : null;
};

module.exports = { getAllRows, addRow, updateRow, findRow };
