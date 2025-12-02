const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { authenticate, authorize } = require('../middlewares/auth');

// All routes require authentication
router.use(authenticate);

// Dashboard routes - automatically detects role and returns appropriate dashboard
router.get('/', dashboardController.getDashboard);

// Role-specific dashboard routes
router.get('/admin', authorize('ADMIN'), dashboardController.getAdminDashboard);
router.get('/manager', authorize('PROPERTY_MANAGER'), dashboardController.getManagerDashboard);
router.get('/owner', authorize('PROPERTY_OWNER'), dashboardController.getOwnerDashboard);

module.exports = router;
