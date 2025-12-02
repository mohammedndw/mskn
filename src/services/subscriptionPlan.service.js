const { prisma } = require('../config/database');
const { AppError } = require('../middlewares/errorHandler');

class SubscriptionPlanService {
  // Get all subscription plans
  async getAllPlans(filters = {}) {
    const { isActive } = filters;

    const where = {};
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const plans = await prisma.subscriptionPlan.findMany({
      where,
      include: {
        _count: {
          select: { subscriptions: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return plans;
  }

  // Get plan by ID
  async getPlanById(planId) {
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
      include: {
        subscriptions: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true
              }
            }
          }
        },
        _count: {
          select: { subscriptions: true }
        }
      }
    });

    if (!plan) {
      throw new AppError('Subscription plan not found', 404);
    }

    return plan;
  }

  // Create subscription plan
  async createPlan(planData) {
    const { name, description, price, durationDays, maxProperties, features, isActive } = planData;

    const plan = await prisma.subscriptionPlan.create({
      data: {
        name,
        description,
        price,
        durationDays,
        maxProperties: maxProperties || 10,
        features: features || null,
        isActive: isActive !== undefined ? isActive : true
      }
    });

    return plan;
  }

  // Update subscription plan
  async updatePlan(planId, updateData) {
    const existingPlan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId }
    });

    if (!existingPlan) {
      throw new AppError('Subscription plan not found', 404);
    }

    const updatedPlan = await prisma.subscriptionPlan.update({
      where: { id: planId },
      data: updateData
    });

    return updatedPlan;
  }

  // Delete subscription plan
  async deletePlan(planId) {
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
      include: {
        _count: {
          select: { subscriptions: true }
        }
      }
    });

    if (!plan) {
      throw new AppError('Subscription plan not found', 404);
    }

    // Check if plan has active subscriptions
    if (plan._count.subscriptions > 0) {
      throw new AppError('Cannot delete plan with active subscriptions', 400);
    }

    await prisma.subscriptionPlan.delete({
      where: { id: planId }
    });

    return { message: 'Subscription plan deleted successfully' };
  }

  // Activate/Deactivate plan
  async togglePlanStatus(planId, isActive) {
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId }
    });

    if (!plan) {
      throw new AppError('Subscription plan not found', 404);
    }

    const updatedPlan = await prisma.subscriptionPlan.update({
      where: { id: planId },
      data: { isActive }
    });

    return updatedPlan;
  }
}

module.exports = new SubscriptionPlanService();
