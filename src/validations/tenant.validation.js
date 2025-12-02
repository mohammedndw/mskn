const { z } = require('zod');

// Helper function to validate Saudi phone number (05XXXXXXXX)
const saudiPhoneRegex = /^05\d{8}$/;

// Helper function to validate national ID (10 digits)
const nationalIdRegex = /^\d{10}$/;

// Create tenant validation
const createTenantSchema = z.object({
  body: z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Invalid email format').optional().or(z.literal('')),
    phone: z.string().regex(saudiPhoneRegex, 'Phone must be in format 05XXXXXXXX (10 digits starting with 05)'),
    nationalId: z.string().regex(nationalIdRegex, 'National ID must be exactly 10 digits'),
    birthDate: z.string().min(1, 'Birth date is required').refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      return birthDate < today;
    }, { message: 'Birth date must be in the past' })
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional()
});

// Update tenant validation
const updateTenantSchema = z.object({
  body: z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters').optional(),
    lastName: z.string().min(2, 'Last name must be at least 2 characters').optional(),
    email: z.string().email('Invalid email format').optional().or(z.literal('')),
    phone: z.string().regex(saudiPhoneRegex, 'Phone must be in format 05XXXXXXXX (10 digits starting with 05)').optional(),
    nationalId: z.string().regex(nationalIdRegex, 'National ID must be exactly 10 digits').optional(),
    birthDate: z.string().optional().refine((date) => {
      if (!date) return true;
      const birthDate = new Date(date);
      const today = new Date();
      return birthDate < today;
    }, { message: 'Birth date must be in the past' })
  }),
  params: z.object({
    id: z.string().uuid('Invalid tenant ID')
  }),
  query: z.object({}).optional()
});

// Get tenant by ID validation
const getTenantSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid tenant ID')
  }),
  body: z.object({}).optional(),
  query: z.object({}).optional()
});

// Get tenants with filters validation
const getTenantsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    nationalId: z.string().optional()
  }).optional(),
  body: z.object({}).optional(),
  params: z.object({}).optional()
});

module.exports = {
  createTenantSchema,
  updateTenantSchema,
  getTenantSchema,
  getTenantsSchema
};
