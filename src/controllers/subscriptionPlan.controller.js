const subscriptionPlanService = require('../services/subscriptionPlan.service');
const asyncHandler = require('../middlewares/asyncHandler');
const ApiResponse = require('../utils/response');

class SubscriptionPlanController {
  // Get all plans
  getAllPlans = asyncHandler(async (req, res) => {
    const plans = await subscriptionPlanService.getAllPlans(req.query);

    return ApiResponse.success(res, plans, 'Subscription plans retrieved successfully');
  });

  // Get plan by ID
  getPlanById = asyncHandler(async (req, res) => {
    const plan = await subscriptionPlanService.getPlanById(req.params.id);

    return ApiResponse.success(res, plan, 'Subscription plan retrieved successfully');
  });

  // Create plan
  createPlan = asyncHandler(async (req, res) => {
    const plan = await subscriptionPlanService.createPlan(req.body);

    return ApiResponse.success(res, plan, 'Subscription plan created successfully', 201);
  });

  // Update plan
  updatePlan = asyncHandler(async (req, res) => {
    const plan = await subscriptionPlanService.updatePlan(req.params.id, req.body);

    return ApiResponse.success(res, plan, 'Subscription plan updated successfully');
  });

  // Delete plan
  deletePlan = asyncHandler(async (req, res) => {
    await subscriptionPlanService.deletePlan(req.params.id);

    return ApiResponse.success(res, null, 'Subscription plan deleted successfully');
  });

  // Toggle plan status
  togglePlanStatus = asyncHandler(async (req, res) => {
    const plan = await subscriptionPlanService.togglePlanStatus(
      req.params.id,
      req.body.isActive
    );

    const message = req.body.isActive
      ? 'Subscription plan activated successfully'
      : 'Subscription plan deactivated successfully';

    return ApiResponse.success(res, plan, message);
  });
}

module.exports = new SubscriptionPlanController();
