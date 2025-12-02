const { z } = require('zod');

// Create maintenance request validation
const createMaintenanceSchema = z.object({
  body: z.object({
    contractId: z.string().uuid('Invalid contract ID'),
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    images: z.array(z.string().url('Invalid image URL')).optional()
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional()
});

// Create maintenance request from tenant portal (no contractId in body, comes from token)
const createMaintenancePortalSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    images: z.array(z.string().url('Invalid image URL')).optional()
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional()
});

// Update maintenance request validation
const updateMaintenanceSchema = z.object({
  body: z.object({
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'], {
      errorMap: () => ({ message: 'Status must be PENDING, IN_PROGRESS, COMPLETED, or CANCELLED' })
    }).optional(),
    internalNotes: z.string().optional()
  }),
  params: z.object({
    id: z.string().uuid('Invalid maintenance request ID')
  }),
  query: z.object({}).optional()
});

// Get maintenance request by ID validation
const getMaintenanceSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid maintenance request ID')
  }),
  body: z.object({}).optional(),
  query: z.object({}).optional()
});

// Get maintenance requests with filters validation
const getMaintenancesSchema = z.object({
  query: z.object({
    contractId: z.string().uuid('Invalid contract ID').optional(),
    tenantId: z.string().uuid('Invalid tenant ID').optional(),
    propertyId: z.string().uuid('Invalid property ID').optional(),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional()
  }).optional(),
  body: z.object({}).optional(),
  params: z.object({}).optional()
});

module.exports = {
  createMaintenanceSchema,
  createMaintenancePortalSchema,
  updateMaintenanceSchema,
  getMaintenanceSchema,
  getMaintenancesSchema
};
