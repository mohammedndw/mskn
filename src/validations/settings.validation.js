const { z } = require('zod');

// Get settings validation
const getSettingsSchema = z.object({
  query: z.object({
    key: z.string().optional(),
    isPublic: z.string().transform(val => val === 'true').optional()
  }).optional()
});

// Get setting by key validation
const getSettingSchema = z.object({
  params: z.object({
    key: z.string().min(1, 'Setting key is required')
  })
});

// Create setting validation
const createSettingSchema = z.object({
  body: z.object({
    key: z.string().min(1, 'Setting key is required')
      .regex(/^[A-Z_]+$/, 'Key must be uppercase letters and underscores only'),
    value: z.any(), // JSON value can be any type
    description: z.string().optional(),
    isPublic: z.boolean().optional().default(false)
  })
});

// Update setting validation
const updateSettingSchema = z.object({
  params: z.object({
    key: z.string().min(1, 'Setting key is required')
  }),
  body: z.object({
    value: z.any().optional(),
    description: z.string().optional(),
    isPublic: z.boolean().optional()
  }).refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update'
  })
});

// Delete setting validation
const deleteSettingSchema = z.object({
  params: z.object({
    key: z.string().min(1, 'Setting key is required')
  })
});

module.exports = {
  getSettingsSchema,
  getSettingSchema,
  createSettingSchema,
  updateSettingSchema,
  deleteSettingSchema
};
