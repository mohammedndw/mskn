const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload.controller');
const { authenticate, authorize } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

// Upload property image - only ADMIN and PROPERTY_MANAGER
router.post(
  '/property-image',
  authenticate,
  authorize('ADMIN', 'PROPERTY_MANAGER'),
  upload.single('image'),
  uploadController.uploadPropertyImage
);

module.exports = router;
