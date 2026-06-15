const sheetService = require('../services/googleSheetService');

exports.getAllElevators = async (req, res) => {
  try {
    const elevators = await sheetService.getAllRows('Elevators');
    if (req.user.role === 'customer') {
        return res.json(elevators.filter(e => e.customerId === req.user.id));
    }
    res.json(elevators);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addElevator = async (req, res) => {
  try {
    const elevatorId = `ELV_${Date.now()}`;
    const newElevator = await sheetService.addRow('Elevators', { ...req.body, elevatorId });
    res.status(201).json(newElevator);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
