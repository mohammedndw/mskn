const authService = require('../services/auth.service');
const asyncHandler = require('../middlewares/asyncHandler');
const ApiResponse = require('../utils/response');

class AuthController {
  // Signup
  signup = asyncHandler(async (req, res) => {
    const result = await authService.signup(req.body);

    return ApiResponse.success(
      res,
      {
        user: result.user,
        token: result.token
      },
      'User registered successfully',
      201
    );
  });

  // Login
  login = asyncHandler(async (req, res) => {
    const result = await authService.login(req.body);

    return ApiResponse.success(
      res,
      {
        user: result.user,
        token: result.token
      },
      'Login successful'
    );
  });

  // Get current user profile
  getProfile = asyncHandler(async (req, res) => {
    const user = await authService.getProfile(req.user.id);

    return ApiResponse.success(res, user, 'Profile retrieved successfully');
  });

  // Owner Login (National ID only)
  ownerLogin = asyncHandler(async (req, res) => {
    const { nationalId } = req.body;
    const result = await authService.ownerLogin(nationalId);

    return ApiResponse.success(
      res,
      {
        user: result.user,
        token: result.token,
        propertyCount: result.propertyCount
      },
      'Owner login successful'
    );
  });
}

module.exports = new AuthController();
