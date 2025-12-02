const express = require('express');
const router = express.Router();
const userSubscriptionController = require('../controllers/userSubscription.controller');
const { authenticate, authorize } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const {
  assignSubscriptionSchema,
  updateUserSubscriptionSchema,
  getUserSubscriptionSchema
} = require('../validations/subscription.validation');

// All routes require authentication
router.use(authenticate);

// Route for users to get their own subscription (before admin-only routes)
router.get('/my-subscription', userSubscriptionController.getMySubscription);

// Admin-only routes
router.get('/', authorize('ADMIN'), userSubscriptionController.getAllSubscriptions);
router.get('/:userId', authorize('ADMIN'), validate(getUserSubscriptionSchema), userSubscriptionController.getUserSubscription);
router.post('/', authorize('ADMIN'), validate(assignSubscriptionSchema), userSubscriptionController.assignSubscription);
router.put('/:userId', authorize('ADMIN'), validate(updateUserSubscriptionSchema), userSubscriptionController.updateUserSubscription);
router.delete('/:userId', authorize('ADMIN'), validate(getUserSubscriptionSchema), userSubscriptionController.removeUserSubscription);
router.patch('/:userId/toggle', authorize('ADMIN'), validate(getUserSubscriptionSchema), userSubscriptionController.toggleSubscriptionStatus);
router.patch('/:userId/renew', authorize('ADMIN'), validate(getUserSubscriptionSchema), userSubscriptionController.renewSubscription);

module.exports = router;
