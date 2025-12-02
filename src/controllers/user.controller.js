const userService = require('../services/user.service');
const asyncHandler = require('../middlewares/asyncHandler');
const ApiResponse = require('../utils/response');

class UserController {
  // Get all users
  getAllUsers = asyncHandler(async (req, res) => {
    const users = await userService.getAllUsers(req.query);

    return ApiResponse.success(res, users, 'Users retrieved successfully');
  });

  // Get user by ID
  getUserById = asyncHandler(async (req, res) => {
    const user = await userService.getUserById(req.params.id);

    return ApiResponse.success(res, user, 'User retrieved successfully');
  });

  // Create user
  createUser = asyncHandler(async (req, res) => {
    const user = await userService.createUser(req.body);

    return ApiResponse.success(res, user, 'User created successfully', 201);
  });

  // Update user
  updateUser = asyncHandler(async (req, res) => {
    const user = await userService.updateUser(req.params.id, req.body);

    return ApiResponse.success(res, user, 'User updated successfully');
  });

  // Change user role
  changeUserRole = asyncHandler(async (req, res) => {
    const user = await userService.changeUserRole(req.params.id, req.body.role);

    return ApiResponse.success(res, user, 'User role updated successfully');
  });

  // Block/Unblock user
  toggleBlockUser = asyncHandler(async (req, res) => {
    const user = await userService.toggleBlockUser(req.params.id, req.body.isBlocked);

    const message = req.body.isBlocked ? 'User blocked successfully' : 'User unblocked successfully';
    return ApiResponse.success(res, user, message);
  });

  // Delete user
  deleteUser = asyncHandler(async (req, res) => {
    await userService.deleteUser(req.params.id);

    return ApiResponse.success(res, null, 'User deleted successfully');
  });
}

module.exports = new UserController();
