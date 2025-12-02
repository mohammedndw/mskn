const tenantPortalService = require('../services/tenantPortal.service');
const asyncHandler = require('../middlewares/asyncHandler');
const ApiResponse = require('../utils/response');

class TenantPortalController {
  // Get all contracts for the tenant
  getTenantContracts = asyncHandler(async (req, res) => {
    const { tenantNationalId } = req.tenantPortal;
    const data = await tenantPortalService.getTenantContracts(tenantNationalId);

    return ApiResponse.success(res, data, 'Contracts retrieved successfully');
  });

  // Get specific contract
  getContractById = asyncHandler(async (req, res) => {
    const { tenantNationalId } = req.tenantPortal;
    const contract = await tenantPortalService.getContractById(req.params.id, tenantNationalId);

    return ApiResponse.success(res, contract, 'Contract retrieved successfully');
  });
}

module.exports = new TenantPortalController();
