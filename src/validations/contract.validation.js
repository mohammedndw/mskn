const { z } = require('zod');

// Valid payment frequency values
const PAYMENT_FREQUENCIES = ['MONTHLY', 'QUARTERLY', 'SEMI_ANNUALLY', 'ANNUALLY'];

// Create contract validation
const createContractSchema = z.object({
  body: z.object({
    propertyId: z.string().uuid('Invalid property ID'),
    tenantId: z.string().uuid('Invalid tenant ID'),
    price: z.union([
      z.number().positive('Price must be a positive number'),
      z.string().transform((val) => {
        const num = parseFloat(val);
        if (isNaN(num) || num <= 0) {
          throw new Error('Price must be a positive number');
        }
        return num;
      })
    ]),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    paymentFrequency: z.enum(PAYMENT_FREQUENCIES, {
      errorMap: () => ({ message: 'Payment frequency must be MONTHLY, QUARTERLY, SEMI_ANNUALLY, or ANNUALLY' })
    }),
    ownerNationalId: z.string().optional()
  }).refine((data) => {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    return endDate > startDate;
  }, {
    message: 'End date must be after start date',
    path: ['endDate']
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional()
});

// Update contract validation
const updateContractSchema = z.object({
  body: z.object({
    propertyId: z.string().uuid('Invalid property ID').optional(),
    tenantId: z.string().uuid('Invalid tenant ID').optional(),
    price: z.number().positive('Price must be a positive number').optional(),
    startDate: z.string().min(1, 'Start date is required').optional(),
    endDate: z.string().min(1, 'End date is required').optional(),
    paymentFrequency: z.enum(PAYMENT_FREQUENCIES, {
      errorMap: () => ({ message: 'Payment frequency must be MONTHLY, QUARTERLY, SEMI_ANNUALLY, or ANNUALLY' })
    }).optional()
  }),
  params: z.object({
    id: z.string().uuid('Invalid contract ID')
  }),
  query: z.object({}).optional()
});

// Get contract by ID validation
const getContractSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid contract ID')
  }),
  body: z.object({}).optional(),
  query: z.object({}).optional()
});

// Get contracts with filters validation
const getContractsSchema = z.object({
  query: z.object({
    propertyId: z.string().uuid('Invalid property ID').optional(),
    tenantId: z.string().uuid('Invalid tenant ID').optional(),
    ownerId: z.string().uuid('Invalid owner ID').optional(),
    status: z.enum(['active', 'expired', 'all']).optional()
  }).optional(),
  body: z.object({}).optional(),
  params: z.object({}).optional()
});

module.exports = {
  createContractSchema,
  updateContractSchema,
  getContractSchema,
  getContractsSchema
};
