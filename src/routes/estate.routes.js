const express = require('express');
const router = express.Router();
const estateController = require('../controllers/estate.controller');
const { authenticate, authorize } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const {
  createEstateSchema,
  updateEstateSchema,
  getEstateSchema
} = require('../validations/estate.validation');

// All routes require authentication
router.use(authenticate);

// Estate routes
router.get('/', estateController.getAllEstates);
router.get('/:id', validate(getEstateSchema), estateController.getEstateById);
router.get('/:id/stats', validate(getEstateSchema), estateController.getEstateStats);

// Only ADMIN and PROPERTY_MANAGER can create/update/delete estates
router.post(
  '/',
  authorize('ADMIN', 'PROPERTY_MANAGER'),
  validate(createEstateSchema),
  estateController.createEstate
);

router.put(
  '/:id',
  authorize('ADMIN', 'PROPERTY_MANAGER'),
  validate(updateEstateSchema),
  estateController.updateEstate
);

router.delete(
  '/:id',
  authorize('ADMIN', 'PROPERTY_MANAGER'),
  validate(getEstateSchema),
  estateController.deleteEstate
);

module.exports = router;
