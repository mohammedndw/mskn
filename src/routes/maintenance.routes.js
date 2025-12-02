const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenance.controller');
const { authenticate, authorize } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const {
  createMaintenanceSchema,
  updateMaintenanceSchema,
  getMaintenanceSchema,
  getMaintenancesSchema
} = require('../validations/maintenance.validation');

// All routes require authentication
router.use(authenticate);

// Get maintenance statistics
router.get('/stats', maintenanceController.getMaintenanceStats);

// Maintenance routes - all authenticated users can view (with RBAC in service)
router.get('/', validate(getMaintenancesSchema), maintenanceController.getAllMaintenanceRequests);
router.get('/:id', validate(getMaintenanceSchema), maintenanceController.getMaintenanceRequestById);

// Only ADMIN and PROPERTY_MANAGER can create maintenance requests directly
// (Tenants create via tenant portal)
router.post(
  '/',
  authorize('ADMIN', 'PROPERTY_MANAGER'),
  validate(createMaintenanceSchema),
  maintenanceController.createMaintenanceRequest
);

// Only ADMIN and PROPERTY_MANAGER can update maintenance requests
router.put(
  '/:id',
  authorize('ADMIN', 'PROPERTY_MANAGER'),
  validate(updateMaintenanceSchema),
  maintenanceController.updateMaintenanceRequest
);

// PATCH route for partial updates (same handler as PUT)
router.patch(
  '/:id',
  authorize('ADMIN', 'PROPERTY_MANAGER'),
  validate(updateMaintenanceSchema),
  maintenanceController.updateMaintenanceRequest
);

// Only ADMIN and PROPERTY_MANAGER can delete maintenance requests
router.delete(
  '/:id',
  authorize('ADMIN', 'PROPERTY_MANAGER'),
  validate(getMaintenanceSchema),
  maintenanceController.deleteMaintenanceRequest
);

module.exports = router;
