const propertyService = require('../services/property.service');
const asyncHandler = require('../middlewares/asyncHandler');
const ApiResponse = require('../utils/response');

class PropertyController {
  // Get all properties with filters
  getAllProperties = asyncHandler(async (req, res) => {
    const { role, id } = req.user;
    const properties = await propertyService.getAllProperties(req.query, role, id);

    return ApiResponse.success(res, properties, 'Properties retrieved successfully');
  });

  // Get property by ID
  getPropertyById = asyncHandler(async (req, res) => {
    const { role, id } = req.user;
    const property = await propertyService.getPropertyById(req.params.id, role, id);

    return ApiResponse.success(res, property, 'Property retrieved successfully');
  });

  // Create property
  createProperty = asyncHandler(async (req, res) => {
    const { role, id } = req.user;
    const property = await propertyService.createProperty(req.body, role, id);

    return ApiResponse.success(res, property, 'Property created successfully', 201);
  });

  // Update property
  updateProperty = asyncHandler(async (req, res) => {
    const { role, id } = req.user;
    const property = await propertyService.updateProperty(req.params.id, req.body, role, id);

    return ApiResponse.success(res, property, 'Property updated successfully');
  });

  // Delete property
  deleteProperty = asyncHandler(async (req, res) => {
    const { role, id } = req.user;
    const result = await propertyService.deleteProperty(req.params.id, role, id);

    return ApiResponse.success(res, null, result.message);
  });

  // Update property status
  updatePropertyStatus = asyncHandler(async (req, res) => {
    const { role, id } = req.user;
    const { status } = req.body;

    const property = await propertyService.updatePropertyStatus(req.params.id, status, role, id);

    return ApiResponse.success(res, property, 'Property status updated successfully');
  });

  // Upload property image
  uploadImage = asyncHandler(async (req, res) => {
    if (!req.file) {
      return ApiResponse.error(res, 'No image file provided', 400);
    }

    // Return the image URL
    const imageUrl = `/uploads/properties/${req.file.filename}`;

    return ApiResponse.success(res, { imageUrl }, 'Image uploaded successfully', 201);
  });
}

module.exports = new PropertyController();
