const { prisma } = require('../config/database');

class TenantService {
  // Get all tenants with filters and RBAC
  async getAllTenants(filters = {}, userRole, userId) {
    const { search, email, phone, nationalId } = filters;

    const where = {};

    // If user is PROPERTY_OWNER, only show tenants renting their properties
    if (userRole === 'PROPERTY_OWNER') {
      where.contracts = {
        some: {
          property: {
            ownerId: userId
          },
          endDate: { gte: new Date() } // Only active contracts
        }
      };
    }

    // If user is PROPERTY_MANAGER, only show tenants they manage
    if (userRole === 'PROPERTY_MANAGER') {
      where.managerId = userId;
    }

    // Apply search filter
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { nationalId: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Apply specific filters
    if (email) {
      where.email = { contains: email, mode: 'insensitive' };
    }

    if (phone) {
      where.phone = { contains: phone, mode: 'insensitive' };
    }

    if (nationalId) {
      where.nationalId = { contains: nationalId, mode: 'insensitive' };
    }

    const tenants = await prisma.tenant.findMany({
      where,
      include: {
        contracts: {
          where: {
            endDate: { gte: new Date() }
          },
          include: {
            property: {
              select: {
                id: true,
                name: true,
                status: true,
                estate: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        },
        _count: {
          select: {
            contracts: true,
            maintenanceRequests: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return tenants;
  }

  // Get tenant by ID
  async getTenantById(id, userRole, userId) {
    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        contracts: {
          include: {
            property: {
              include: {
                estate: {
                  select: {
                    id: true,
                    name: true,
                    city: true,
                    region: true
                  }
                },
                owner: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    phone: true
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        maintenanceRequests: {
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        _count: {
          select: {
            contracts: true,
            maintenanceRequests: true
          }
        }
      }
    });

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    // If user is PROPERTY_OWNER, verify they have a contract with this tenant
    if (userRole === 'PROPERTY_OWNER') {
      const hasContract = tenant.contracts.some(
        contract => contract.property.ownerId === userId && new Date(contract.endDate) >= new Date()
      );

      if (!hasContract) {
        throw new Error('Access denied: You can only view tenants renting your properties');
      }
    }

    // If user is PROPERTY_MANAGER, verify they manage this tenant
    if (userRole === 'PROPERTY_MANAGER' && tenant.managerId !== userId) {
      throw new Error('Access denied: You can only view tenants you manage');
    }

    return tenant;
  }

  // Create tenant
  async createTenant(data, userRole, userId) {
    // Check if tenant with same nationalId already exists
    const existingTenant = await prisma.tenant.findUnique({
      where: { nationalId: data.nationalId }
    });

    if (existingTenant) {
      throw new Error('Tenant with this national ID already exists');
    }

    // Generate email if not provided
    const tenantEmail = data.email || `tenant_${data.nationalId}@tenant.local`;

    // Check if email is already used
    const existingEmail = await prisma.tenant.findFirst({
      where: { email: tenantEmail }
    });

    if (existingEmail) {
      throw new Error('Tenant with this email already exists');
    }

    const tenant = await prisma.tenant.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: tenantEmail,
        phone: data.phone,
        nationalId: data.nationalId,
        birthDate: new Date(data.birthDate),
        managerId: userRole === 'PROPERTY_MANAGER' ? userId : null
      },
      include: {
        _count: {
          select: {
            contracts: true,
            maintenanceRequests: true
          }
        }
      }
    });

    return tenant;
  }

  // Update tenant
  async updateTenant(id, data) {
    // Check if tenant exists
    const existingTenant = await prisma.tenant.findUnique({
      where: { id }
    });

    if (!existingTenant) {
      throw new Error('Tenant not found');
    }

    // If updating nationalId, check uniqueness
    if (data.nationalId && data.nationalId !== existingTenant.nationalId) {
      const duplicateNationalId = await prisma.tenant.findUnique({
        where: { nationalId: data.nationalId }
      });

      if (duplicateNationalId) {
        throw new Error('Tenant with this national ID already exists');
      }
    }

    // If updating email, check uniqueness
    if (data.email && data.email !== existingTenant.email) {
      const duplicateEmail = await prisma.tenant.findFirst({
        where: { email: data.email }
      });

      if (duplicateEmail) {
        throw new Error('Tenant with this email already exists');
      }
    }

    // Convert birthDate string to Date if provided
    if (data.birthDate) {
      data.birthDate = new Date(data.birthDate);
    }

    const tenant = await prisma.tenant.update({
      where: { id },
      data,
      include: {
        contracts: {
          where: {
            endDate: { gte: new Date() }
          },
          include: {
            property: {
              select: {
                id: true,
                name: true,
                status: true
              }
            }
          }
        },
        _count: {
          select: {
            contracts: true,
            maintenanceRequests: true
          }
        }
      }
    });

    return tenant;
  }

  // Delete tenant
  async deleteTenant(id) {
    // Check if tenant exists
    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            contracts: true,
            maintenanceRequests: true
          }
        }
      }
    });

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    // Check if tenant has active contracts
    const activeContracts = await prisma.contract.count({
      where: {
        tenantId: id,
        endDate: { gte: new Date() }
      }
    });

    if (activeContracts > 0) {
      throw new Error('Cannot delete tenant with active contracts. Please end or delete contracts first.');
    }

    // Delete tenant (this will cascade delete contracts and maintenance requests based on schema)
    await prisma.tenant.delete({
      where: { id }
    });

    return { message: 'Tenant deleted successfully' };
  }

  // Get tenant statistics
  async getTenantStats(id) {
    const tenant = await this.getTenantById(id, 'ADMIN', null);

    const activeContracts = tenant.contracts.filter(c => new Date(c.endDate) >= new Date()).length;
    const expiredContracts = tenant.contracts.filter(c => new Date(c.endDate) < new Date()).length;
    const pendingMaintenance = await prisma.maintenanceRequest.count({
      where: {
        tenantId: id,
        status: 'PENDING'
      }
    });

    return {
      totalContracts: tenant._count.contracts,
      activeContracts,
      expiredContracts,
      totalMaintenanceRequests: tenant._count.maintenanceRequests,
      pendingMaintenanceRequests: pendingMaintenance
    };
  }
}

module.exports = new TenantService();
