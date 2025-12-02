const express = require('express');
const router = express.Router();
const auditLogController = require('../controllers/auditLog.controller');
const { authenticate, authorize } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const {
  getAuditLogsSchema,
  getAuditLogSchema
} = require('../validations/auditLog.validation');

// All audit log routes require admin authentication
router.use(authenticate);
router.use(authorize('ADMIN'));

// Get audit log statistics
router.get('/stats', auditLogController.getAuditLogStats);

// Delete old audit logs
router.delete('/cleanup', auditLogController.deleteOldAuditLogs);

// Get all audit logs with filters
router.get(
  '/',
  validate(getAuditLogsSchema),
  auditLogController.getAllAuditLogs
);

// Get audit log by ID
router.get(
  '/:id',
  validate(getAuditLogSchema),
  auditLogController.getAuditLogById
);

module.exports = router;
