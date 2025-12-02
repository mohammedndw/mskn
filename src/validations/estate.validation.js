const { z } = require('zod');

// Create estate validation
const createEstateSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Estate name must be at least 2 characters'),
    description: z.string().optional(),
    region: z.string().min(2, 'Region is required'),
    city: z.string().min(2, 'City is required'),
    street: z.string().min(2, 'Street is required'),
    address: z.string().min(2, 'Address is required')
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional()
});

// Update estate validation
const updateEstateSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Estate name must be at least 2 characters').optional(),
    description: z.string().optional(),
    region: z.string().min(2, 'Region is required').optional(),
    city: z.string().min(2, 'City is required').optional(),
    street: z.string().min(2, 'Street is required').optional(),
    address: z.string().min(2, 'Address is required').optional()
  }),
  params: z.object({
    id: z.string().uuid('Invalid estate ID')
  }),
  query: z.object({}).optional()
});

// Get estate by ID validation
const getEstateSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid estate ID')
  }),
  body: z.object({}).optional(),
  query: z.object({}).optional()
});

module.exports = {
  createEstateSchema,
  updateEstateSchema,
  getEstateSchema
};
