const cron = require('node-cron');
const sheetService = require('../services/googleSheetService');
const pushService = require('./pushNotificationService');

const checkMaintenance = async () => {
  try {
    const elevators = await sheetService.getAllRows('Elevators');
    const customers = await sheetService.getAllRows('Customers');
    const today = new Date();
    for (const elevator of elevators) {
      const nextDate = new Date(elevator.nextMaintenance);
      const diffDays = Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24));
      if (diffDays <= 7 && diffDays > 0) {
        const customer = customers.find(c => c.customerId === elevator.customerId);
        if (customer && customer.pushToken) {
           await pushService.sendPushNotification(customer.pushToken, 'Maintenance Reminder', `Elevator ${elevator.elevatorCode} is due for maintenance in ${diffDays} days.`);
        }
      }
    }
  } catch (error) {
    console.error('Cron job error:', error);
  }
};

cron.schedule('0 8 * * *', checkMaintenance);
module.exports = { checkMaintenance };
