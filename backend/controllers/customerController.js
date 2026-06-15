const sheetService = require('../services/googleSheetService');

exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await sheetService.getAllRows('Customers');
    res.json(customers.map(c => ({ customerId: c.customerId, name: c.name, email: c.email, phone: c.phone, address: c.address })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
