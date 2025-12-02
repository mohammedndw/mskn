const { prisma } = require('../config/database');
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const documentGenerator = require('../utils/documentGenerator');

class ContractService {
  /**
   * Calculate days until contract expiration
   */
  calculateDaysUntilExpiration(endDate) {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  /**
   * Generate tenant portal token
   */
  generateTenantPortalToken(contractId, tenantNationalId) {
    const payload = {
      contractId,
      tenantNationalId,
      type: 'TENANT_PORTAL'
    };

    const expiresIn = config.tenantPortalTokenExpiresIn || '30d';

    const token = jwt.sign(payload, config.jwtSecret, {
      expiresIn
    });

    return token;
  }

  /**
   * Get all contracts with filters and RBAC
   */
  async getAllContracts(filters = {}, userRole, userId) {
    const { propertyId, tenantId, ownerId, status } = filters;

    const where = {};

    // If user is PROPERTY_OWNER, only show contracts for their properties
    if (userRole === 'PROPERTY_OWNER') {
      where.property = {
        ownerId: userId
      };
    }

    // If user is PROPERTY_MANAGER, only show contracts they manage
    if (userRole === 'PROPERTY_MANAGER') {
      where.managerId = userId;
    }

    // Apply property filter
    if (propertyId) {
      where.propertyId = propertyId;
    }

    // Apply tenant filter
    if (tenantId) {
      where.tenantId = tenantId;
    }

    // Apply owner filter (only for ADMIN)
    if (ownerId && userRole === 'ADMIN') {
      where.property = {
        ownerId
      };
    }

    // Apply status filter
    if (status === 'active') {
      where.endDate = { gte: new Date() };
    } else if (status === 'expired') {
      where.endDate = { lt: new Date() };
    }

    const contracts = await prisma.contract.findMany({
      where,
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
        },
        tenant: true,
        _count: {
          select: {
            maintenanceRequests: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Add calculated fields
    const contractsWithCalculations = contracts.map(contract => ({
      ...contract,
      daysUntilExpiration: this.calculateDaysUntilExpiration(contract.endDate),
      isActive: new Date(contract.endDate) >= new Date(),
      tenantPortalLink: contract.tenantPortalToken
        ? `${config.clientUrl}/tenant-portal/${contract.tenantPortalToken}`
        : null
    }));

    return contractsWithCalculations;
  }

  /**
   * Get contract by ID
   */
  async getContractById(id, userRole, userId) {
    const contract = await prisma.contract.findUnique({
      where: { id },
      include: {
        property: {
          include: {
            estate: true,
            owner: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                nationalId: true
              }
            }
          }
        },
        tenant: true,
        maintenanceRequests: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!contract) {
      throw new Error('Contract not found');
    }

    // If user is PROPERTY_OWNER, verify they own the property
    if (userRole === 'PROPERTY_OWNER' && contract.property.ownerId !== userId) {
      throw new Error('Access denied: You can only view contracts for your properties');
    }

    // If user is PROPERTY_MANAGER, verify they manage this contract
    if (userRole === 'PROPERTY_MANAGER' && contract.managerId !== userId) {
      throw new Error('Access denied: You can only view contracts you manage');
    }

    // Add calculated fields
    return {
      ...contract,
      daysUntilExpiration: this.calculateDaysUntilExpiration(contract.endDate),
      isActive: new Date(contract.endDate) >= new Date(),
      tenantPortalLink: contract.tenantPortalToken
        ? `${config.clientUrl}/tenant-portal/${contract.tenantPortalToken}`
        : null
    };
  }

  /**
   * Create contract
   */
  async createContract(data, userRole, userId) {
    // Verify property exists and get owner info
    const property = await prisma.property.findUnique({
      where: { id: data.propertyId },
      include: {
        estate: true,
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
    });

    if (!property) {
      throw new Error('Property not found');
    }

    // If user is PROPERTY_MANAGER, verify they manage this property
    if (userRole === 'PROPERTY_MANAGER' && property.managerId !== userId) {
      throw new Error('Access denied: You can only create contracts for properties you manage');
    }

    // Check if property is already rented
    const activeContract = await prisma.contract.findFirst({
      where: {
        propertyId: data.propertyId,
        endDate: { gte: new Date() }
      }
    });

    if (activeContract) {
      throw new Error('Property already has an active contract');
    }

    // Verify tenant exists
    const tenant = await prisma.tenant.findUnique({
      where: { id: data.tenantId }
    });

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    // Validate dates
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    if (endDate <= startDate) {
      throw new Error('End date must be after start date');
    }

    // Ensure price is a number
    const price = typeof data.price === 'string' ? parseFloat(data.price) : data.price;

    // Create contract
    const contract = await prisma.contract.create({
      data: {
        propertyId: data.propertyId,
        tenantId: data.tenantId,
        managerId: userRole === 'PROPERTY_MANAGER' ? userId : null,
        price,
        startDate,
        endDate,
        paymentFrequency: data.paymentFrequency
      },
      include: {
        property: {
          include: {
            estate: true,
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
        },
        tenant: true
      }
    });

    // Generate contract document
    const documentUrl = documentGenerator.generateContractDocument({
      contract,
      property: contract.property,
      tenant: contract.tenant,
      owner: contract.property.owner
    });

    // Generate tenant portal token
    const tenantPortalToken = this.generateTenantPortalToken(
      contract.id,
      tenant.nationalId
    );

    // Update contract with document URL and token
    const updatedContract = await prisma.contract.update({
      where: { id: contract.id },
      data: {
        documentUrl,
        tenantPortalToken
      },
      include: {
        property: {
          include: {
            estate: true,
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
        },
        tenant: true
      }
    });

    // Auto-update property status to RENTED
    await prisma.property.update({
      where: { id: data.propertyId },
      data: { status: 'RENTED' }
    });

    // Add calculated fields
    return {
      ...updatedContract,
      daysUntilExpiration: this.calculateDaysUntilExpiration(updatedContract.endDate),
      isActive: true,
      tenantPortalLink: `${config.clientUrl}/tenant-portal/${tenantPortalToken}`
    };
  }

  /**
   * Update contract
   */
  async updateContract(id, data, userRole, userId) {
    // Check if contract exists
    const existingContract = await this.getContractById(id, userRole, userId);

    // If changing property, verify it exists and is available
    if (data.propertyId && data.propertyId !== existingContract.propertyId) {
      const property = await prisma.property.findUnique({
        where: { id: data.propertyId }
      });

      if (!property) {
        throw new Error('Property not found');
      }

      // Check if new property has active contract
      const activeContract = await prisma.contract.findFirst({
        where: {
          propertyId: data.propertyId,
          endDate: { gte: new Date() },
          id: { not: id }
        }
      });

      if (activeContract) {
        throw new Error('New property already has an active contract');
      }
    }

    // If changing tenant, verify tenant exists
    if (data.tenantId && data.tenantId !== existingContract.tenantId) {
      const tenant = await prisma.tenant.findUnique({
        where: { id: data.tenantId }
      });

      if (!tenant) {
        throw new Error('Tenant not found');
      }
    }

    // Convert date strings to Date objects
    if (data.startDate) {
      data.startDate = new Date(data.startDate);
    }
    if (data.endDate) {
      data.endDate = new Date(data.endDate);
    }

    // Update contract
    const contract = await prisma.contract.update({
      where: { id },
      data,
      include: {
        property: {
          include: {
            estate: true,
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
        },
        tenant: true
      }
    });

    // Regenerate document if significant changes
    if (data.price || data.startDate || data.endDate || data.paymentFrequency) {
      const documentUrl = documentGenerator.generateContractDocument({
        contract,
        property: contract.property,
        tenant: contract.tenant,
        owner: contract.property.owner
      });

      await prisma.contract.update({
        where: { id },
        data: { documentUrl }
      });

      contract.documentUrl = documentUrl;
    }

    // Add calculated fields
    return {
      ...contract,
      daysUntilExpiration: this.calculateDaysUntilExpiration(contract.endDate),
      isActive: new Date(contract.endDate) >= new Date(),
      tenantPortalLink: contract.tenantPortalToken
        ? `${config.clientUrl}/tenant-portal/${contract.tenantPortalToken}`
        : null
    };
  }

  /**
   * Delete contract
   */
  async deleteContract(id, userRole, userId) {
    // Check if contract exists and user has access
    const contract = await this.getContractById(id, userRole, userId);

    // Get the property to update status later
    const propertyId = contract.propertyId;

    // Delete contract
    await prisma.contract.delete({
      where: { id }
    });

    // Check if property has any other active contracts
    const remainingActiveContracts = await prisma.contract.count({
      where: {
        propertyId,
        endDate: { gte: new Date() }
      }
    });

    // If no active contracts remain, set property status back to AVAILABLE
    if (remainingActiveContracts === 0) {
      await prisma.property.update({
        where: { id: propertyId },
        data: { status: 'AVAILABLE' }
      });
    }

    return { message: 'Contract deleted successfully' };
  }
}

module.exports = new ContractService();
