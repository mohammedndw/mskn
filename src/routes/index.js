const express = require('express');
const router = express.Router();
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const dashboardRoutes = require('./dashboard.routes');
const subscriptionPlanRoutes = require('./subscriptionPlan.routes');
const userSubscriptionRoutes = require('./userSubscription.routes');
const estateRoutes = require('./estate.routes');
const propertyRoutes = require('./property.routes');
const uploadRoutes = require('./upload.routes');
const tenantRoutes = require('./tenant.routes');
const contractRoutes = require('./contract.routes');
const tenantPortalRoutes = require('./tenantPortal.routes');
const maintenanceRoutes = require('./maintenance.routes');
const settingsRoutes = require('./settings.routes');
const auditLogRoutes = require('./auditLog.routes');

// Health check route
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    }
  });
});

// API version info
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Property Management System API',
    data: {
      version: '1.0.0',
      endpoints: {
        health: '/api/health',
        auth: '/api/auth',
        users: '/api/users (Admin only)',
        dashboard: '/api/dashboard',
        subscriptionPlans: '/api/subscription-plans (Admin only)',
        userSubscriptions: '/api/user-subscriptions (Admin only)',
        estates: '/api/estates',
        properties: '/api/properties',
        upload: '/api/upload',
        tenants: '/api/tenants',
        contracts: '/api/contracts',
        tenantPortal: '/api/tenant-portal (Token-based)',
        maintenance: '/api/maintenance',
        settings: '/api/settings',
        auditLogs: '/api/audit-logs (Admin only)'
      }
    }
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/subscription-plans', subscriptionPlanRoutes);
router.use('/user-subscriptions', userSubscriptionRoutes);
router.use('/estates', estateRoutes);
router.use('/properties', propertyRoutes);
router.use('/upload', uploadRoutes);
router.use('/tenants', tenantRoutes);
router.use('/contracts', contractRoutes);
router.use('/tenant-portal', tenantPortalRoutes);
router.use('/maintenance', maintenanceRoutes);
router.use('/settings', settingsRoutes);
router.use('/audit-logs', auditLogRoutes);

module.exports = router;
