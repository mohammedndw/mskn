const userSubscriptionService = require('../services/userSubscription.service');
const asyncHandler = require('../middlewares/asyncHandler');
const ApiResponse = require('../utils/response');

class UserSubscriptionController {
  // Get all user subscriptions
  getAllSubscriptions = asyncHandler(async (req, res) => {
    const subscriptions = await userSubscriptionService.getAllSubscriptions(req.query);

    return ApiResponse.success(res, subscriptions, 'User subscriptions retrieved successfully');
  });

  // Get user subscription by user ID
  getUserSubscription = asyncHandler(async (req, res) => {
    const subscription = await userSubscriptionService.getUserSubscription(req.params.userId);

    return ApiResponse.success(res, subscription, 'User subscription retrieved successfully');
  });

  // Get current user's subscription
  getMySubscription = asyncHandler(async (req, res) => {
    const subscription = await userSubscriptionService.getUserSubscription(req.user.id);

    return ApiResponse.success(res, subscription, 'Your subscription retrieved successfully');
  });

  // Assign subscription to user
  assignSubscription = asyncHandler(async (req, res) => {
    const subscription = await userSubscriptionService.assignSubscription(req.body);

    return ApiResponse.success(res, subscription, 'Subscription assigned successfully', 201);
  });

  // Update user subscription
  updateUserSubscription = asyncHandler(async (req, res) => {
    const subscription = await userSubscriptionService.updateUserSubscription(
      req.params.userId,
      req.body
    );

    return ApiResponse.success(res, subscription, 'User subscription updated successfully');
  });

  // Remove user subscription
  removeUserSubscription = asyncHandler(async (req, res) => {
    await userSubscriptionService.removeUserSubscription(req.params.userId);

    return ApiResponse.success(res, null, 'User subscription removed successfully');
  });

  // Toggle subscription status
  toggleSubscriptionStatus = asyncHandler(async (req, res) => {
    const subscription = await userSubscriptionService.toggleSubscriptionStatus(
      req.params.userId,
      req.body.isActive
    );

    const message = req.body.isActive
      ? 'Subscription activated successfully'
      : 'Subscription deactivated successfully';

    return ApiResponse.success(res, subscription, message);
  });

  // Renew subscription
  renewSubscription = asyncHandler(async (req, res) => {
    const subscription = await userSubscriptionService.renewSubscription(
      req.params.userId,
      req.body.extensionDays
    );

    return ApiResponse.success(res, subscription, 'Subscription renewed successfully');
  });
}

module.exports = new UserSubscriptionController();
