const dashboardService = require('../services/dashboard.service');
const asyncHandler = require('../middlewares/asyncHandler');
const ApiResponse = require('../utils/response');

class DashboardController {
  // Get dashboard based on user role
  getDashboard = asyncHandler(async (req, res) => {
    const { role, id } = req.user;

    let dashboardData;

    switch (role) {
      case 'ADMIN':
        dashboardData = await dashboardService.getAdminDashboard();
        break;
      case 'PROPERTY_MANAGER':
        dashboardData = await dashboardService.getPropertyManagerDashboard(id);
        break;
      case 'PROPERTY_OWNER':
        dashboardData = await dashboardService.getPropertyOwnerDashboard(id);
        break;
      default:
        return ApiResponse.error(res, 'Invalid user role', 400);
    }

    return ApiResponse.success(res, dashboardData, 'Dashboard data retrieved successfully');
  });

  // Get admin dashboard (explicit)
  getAdminDashboard = asyncHandler(async (req, res) => {
    const dashboardData = await dashboardService.getAdminDashboard();

    return ApiResponse.success(res, dashboardData, 'Admin dashboard retrieved successfully');
  });

  // Get manager dashboard (explicit)
  getManagerDashboard = asyncHandler(async (req, res) => {
    const dashboardData = await dashboardService.getPropertyManagerDashboard(req.user.id);

    return ApiResponse.success(res, dashboardData, 'Manager dashboard retrieved successfully');
  });

  // Get owner dashboard (explicit)
  getOwnerDashboard = asyncHandler(async (req, res) => {
    const dashboardData = await dashboardService.getPropertyOwnerDashboard(req.user.id);

    return ApiResponse.success(res, dashboardData, 'Owner dashboard retrieved successfully');
  });
}

module.exports = new DashboardController();
