const { z } = require('zod');

// Create property validation
const createPropertySchema = z.object({
  body: z.object({
    estateId: z.string().uuid('Invalid estate ID').optional(),
    // Owner info - will find existing or create new owner
    ownerNationalId: z.string().length(10, 'National ID must be exactly 10 digits').regex(/^\d{10}$/, 'National ID must contain only digits'),
    ownerFirstName: z.string().min(2, 'Owner first name must be at least 2 characters'),
    ownerLastName: z.string().min(2, 'Owner last name must be at least 2 characters'),
    ownerPhone: z.string().regex(/^05\d{8}$/, 'Phone must be in format 05XXXXXXXX'),
    ownerEmail: z.string().email('Invalid email format').optional(),
    // Property info
    name: z.string().min(2, 'Property name must be at least 2 characters'),
    description: z.string().optional(),
    type: z.string().min(2, 'Property type is required'),
    bedrooms: z.number().int().positive('Bedrooms must be a positive number').optional(),
    bathrooms: z.number().int().positive('Bathrooms must be a positive number').optional(),
    area: z.number().positive('Area must be a positive number').optional(),
    floor: z.number().int().optional(),
    imageUrl: z.string().optional(),
    status: z.enum(['AVAILABLE', 'RESERVED', 'RENTED']).optional(),
    // Location fields (for standalone properties without parent estate)
    region: z.string().optional(),
    city: z.string().optional(),
    district: z.string().optional(),
    street: z.string().optional(),
    buildingNumber: z.string().optional(),
    zipCode: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional()
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional()
});

// Update property validation
const updatePropertySchema = z.object({
  body: z.object({
    estateId: z.string().uuid('Invalid estate ID').optional(),
    ownerId: z.string().uuid('Invalid owner ID').optional(),
    name: z.string().min(2, 'Property name must be at least 2 characters').optional(),
    description: z.string().optional(),
    type: z.string().min(2, 'Property type is required').optional(),
    bedrooms: z.number().int().positive('Bedrooms must be a positive number').optional(),
    bathrooms: z.number().int().positive('Bathrooms must be a positive number').optional(),
    area: z.number().positive('Area must be a positive number').optional(),
    floor: z.number().int().optional(),
    imageUrl: z.string().optional(),
    status: z.enum(['AVAILABLE', 'RESERVED', 'RENTED']).optional(),
    // Location fields
    region: z.string().optional(),
    city: z.string().optional(),
    district: z.string().optional(),
    street: z.string().optional(),
    buildingNumber: z.string().optional(),
    zipCode: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional()
  }),
  params: z.object({
    id: z.string().uuid('Invalid property ID')
  }),
  query: z.object({}).optional()
});

// Get property by ID validation
const getPropertySchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid property ID')
  }),
  body: z.object({}).optional(),
  query: z.object({}).optional()
});

// Get properties with filters validation
const getPropertiesSchema = z.object({
  query: z.object({
    status: z.enum(['AVAILABLE', 'RESERVED', 'RENTED']).optional(),
    estateId: z.string().uuid('Invalid estate ID').optional(),
    ownerId: z.string().uuid('Invalid owner ID').optional(),
    type: z.string().optional(),
    minArea: z.string().optional(),
    maxArea: z.string().optional(),
    minBedrooms: z.string().optional(),
    maxBedrooms: z.string().optional()
  }).optional(),
  body: z.object({}).optional(),
  params: z.object({}).optional()
});

module.exports = {
  createPropertySchema,
  updatePropertySchema,
  getPropertySchema,
  getPropertiesSchema
};
