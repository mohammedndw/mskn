const { z } = require('zod');

// Get audit logs validation
const getAuditLogsSchema = z.object({
  query: z.object({
    userId: z.string().uuid().optional(),
    action: z.string().optional(),
    entity: z.string().optional(),
    entityId: z.string().uuid().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    page: z.string().transform(val => parseInt(val)).optional(),
    limit: z.string().transform(val => parseInt(val)).optional()
  }).optional()
});

// Get audit log by ID validation
const getAuditLogSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid audit log ID')
  })
});

module.exports = {
  getAuditLogsSchema,
  getAuditLogSchema
};
