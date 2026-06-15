const sheetService = require('../services/googleSheetService');

exports.getAllRequests = async (req, res) => {
  try {
    const requests = await sheetService.getAllRows('ServiceRequests');
    if (req.user.role === 'customer') {
      return res.json(requests.filter(r => r.customerId === req.user.id));
    }
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createRequest = async (req, res) => {
  try {
    const requestId = `REQ_${Date.now()}`;
    const newRequest = await sheetService.addRow('ServiceRequests', {
      ...req.body,
      requestId,
      customerId: req.user.id,
      status: 'Pending',
      createdAt: new Date().toISOString()
    });
    res.status(201).json(newRequest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateRequestStatus = async (req, res) => {
  try {
    const updated = await sheetService.updateRow('ServiceRequests', 'requestId', req.params.id, { status: req.body.status });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
