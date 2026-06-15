const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Argo App Backend is running' });
});

const authRoutes = require('./routes/authRoutes');
const elevatorRoutes = require('./routes/elevatorRoutes');
const customerRoutes = require('./routes/customerRoutes');
const serviceRequestRoutes = require('./routes/serviceRequestRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/elevators', elevatorRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/service-requests', serviceRequestRoutes);
app.use('/api/maintenance', maintenanceRoutes);

require('./services/notificationService');

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;
