const maintenanceService = require('../services/maintenance.service');
const asyncHandler = require('../middlewares/asyncHandler');
const ApiResponse = require('../utils/response');

class MaintenanceController {
  // Get all maintenance requests with filters and RBAC
  getAllMaintenanceRequests = asyncHandler(async (req, res) => {
    const { role, id } = req.user;
    const requests = await maintenanceService.getAllMaintenanceRequests(req.query, role, id);

    return ApiResponse.success(res, requests, 'Maintenance requests retrieved successfully');
  });

  // Get maintenance request by ID
  getMaintenanceRequestById = asyncHandler(async (req, res) => {
    const { role, id } = req.user;
    const request = await maintenanceService.getMaintenanceRequestById(req.params.id, role, id);

    return ApiResponse.success(res, request, 'Maintenance request retrieved successfully');
  });

  // Create maintenance request
  createMaintenanceRequest = asyncHandler(async (req, res) => {
    const request = await maintenanceService.createMaintenanceRequest(req.body);

    return ApiResponse.success(res, request, 'Maintenance request created successfully', 201);
  });

  // Update maintenance request (status and notes)
  updateMaintenanceRequest = asyncHandler(async (req, res) => {
    const { role, id } = req.user;
    const request = await maintenanceService.updateMaintenanceRequest(
      req.params.id,
      req.body,
      role,
      id
    );

    return ApiResponse.success(res, request, 'Maintenance request updated successfully');
  });

  // Delete maintenance request
  deleteMaintenanceRequest = asyncHandler(async (req, res) => {
    const { role, id } = req.user;
    const result = await maintenanceService.deleteMaintenanceRequest(req.params.id, role, id);

    return ApiResponse.success(res, null, result.message);
  });

  // Get maintenance statistics
  getMaintenanceStats = asyncHandler(async (req, res) => {
    const { role, id } = req.user;
    const stats = await maintenanceService.getMaintenanceStats(role, id);

    return ApiResponse.success(res, stats, 'Maintenance statistics retrieved successfully');
  });

  // Create maintenance request from tenant portal
  createMaintenanceRequestFromPortal = asyncHandler(async (req, res) => {
    const { contractId, tenantNationalId } = req.tenantPortal;
    const request = await maintenanceService.createMaintenanceRequestFromPortal(
      req.body,
      contractId,
      tenantNationalId
    );

    return ApiResponse.success(res, request, 'Maintenance request created successfully', 201);
  });
}

module.exports = new MaintenanceController();
