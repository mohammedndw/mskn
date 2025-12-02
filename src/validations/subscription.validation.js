const { z } = require('zod');

// Create subscription plan validation
const createPlanSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Plan name must be at least 2 characters'),
    description: z.string().nullable().optional(),
    price: z.number().positive('Price must be a positive number'),
    durationDays: z.number().int().positive('Duration must be a positive integer'),
    maxProperties: z.number().int().positive('Max properties must be a positive integer').optional(),
    features: z.any().optional(), // JSON field
    isActive: z.boolean().optional()
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional()
});

// Update subscription plan validation
const updatePlanSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Plan name must be at least 2 characters').optional(),
    description: z.string().nullable().optional(),
    price: z.number().positive('Price must be a positive number').optional(),
    durationDays: z.number().int().positive('Duration must be a positive integer').optional(),
    maxProperties: z.number().int().positive('Max properties must be a positive integer').optional(),
    features: z.any().optional(),
    isActive: z.boolean().optional()
  }),
  params: z.object({
    id: z.string().uuid('Invalid plan ID')
  }),
  query: z.object({}).optional()
});

// Get plan by ID validation
const getPlanSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid plan ID')
  }),
  body: z.object({}).optional(),
  query: z.object({}).optional()
});

// Assign subscription validation
const assignSubscriptionSchema = z.object({
  body: z.object({
    userId: z.string().uuid('Invalid user ID'),
    planId: z.string().uuid('Invalid plan ID'),
    startDate: z.string().datetime('Invalid start date format').optional(),
    customDuration: z.number().int().positive('Custom duration must be a positive integer').optional()
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional()
});

// Update user subscription validation
const updateUserSubscriptionSchema = z.object({
  body: z.object({
    planId: z.string().uuid('Invalid plan ID').optional(),
    endDate: z.string().datetime('Invalid end date format').optional(),
    isActive: z.boolean().optional()
  }),
  params: z.object({
    userId: z.string().uuid('Invalid user ID')
  }),
  query: z.object({}).optional()
});

// Get user subscription validation
const getUserSubscriptionSchema = z.object({
  params: z.object({
    userId: z.string().uuid('Invalid user ID')
  }),
  body: z.object({}).optional(),
  query: z.object({}).optional()
});

module.exports = {
  createPlanSchema,
  updatePlanSchema,
  getPlanSchema,
  assignSubscriptionSchema,
  updateUserSubscriptionSchema,
  getUserSubscriptionSchema
};
