const tenantService = require('../services/tenant.service');
const asyncHandler = require('../middlewares/asyncHandler');
const ApiResponse = require('../utils/response');

class TenantController {
  // Get all tenants with filters and RBAC
  getAllTenants = asyncHandler(async (req, res) => {
    const { role, id } = req.user;
    const tenants = await tenantService.getAllTenants(req.query, role, id);

    return ApiResponse.success(res, tenants, 'Tenants retrieved successfully');
  });

  // Get tenant by ID
  getTenantById = asyncHandler(async (req, res) => {
    const { role, id } = req.user;
    const tenant = await tenantService.getTenantById(req.params.id, role, id);

    return ApiResponse.success(res, tenant, 'Tenant retrieved successfully');
  });

  // Create tenant
  createTenant = asyncHandler(async (req, res) => {
    const { role, id } = req.user;
    const tenant = await tenantService.createTenant(req.body, role, id);

    return ApiResponse.success(res, tenant, 'Tenant created successfully', 201);
  });

  // Update tenant
  updateTenant = asyncHandler(async (req, res) => {
    const tenant = await tenantService.updateTenant(req.params.id, req.body);

    return ApiResponse.success(res, tenant, 'Tenant updated successfully');
  });

  // Delete tenant
  deleteTenant = asyncHandler(async (req, res) => {
    const result = await tenantService.deleteTenant(req.params.id);

    return ApiResponse.success(res, null, result.message);
  });

  // Get tenant statistics
  getTenantStats = asyncHandler(async (req, res) => {
    const stats = await tenantService.getTenantStats(req.params.id);

    return ApiResponse.success(res, stats, 'Tenant statistics retrieved successfully');
  });
}

module.exports = new TenantController();
