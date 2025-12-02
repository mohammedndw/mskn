const { z } = require('zod');

// Signup validation schema
const signupSchema = z.object({
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
    role: z.enum(['PROPERTY_MANAGER', 'PROPERTY_OWNER'], {
      errorMap: () => ({ message: 'Role must be either PROPERTY_MANAGER or PROPERTY_OWNER' })
    })
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional()
});

// Login validation schema
const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required')
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional()
});

// Owner login validation schema (National ID only)
const ownerLoginSchema = z.object({
  body: z.object({
    nationalId: z.string()
      .min(10, 'National ID must be 10 digits')
      .max(10, 'National ID must be 10 digits')
      .regex(/^\d{10}$/, 'National ID must be exactly 10 digits')
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional()
});

module.exports = {
  signupSchema,
  loginSchema,
  ownerLoginSchema
};
