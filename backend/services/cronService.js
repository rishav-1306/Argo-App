const cron = require('node-cron');
const sheetsService = require('./sheetsService');
const notificationService = require('./notificationService');
const { SHEETS } = require('../config/constants');

const checkMaintenanceReminders = async () => {
  try {
    console.log('[CRON] Checking maintenance reminders...');

    const elevators = await sheetsService.getRows(SHEETS.ELEVATORS);
    const customers = await sheetsService.getRows(SHEETS.CUSTOMERS);

    const customerMap = {};
    customers.forEach((c) => { customerMap[c.customerId] = c; });

    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const dueSoon = [];
    const overdue = [];

    elevators.forEach((elevator) => {
      if (!elevator.nextMaintenance) return;

      const nextDate = new Date(elevator.nextMaintenance);
      const customer = customerMap[elevator.customerId];

      if (!customer || !customer.pushToken) return;

      if (nextDate >= now && nextDate <= sevenDaysFromNow) {
        dueSoon.push({ elevator, customer });
      } else if (nextDate < now) {
        overdue.push({ elevator, customer });
      }
    });

    // Send reminders for upcoming maintenance
    for (const { elevator, customer } of dueSoon) {
      await notificationService.sendPushNotification(
        customer.pushToken,
        'Maintenance Reminder',
        `Your elevator (${elevator.elevatorCode}) at ${elevator.location} is due for maintenance on ${elevator.nextMaintenance}.`,
        { type: 'maintenance_reminder', elevatorId: elevator.elevatorId }
      );
    }

    // Send urgent reminders for overdue maintenance
    for (const { elevator, customer } of overdue) {
      await notificationService.sendPushNotification(
        customer.pushToken,
        'Urgent: Maintenance Overdue',
        `Your elevator (${elevator.elevatorCode}) at ${elevator.location} is overdue for maintenance since ${elevator.nextMaintenance}. Please contact support.`,
        { type: 'maintenance_overdue', elevatorId: elevator.elevatorId }
      );
    }

    console.log(`[CRON] Sent ${dueSoon.length} reminders, ${overdue.length} overdue alerts.`);
  } catch (error) {
    console.error('[CRON] Error checking maintenance reminders:', error.message);
  }
};

const startCronJobs = () => {
  // Run daily at 9:00 AM
  cron.schedule('0 9 * * *', () => {
    checkMaintenanceReminders();
  });

  console.log('[CRON] Maintenance reminder job scheduled (daily at 9:00 AM)');
};

module.exports = { startCronJobs, checkMaintenanceReminders };
