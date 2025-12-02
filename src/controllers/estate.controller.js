const estateService = require('../services/estate.service');
const asyncHandler = require('../middlewares/asyncHandler');
const ApiResponse = require('../utils/response');

class EstateController {
  // Get all estates
  getAllEstates = asyncHandler(async (req, res) => {
    const { role, id } = req.user;
    const estates = await estateService.getAllEstates(req.query, role, id);

    return ApiResponse.success(res, estates, 'Estates retrieved successfully');
  });

  // Get estate by ID
  getEstateById = asyncHandler(async (req, res) => {
    const { role, id } = req.user;
    const estate = await estateService.getEstateById(req.params.id, role, id);

    return ApiResponse.success(res, estate, 'Estate retrieved successfully');
  });

  // Create estate
  createEstate = asyncHandler(async (req, res) => {
    const { role, id } = req.user;
    const estate = await estateService.createEstate(req.body, role, id);

    return ApiResponse.success(res, estate, 'Estate created successfully', 201);
  });

  // Update estate
  updateEstate = asyncHandler(async (req, res) => {
    const { role, id } = req.user;
    const estate = await estateService.updateEstate(req.params.id, req.body, role, id);

    return ApiResponse.success(res, estate, 'Estate updated successfully');
  });

  // Delete estate
  deleteEstate = asyncHandler(async (req, res) => {
    const { role, id } = req.user;
    const result = await estateService.deleteEstate(req.params.id, role, id);

    return ApiResponse.success(res, null, result.message);
  });

  // Get estate statistics
  getEstateStats = asyncHandler(async (req, res) => {
    const { role, id } = req.user;
    const stats = await estateService.getEstateStats(req.params.id, role, id);

    return ApiResponse.success(res, stats, 'Estate statistics retrieved successfully');
  });
}

module.exports = new EstateController();
