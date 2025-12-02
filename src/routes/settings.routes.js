const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');
const { authenticate, authorize } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { auditLogger } = require('../middlewares/auditLogger');
const {
  getSettingsSchema,
  getSettingSchema,
  createSettingSchema,
  updateSettingSchema,
  deleteSettingSchema
} = require('../validations/settings.validation');

// Public routes (with optional authentication for role-based filtering)
router.get(
  '/',
  validate(getSettingsSchema),
  settingsController.getAllSettings
);

router.get(
  '/:key',
  validate(getSettingSchema),
  settingsController.getSettingByKey
);

// Admin-only routes
router.use(authenticate);
router.use(authorize('ADMIN'));

router.post(
  '/initialize',
  auditLogger('INITIALIZE', 'Settings'),
  settingsController.initializeSettings
);

router.post(
  '/',
  validate(createSettingSchema),
  auditLogger('CREATE', 'Settings'),
  settingsController.createSetting
);

router.put(
  '/:key',
  validate(updateSettingSchema),
  auditLogger('UPDATE', 'Settings'),
  settingsController.updateSetting
);

router.delete(
  '/:key',
  validate(deleteSettingSchema),
  auditLogger('DELETE', 'Settings'),
  settingsController.deleteSetting
);

module.exports = router;
