const sheetsService = require('../services/sheetsService');
const { SHEETS, REQUEST_STATUS } = require('../config/constants');

// ==================== DASHBOARD OVERVIEW ====================
const getDashboardOverview = async (req, res, next) => {
  try {
    const [customers, elevators, maintenance, requests] = await Promise.all([
      sheetsService.getRows(SHEETS.CUSTOMERS),
      sheetsService.getRows(SHEETS.ELEVATORS),
      sheetsService.getRows(SHEETS.MAINTENANCE),
      sheetsService.getRows(SHEETS.SERVICE_REQUESTS),
    ]);

    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Upcoming maintenance (next 7 days)
    const upcomingMaintenance = elevators.filter((e) => {
      if (!e.nextMaintenance) return false;
      const nextDate = new Date(e.nextMaintenance);
      return nextDate >= now && nextDate <= sevenDaysFromNow;
    });

    // Pending service requests
    const pendingRequests = requests.filter((r) => r.status === REQUEST_STATUS.PENDING);

    res.json({
      success: true,
      data: {
        totalCustomers: customers.length,
        totalElevators: elevators.length,
        upcomingMaintenance: upcomingMaintenance.length,
        pendingRequests: pendingRequests.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardOverview };
