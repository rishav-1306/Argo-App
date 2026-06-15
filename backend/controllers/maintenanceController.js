const sheetService = require('../services/googleSheetService');

exports.getMaintenanceHistory = async (req, res) => {
  try {
    const history = await sheetService.getAllRows('Maintenance');
    // Basic filter logic if needed
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addMaintenanceRecord = async (req, res) => {
  try {
    const maintenanceId = `MAIN_${Date.now()}`;
    const record = await sheetService.addRow('Maintenance', { ...req.body, maintenanceId });
    // Also update Elevator's last and next maintenance dates
    await sheetService.updateRow('Elevators', 'elevatorId', req.body.elevatorId, {
        lastMaintenance: req.body.serviceDate,
        nextMaintenance: req.body.nextServiceDate
    });
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
