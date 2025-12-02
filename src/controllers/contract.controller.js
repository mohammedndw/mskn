const contractService = require('../services/contract.service');
const asyncHandler = require('../middlewares/asyncHandler');
const ApiResponse = require('../utils/response');

class ContractController {
  // Get all contracts with filters and RBAC
  getAllContracts = asyncHandler(async (req, res) => {
    const { role, id } = req.user;
    const contracts = await contractService.getAllContracts(req.query, role, id);

    return ApiResponse.success(res, contracts, 'Contracts retrieved successfully');
  });

  // Get contract by ID
  getContractById = asyncHandler(async (req, res) => {
    const { role, id } = req.user;
    const contract = await contractService.getContractById(req.params.id, role, id);

    return ApiResponse.success(res, contract, 'Contract retrieved successfully');
  });

  // Create contract
  createContract = asyncHandler(async (req, res) => {
    const { role, id } = req.user;
    const contract = await contractService.createContract(req.body, role, id);

    return ApiResponse.success(res, contract, 'Contract created successfully', 201);
  });

  // Update contract
  updateContract = asyncHandler(async (req, res) => {
    const { role, id } = req.user;
    const contract = await contractService.updateContract(req.params.id, req.body, role, id);

    return ApiResponse.success(res, contract, 'Contract updated successfully');
  });

  // Delete contract
  deleteContract = asyncHandler(async (req, res) => {
    const { role, id } = req.user;
    const result = await contractService.deleteContract(req.params.id, role, id);

    return ApiResponse.success(res, null, result.message);
  });
}

module.exports = new ContractController();
