const auditLogService = require('../services/auditLog.service');
const asyncHandler = require('../middlewares/asyncHandler');
const ApiResponse = require('../utils/response');

class AuditLogController {
  /**
   * Get all audit logs with filters
   * @route GET /api/audit-logs
   * @access Admin only
   */
  getAllAuditLogs = asyncHandler(async (req, res) => {
    const {
      userId,
      action,
      entity,
      entityId,
      startDate,
      endDate,
      page,
      limit
    } = req.query;

    const result = await auditLogService.getAllAuditLogs({
      userId,
      action,
      entity,
      entityId,
      startDate,
      endDate,
      page,
      limit
    });

    return ApiResponse.success(
      res,
      result,
      'Audit logs retrieved successfully'
    );
  });

  /**
   * Get audit log by ID
   * @route GET /api/audit-logs/:id
   * @access Admin only
   */
  getAuditLogById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const auditLog = await auditLogService.getAuditLogById(id);

    return ApiResponse.success(
      res,
      auditLog,
      'Audit log retrieved successfully'
    );
  });

  /**
   * Get audit log statistics
   * @route GET /api/audit-logs/stats
   * @access Admin only
   */
  getAuditLogStats = asyncHandler(async (req, res) => {
    const stats = await auditLogService.getAuditLogStats();

    return ApiResponse.success(
      res,
      stats,
      'Audit log statistics retrieved successfully'
    );
  });

  /**
   * Delete old audit logs
   * @route DELETE /api/audit-logs/cleanup
   * @access Admin only
   */
  deleteOldAuditLogs = asyncHandler(async (req, res) => {
    const { daysToKeep = 90 } = req.body;

    const deletedCount = await auditLogService.deleteOldAuditLogs(daysToKeep);

    return ApiResponse.success(
      res,
      { deletedCount },
      `Deleted ${deletedCount} old audit logs`
    );
  });
}

module.exports = new AuditLogController();
