const auditLogService = require('../services/auditLog.service');

/**
 * Audit logger middleware
 * Logs user actions for auditing purposes
 */
const auditLogger = (action, entity) => {
  return async (req, res, next) => {
    // Store original send function
    const originalSend = res.send;

    // Override send function to log after successful response
    res.send = function (data) {
      // Only log successful operations (2xx status codes)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Get entity ID from params, body, or response
        const entityId = req.params.id || req.body.id || null;

        // Extract additional details
        const details = {};

        // For updates, include what was changed
        if (action === 'UPDATE' && req.body) {
          details.changes = Object.keys(req.body);
        }

        // For deletions, include the entity that was deleted
        if (action === 'DELETE' && entityId) {
          details.deletedId = entityId;
        }

        // For creations, include basic info
        if (action === 'CREATE' && req.body) {
          details.created = true;
        }

        // Create audit log (async, don't wait for it)
        auditLogService.createAuditLog({
          userId: req.user?.id || null,
          action,
          entity,
          entityId,
          details: Object.keys(details).length > 0 ? details : null,
          ipAddress: req.ip || req.connection.remoteAddress
        }).catch(error => {
          // Log error but don't fail the request
          console.error('Audit log creation failed:', error);
        });
      }

      // Call original send function
      return originalSend.call(this, data);
    };

    next();
  };
};

/**
 * Helper function to create audit log manually
 * Use this for custom audit logging needs
 */
const logAudit = async (req, action, entity, entityId = null, details = null) => {
  try {
    await auditLogService.createAuditLog({
      userId: req.user?.id || null,
      action,
      entity,
      entityId,
      details,
      ipAddress: req.ip || req.connection.remoteAddress
    });
  } catch (error) {
    console.error('Audit log creation failed:', error);
  }
};

module.exports = {
  auditLogger,
  logAudit
};
