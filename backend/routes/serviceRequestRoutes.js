const express = require('express');
const router = express.Router();
const serviceRequestController = require('../controllers/serviceRequestController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, serviceRequestController.getAllRequests);
router.post('/', authenticate, authorize('customer'), serviceRequestController.createRequest);
router.put('/:id', authenticate, authorize('admin'), serviceRequestController.updateRequestStatus);

module.exports = router;
