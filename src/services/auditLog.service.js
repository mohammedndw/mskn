const { prisma } = require('../config/database');

class AuditLogService {
  /**
   * Create audit log entry
   * @param {Object} data - Audit log data
   * @returns {Promise<Object>} Created audit log
   */
  async createAuditLog(data) {
    const auditLog = await prisma.auditLog.create({
      data
    });

    return auditLog;
  }

  /**
   * Get all audit logs with filters
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} Paginated audit logs
   */
  async getAllAuditLogs(filters = {}) {
    const {
      userId,
      action,
      entity,
      entityId,
      startDate,
      endDate,
      page = 1,
      limit = 50
    } = filters;

    const where = {};

    if (userId) {
      where.userId = userId;
    }

    if (action) {
      where.action = { contains: action, mode: 'insensitive' };
    }

    if (entity) {
      where.entity = { contains: entity, mode: 'insensitive' };
    }

    if (entityId) {
      where.entityId = entityId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const skip = (page - 1) * limit;

    const [auditLogs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.auditLog.count({ where })
    ]);

    return {
      auditLogs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get audit log by ID
   * @param {String} id - Audit log ID
   * @returns {Promise<Object>} Audit log
   */
  async getAuditLogById(id) {
    const auditLog = await prisma.auditLog.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        }
      }
    });

    if (!auditLog) {
      throw new Error('Audit log not found');
    }

    return auditLog;
  }

  /**
   * Get audit logs for a specific entity
   * @param {String} entity - Entity type
   * @param {String} entityId - Entity ID
   * @returns {Promise<Array>} Audit logs
   */
  async getEntityAuditLogs(entity, entityId) {
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        entity,
        entityId
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return auditLogs;
  }

  /**
   * Get audit log statistics
   * @returns {Promise<Object>} Statistics
   */
  async getAuditLogStats() {
    const [
      total,
      last24Hours,
      last7Days,
      last30Days,
      byAction,
      byEntity
    ] = await Promise.all([
      prisma.auditLog.count(),
      prisma.auditLog.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }
      }),
      prisma.auditLog.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      }),
      prisma.auditLog.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      }),
      prisma.auditLog.groupBy({
        by: ['action'],
        _count: true,
        orderBy: { _count: { action: 'desc' } },
        take: 10
      }),
      prisma.auditLog.groupBy({
        by: ['entity'],
        _count: true,
        orderBy: { _count: { entity: 'desc' } },
        take: 10
      })
    ]);

    return {
      total,
      last24Hours,
      last7Days,
      last30Days,
      topActions: byAction.map(item => ({
        action: item.action,
        count: item._count
      })),
      topEntities: byEntity.map(item => ({
        entity: item.entity,
        count: item._count
      }))
    };
  }

  /**
   * Delete old audit logs
   * @param {Number} daysToKeep - Number of days to keep logs
   * @returns {Promise<Number>} Number of deleted logs
   */
  async deleteOldAuditLogs(daysToKeep = 90) {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);

    const result = await prisma.auditLog.deleteMany({
      where: {
        createdAt: { lt: cutoffDate }
      }
    });

    return result.count;
  }
}

module.exports = new AuditLogService();
