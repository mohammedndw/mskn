const { prisma } = require('../config/database');
const { AppError } = require('../middlewares/errorHandler');

class UserSubscriptionService {
  // Get all user subscriptions
  async getAllSubscriptions(filters = {}) {
    const { isActive, planId } = filters;

    const where = {};
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (planId) where.planId = planId;

    const subscriptions = await prisma.userSubscription.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true
          }
        },
        plan: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calculate days remaining for each subscription
    const subscriptionsWithDaysRemaining = subscriptions.map(sub => {
      const now = new Date();
      const endDate = new Date(sub.endDate);
      const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

      return {
        ...sub,
        daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
        isExpired: daysRemaining <= 0
      };
    });

    return subscriptionsWithDaysRemaining;
  }

  // Get user subscription by user ID
  async getUserSubscription(userId) {
    const subscription = await prisma.userSubscription.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true
          }
        },
        plan: true
      }
    });

    if (!subscription) {
      throw new AppError('User subscription not found', 404);
    }

    // Calculate days remaining
    const now = new Date();
    const endDate = new Date(subscription.endDate);
    const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

    return {
      ...subscription,
      daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
      isExpired: daysRemaining <= 0
    };
  }

  // Assign subscription to user
  async assignSubscription(subscriptionData) {
    const { userId, planId, startDate, customDuration } = subscriptionData;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check if plan exists
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId }
    });

    if (!plan) {
      throw new AppError('Subscription plan not found', 404);
    }

    if (!plan.isActive) {
      throw new AppError('Cannot assign inactive subscription plan', 400);
    }

    // Check if user already has a subscription
    const existingSubscription = await prisma.userSubscription.findUnique({
      where: { userId }
    });

    if (existingSubscription) {
      throw new AppError('User already has a subscription. Please update or delete the existing one first.', 400);
    }

    // Calculate dates
    const start = startDate ? new Date(startDate) : new Date();
    const durationDays = customDuration || plan.durationInDays;
    const end = new Date(start);
    end.setDate(end.getDate() + durationDays);

    // Create subscription
    const subscription = await prisma.userSubscription.create({
      data: {
        userId,
        planId,
        startDate: start,
        endDate: end,
        isActive: true
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true
          }
        },
        plan: true
      }
    });

    return subscription;
  }

  // Update user subscription
  async updateUserSubscription(userId, updateData) {
    const existingSubscription = await prisma.userSubscription.findUnique({
      where: { userId }
    });

    if (!existingSubscription) {
      throw new AppError('User subscription not found', 404);
    }

    // If planId is being changed, validate the new plan
    if (updateData.planId) {
      const plan = await prisma.subscriptionPlan.findUnique({
        where: { id: updateData.planId }
      });

      if (!plan) {
        throw new AppError('Subscription plan not found', 404);
      }
    }

    // Convert endDate string to Date if provided
    if (updateData.endDate) {
      updateData.endDate = new Date(updateData.endDate);
    }

    const updatedSubscription = await prisma.userSubscription.update({
      where: { userId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true
          }
        },
        plan: true
      }
    });

    return updatedSubscription;
  }

  // Remove user subscription
  async removeUserSubscription(userId) {
    const subscription = await prisma.userSubscription.findUnique({
      where: { userId }
    });

    if (!subscription) {
      throw new AppError('User subscription not found', 404);
    }

    await prisma.userSubscription.delete({
      where: { userId }
    });

    return { message: 'User subscription removed successfully' };
  }

  // Activate/Deactivate subscription
  async toggleSubscriptionStatus(userId, isActive) {
    const subscription = await prisma.userSubscription.findUnique({
      where: { userId }
    });

    if (!subscription) {
      throw new AppError('User subscription not found', 404);
    }

    const updatedSubscription = await prisma.userSubscription.update({
      where: { userId },
      data: { isActive },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true
          }
        },
        plan: true
      }
    });

    return updatedSubscription;
  }

  // Renew subscription (extend end date)
  async renewSubscription(userId, extensionDays) {
    const subscription = await prisma.userSubscription.findUnique({
      where: { userId },
      include: { plan: true }
    });

    if (!subscription) {
      throw new AppError('User subscription not found', 404);
    }

    // Calculate new end date
    const newEndDate = new Date(subscription.endDate);
    const daysToAdd = extensionDays || subscription.plan.durationInDays;
    newEndDate.setDate(newEndDate.getDate() + daysToAdd);

    const updatedSubscription = await prisma.userSubscription.update({
      where: { userId },
      data: {
        endDate: newEndDate,
        isActive: true
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true
          }
        },
        plan: true
      }
    });

    return updatedSubscription;
  }
}

module.exports = new UserSubscriptionService();
