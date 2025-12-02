const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contract.controller');
const { authenticate, authorize } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const {
  createContractSchema,
  updateContractSchema,
  getContractSchema,
  getContractsSchema
} = require('../validations/contract.validation');

// All routes require authentication
router.use(authenticate);

// Contract routes - all authenticated users can view (with RBAC in service)
router.get('/', validate(getContractsSchema), contractController.getAllContracts);
router.get('/:id', validate(getContractSchema), contractController.getContractById);

// Only ADMIN and PROPERTY_MANAGER can create/update/delete contracts
router.post(
  '/',
  authorize('ADMIN', 'PROPERTY_MANAGER'),
  validate(createContractSchema),
  contractController.createContract
);

router.put(
  '/:id',
  authorize('ADMIN', 'PROPERTY_MANAGER'),
  validate(updateContractSchema),
  contractController.updateContract
);

router.delete(
  '/:id',
  authorize('ADMIN', 'PROPERTY_MANAGER'),
  validate(getContractSchema),
  contractController.deleteContract
);

module.exports = router;
