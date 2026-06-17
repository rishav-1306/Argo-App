const express = require('express');
const router = express.Router();
const { getDashboardOverview } = require('../controllers/dashboardController');
const { adminOnly } = require('../middleware/auth');

router.get('/', ...adminOnly, getDashboardOverview);

module.exports = router;
