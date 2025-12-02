const { z } = require('zod');

// Create user validation (admin only)
const createUserSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/\d/, 'Password must contain at least one number'),
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
    nationalId: z.string().min(5, 'National ID is required'),
    role: z.enum(['ADMIN', 'PROPERTY_MANAGER', 'PROPERTY_OWNER'], {
      errorMap: () => ({ message: 'Invalid role' })
    })
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional()
});

// Update user validation
const updateUserSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address').optional(),
    firstName: z.string().min(2, 'First name must be at least 2 characters').optional(),
    lastName: z.string().min(2, 'Last name must be at least 2 characters').optional(),
    phone: z.string().min(10, 'Phone number must be at least 10 digits').optional(),
    nationalId: z.string().min(5, 'National ID is required').optional(),
    role: z.enum(['ADMIN', 'PROPERTY_MANAGER', 'PROPERTY_OWNER']).optional(),
    isBlocked: z.boolean().optional()
  }),
  params: z.object({
    id: z.string().uuid('Invalid user ID')
  }),
  query: z.object({}).optional()
});

// Get user by ID validation
const getUserSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid user ID')
  }),
  body: z.object({}).optional(),
  query: z.object({}).optional()
});

// Change role validation
const changeRoleSchema = z.object({
  body: z.object({
    role: z.enum(['ADMIN', 'PROPERTY_MANAGER', 'PROPERTY_OWNER'], {
      errorMap: () => ({ message: 'Invalid role' })
    })
  }),
  params: z.object({
    id: z.string().uuid('Invalid user ID')
  }),
  query: z.object({}).optional()
});

// Block/Unblock user validation
const blockUserSchema = z.object({
  body: z.object({
    isBlocked: z.boolean()
  }),
  params: z.object({
    id: z.string().uuid('Invalid user ID')
  }),
  query: z.object({}).optional()
});

module.exports = {
  createUserSchema,
  updateUserSchema,
  getUserSchema,
  changeRoleSchema,
  blockUserSchema
};
