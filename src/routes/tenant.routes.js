const express = require('express');
const router = express.Router();
const tenantController = require('../controllers/tenant.controller');
const { authenticate, authorize } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const {
  createTenantSchema,
  updateTenantSchema,
  getTenantSchema,
  getTenantsSchema
} = require('../validations/tenant.validation');

// All routes require authentication
router.use(authenticate);

// Tenant routes - all authenticated users can view (with RBAC in service)
router.get('/', validate(getTenantsSchema), tenantController.getAllTenants);
router.get('/:id', validate(getTenantSchema), tenantController.getTenantById);
router.get('/:id/stats', validate(getTenantSchema), tenantController.getTenantStats);

// Only ADMIN and PROPERTY_MANAGER can create/update/delete tenants
router.post(
  '/',
  authorize('ADMIN', 'PROPERTY_MANAGER'),
  validate(createTenantSchema),
  tenantController.createTenant
);

router.put(
  '/:id',
  authorize('ADMIN', 'PROPERTY_MANAGER'),
  validate(updateTenantSchema),
  tenantController.updateTenant
);

router.delete(
  '/:id',
  authorize('ADMIN', 'PROPERTY_MANAGER'),
  validate(getTenantSchema),
  tenantController.deleteTenant
);

module.exports = router;
