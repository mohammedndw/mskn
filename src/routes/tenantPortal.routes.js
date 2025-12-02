const express = require('express');
const router = express.Router();
const tenantPortalController = require('../controllers/tenantPortal.controller');
const maintenanceController = require('../controllers/maintenance.controller');
const { verifyTenantPortalToken } = require('../middlewares/tenantPortalAuth');
const validate = require('../middlewares/validate');
const { createMaintenancePortalSchema } = require('../validations/maintenance.validation');

// All tenant portal routes require tenant portal token
router.use(verifyTenantPortalToken);

// Tenant portal routes
router.get('/contracts', tenantPortalController.getTenantContracts);
router.get('/contracts/:id', tenantPortalController.getContractById);

// Maintenance request creation
router.post(
  '/maintenance',
  validate(createMaintenancePortalSchema),
  maintenanceController.createMaintenanceRequestFromPortal
);

module.exports = router;
