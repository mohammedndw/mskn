const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/property.controller');
const { authenticate, authorize } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const upload = require('../middlewares/upload');
const {
  createPropertySchema,
  updatePropertySchema,
  getPropertySchema,
  getPropertiesSchema
} = require('../validations/property.validation');

// All routes require authentication
router.use(authenticate);

// Property routes - all authenticated users can view
router.get('/', validate(getPropertiesSchema), propertyController.getAllProperties);
router.get('/:id', validate(getPropertySchema), propertyController.getPropertyById);

// Only ADMIN and PROPERTY_MANAGER can create properties
router.post(
  '/',
  authorize('ADMIN', 'PROPERTY_MANAGER'),
  validate(createPropertySchema),
  propertyController.createProperty
);

// All authenticated users can update (with restrictions in service)
router.put(
  '/:id',
  validate(updatePropertySchema),
  propertyController.updateProperty
);

// Only ADMIN and PROPERTY_MANAGER can delete properties
router.delete(
  '/:id',
  authorize('ADMIN', 'PROPERTY_MANAGER'),
  validate(getPropertySchema),
  propertyController.deleteProperty
);

// Only ADMIN and PROPERTY_MANAGER can update status
router.patch(
  '/:id/status',
  authorize('ADMIN', 'PROPERTY_MANAGER'),
  validate(getPropertySchema),
  propertyController.updatePropertyStatus
);

// Upload property image - only ADMIN and PROPERTY_MANAGER
router.post(
  '/upload-image',
  authorize('ADMIN', 'PROPERTY_MANAGER'),
  upload.single('image'),
  propertyController.uploadImage
);

module.exports = router;
