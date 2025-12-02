const express = require('express');
const router = express.Router();
const subscriptionPlanController = require('../controllers/subscriptionPlan.controller');
const { authenticate, authorize } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const {
  createPlanSchema,
  updatePlanSchema,
  getPlanSchema
} = require('../validations/subscription.validation');

// All routes require admin authentication
router.use(authenticate);
router.use(authorize('ADMIN'));

// Subscription plan routes
router.get('/', subscriptionPlanController.getAllPlans);
router.get('/:id', validate(getPlanSchema), subscriptionPlanController.getPlanById);
router.post('/', validate(createPlanSchema), subscriptionPlanController.createPlan);
router.put('/:id', validate(updatePlanSchema), subscriptionPlanController.updatePlan);
router.delete('/:id', validate(getPlanSchema), subscriptionPlanController.deletePlan);
router.patch('/:id/toggle', validate(getPlanSchema), subscriptionPlanController.togglePlanStatus);

module.exports = router;
