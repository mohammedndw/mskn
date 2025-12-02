const { prisma } = require('../config/database');

class DashboardService {
  // Get admin dashboard statistics
  async getAdminDashboard() {
    // Get user statistics
    const totalUsers = await prisma.user.count();
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
    const propertyManagerCount = await prisma.user.count({ where: { role: 'PROPERTY_MANAGER' } });
    const propertyOwnerCount = await prisma.user.count({ where: { role: 'PROPERTY_OWNER' } });
    const blockedUsersCount = await prisma.user.count({ where: { isBlocked: true } });

    // Get subscription statistics
    const totalSubscriptions = await prisma.userSubscription.count();
    const activeSubscriptions = await prisma.userSubscription.count({ where: { isActive: true } });
    const totalPlans = await prisma.subscriptionPlan.count();
    const activePlans = await prisma.subscriptionPlan.count({ where: { isActive: true } });

    // Get property statistics
    const totalProperties = await prisma.property.count();
    const availableProperties = await prisma.property.count({ where: { status: 'AVAILABLE' } });
    const rentedProperties = await prisma.property.count({ where: { status: 'RENTED' } });
    const reservedProperties = await prisma.property.count({ where: { status: 'RESERVED' } });

    // Get estate statistics
    const totalEstates = await prisma.estate.count();

    // Get tenant statistics
    const totalTenants = await prisma.tenant.count();

    // Get contract statistics
    const totalContracts = await prisma.contract.count();
    const now = new Date();
    const activeContracts = await prisma.contract.count({
      where: {
        startDate: { lte: now },
        endDate: { gte: now }
      }
    });
    const expiredContracts = await prisma.contract.count({
      where: {
        endDate: { lt: now }
      }
    });

    // Get maintenance statistics
    const totalMaintenanceRequests = await prisma.maintenanceRequest.count();
    const pendingMaintenance = await prisma.maintenanceRequest.count({ where: { status: 'PENDING' } });
    const inProgressMaintenance = await prisma.maintenanceRequest.count({ where: { status: 'IN_PROGRESS' } });
    const completedMaintenance = await prisma.maintenanceRequest.count({ where: { status: 'COMPLETED' } });

    // Get recent users
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true
      }
    });

    // Get expiring subscriptions (within 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringSubscriptions = await prisma.userSubscription.findMany({
      where: {
        endDate: {
          gte: now,
          lte: thirtyDaysFromNow
        },
        isActive: true
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        plan: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { endDate: 'asc' }
    });

    // Calculate days remaining for expiring subscriptions
    const expiringWithDays = expiringSubscriptions.map(sub => {
      const daysRemaining = Math.ceil((new Date(sub.endDate) - now) / (1000 * 60 * 60 * 24));
      return {
        ...sub,
        daysRemaining
      };
    });

    return {
      users: {
        total: totalUsers,
        admins: adminCount,
        propertyManagers: propertyManagerCount,
        propertyOwners: propertyOwnerCount,
        blocked: blockedUsersCount
      },
      subscriptions: {
        total: totalSubscriptions,
        active: activeSubscriptions,
        totalPlans: totalPlans,
        activePlans: activePlans,
        expiringSoon: expiringWithDays.length
      },
      properties: {
        total: totalProperties,
        available: availableProperties,
        rented: rentedProperties,
        reserved: reservedProperties
      },
      estates: {
        total: totalEstates
      },
      tenants: {
        total: totalTenants
      },
      contracts: {
        total: totalContracts,
        active: activeContracts,
        expired: expiredContracts
      },
      maintenance: {
        total: totalMaintenanceRequests,
        pending: pendingMaintenance,
        inProgress: inProgressMaintenance,
        completed: completedMaintenance
      },
      recentActivity: {
        recentUsers,
        expiringSubscriptions: expiringWithDays
      }
    };
  }

  // Get Property Manager dashboard (only their own data)
  async getPropertyManagerDashboard(userId) {
    // Get only properties managed by this manager
    const totalProperties = await prisma.property.count({
      where: { managerId: userId }
    });

    const availableProperties = await prisma.property.count({
      where: { managerId: userId, status: 'AVAILABLE' }
    });

    const rentedProperties = await prisma.property.count({
      where: { managerId: userId, status: 'RENTED' }
    });

    const reservedProperties = await prisma.property.count({
      where: { managerId: userId, status: 'RESERVED' }
    });

    // Get only tenants managed by this manager
    const totalTenants = await prisma.tenant.count({
      where: { managerId: userId }
    });

    // Get only contracts managed by this manager
    const totalContracts = await prisma.contract.count({
      where: { managerId: userId }
    });
    const now = new Date();
    const activeContracts = await prisma.contract.count({
      where: {
        managerId: userId,
        startDate: { lte: now },
        endDate: { gte: now }
      }
    });

    // Get maintenance requests for contracts managed by this manager
    const totalMaintenanceRequests = await prisma.maintenanceRequest.count({
      where: {
        contract: { managerId: userId }
      }
    });
    const pendingMaintenance = await prisma.maintenanceRequest.count({
      where: {
        contract: { managerId: userId },
        status: 'PENDING'
      }
    });
    const inProgressMaintenance = await prisma.maintenanceRequest.count({
      where: {
        contract: { managerId: userId },
        status: 'IN_PROGRESS'
      }
    });

    // Get only estates managed by this manager
    const totalEstates = await prisma.estate.count({
      where: { managerId: userId }
    });

    return {
      properties: {
        total: totalProperties,
        available: availableProperties,
        rented: rentedProperties,
        reserved: reservedProperties
      },
      tenants: {
        total: totalTenants
      },
      contracts: {
        total: totalContracts,
        active: activeContracts
      },
      maintenance: {
        total: totalMaintenanceRequests,
        pending: pendingMaintenance,
        inProgress: inProgressMaintenance
      },
      estates: {
        total: totalEstates
      }
    };
  }

  // Get Property Owner dashboard
  async getPropertyOwnerDashboard(userId) {
    // Get properties owned by this owner
    const properties = await prisma.property.findMany({
      where: { ownerId: userId },
      include: {
        estate: true,
        contracts: {
          include: {
            tenant: true
          },
          where: {
            endDate: {
              gte: new Date()
            }
          }
        }
      }
    });

    const totalProperties = properties.length;
    const rentedProperties = properties.filter(p => p.status === 'RENTED').length;
    const availableProperties = properties.filter(p => p.status === 'AVAILABLE').length;

    // Get active contracts
    const now = new Date();
    let activeContracts = 0;
    properties.forEach(property => {
      const active = property.contracts.filter(c =>
        new Date(c.startDate) <= now && new Date(c.endDate) >= now
      );
      activeContracts += active.length;
    });

    return {
      properties: {
        total: totalProperties,
        rented: rentedProperties,
        available: availableProperties
      },
      contracts: {
        active: activeContracts
      },
      propertiesList: properties.map(p => ({
        id: p.id,
        name: p.name,
        status: p.status,
        estate: p.estate.name,
        currentTenant: p.contracts[0]?.tenant ? {
          name: `${p.contracts[0].tenant.firstName} ${p.contracts[0].tenant.lastName}`,
          email: p.contracts[0].tenant.email
        } : null
      }))
    };
  }
}

module.exports = new DashboardService();
