const { prisma } = require('../config/database');

class MaintenanceService {
  /**
   * Get all maintenance requests with filters and RBAC
   */
  async getAllMaintenanceRequests(filters = {}, userRole, userId) {
    const { contractId, tenantId, propertyId, status } = filters;

    const where = {};

    // If user is PROPERTY_OWNER, only show requests for their properties
    if (userRole === 'PROPERTY_OWNER') {
      where.contract = {
        property: {
          ownerId: userId
        }
      };
    }

    // Apply contract filter
    if (contractId) {
      where.contractId = contractId;
    }

    // Apply tenant filter
    if (tenantId) {
      where.tenantId = tenantId;
    }

    // Apply property filter
    if (propertyId) {
      where.contract = {
        ...where.contract,
        propertyId
      };
    }

    // Apply status filter
    if (status) {
      where.status = status;
    }

    const requests = await prisma.maintenanceRequest.findMany({
      where,
      include: {
        contract: {
          include: {
            property: {
              select: {
                id: true,
                name: true,
                type: true,
                estate: {
                  select: {
                    id: true,
                    name: true,
                    city: true
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
            tenant: {
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
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            nationalId: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return requests;
  }

  /**
   * Get maintenance request by ID
   */
  async getMaintenanceRequestById(id, userRole, userId) {
    const request = await prisma.maintenanceRequest.findUnique({
      where: { id },
      include: {
        contract: {
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
            }
          }
        },
        tenant: {
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
    });

    if (!request) {
      throw new Error('Maintenance request not found');
    }

    // If user is PROPERTY_OWNER, verify they own the property
    if (userRole === 'PROPERTY_OWNER' && request.contract.property.ownerId !== userId) {
      throw new Error('Access denied: You can only view maintenance requests for your properties');
    }

    return request;
  }

  /**
   * Create maintenance request
   */
  async createMaintenanceRequest(data, tenantId = null) {
    // If tenantId is provided (from authenticated route), use it
    // Otherwise, get tenant from contract
    let actualTenantId = tenantId;

    // Verify contract exists
    const contract = await prisma.contract.findUnique({
      where: { id: data.contractId },
      include: {
        tenant: true,
        property: true
      }
    });

    if (!contract) {
      throw new Error('Contract not found');
    }

    // If tenantId not provided, use contract's tenant
    if (!actualTenantId) {
      actualTenantId = contract.tenantId;
    } else {
      // Verify the tenant matches the contract
      if (contract.tenantId !== actualTenantId) {
        throw new Error('This contract does not belong to you');
      }
    }

    // Check if contract is active
    if (new Date(contract.endDate) < new Date()) {
      throw new Error('Cannot create maintenance request for expired contract');
    }

    // Create maintenance request
    const request = await prisma.maintenanceRequest.create({
      data: {
        contractId: data.contractId,
        tenantId: actualTenantId,
        title: data.title,
        description: data.description,
        images: data.images || [],
        status: 'PENDING'
      },
      include: {
        contract: {
          include: {
            property: {
              select: {
                id: true,
                name: true,
                type: true,
                estate: {
                  select: {
                    name: true,
                    city: true
                  }
                }
              }
            }
          }
        },
        tenant: {
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

    return request;
  }

  /**
   * Create maintenance request from tenant portal
   */
  async createMaintenanceRequestFromPortal(data, contractId, tenantNationalId) {
    // Find tenant by national ID
    const tenant = await prisma.tenant.findUnique({
      where: { nationalId: tenantNationalId }
    });

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    // Verify contract exists and belongs to tenant
    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        property: true
      }
    });

    if (!contract) {
      throw new Error('Contract not found');
    }

    if (contract.tenantId !== tenant.id) {
      throw new Error('This contract does not belong to you');
    }

    // Check if contract is active
    if (new Date(contract.endDate) < new Date()) {
      throw new Error('Cannot create maintenance request for expired contract');
    }

    // Create maintenance request
    const request = await prisma.maintenanceRequest.create({
      data: {
        contractId,
        tenantId: tenant.id,
        title: data.title,
        description: data.description,
        images: data.images || [],
        status: 'PENDING'
      },
      include: {
        contract: {
          include: {
            property: {
              select: {
                id: true,
                name: true,
                type: true,
                estate: {
                  select: {
                    name: true,
                    city: true
                  }
                }
              }
            }
          }
        },
        tenant: {
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

    return request;
  }

  /**
   * Update maintenance request status and notes
   */
  async updateMaintenanceRequest(id, data, userRole, userId) {
    // Check if request exists and user has access
    const existingRequest = await this.getMaintenanceRequestById(id, userRole, userId);

    // Validate status transition
    if (data.status) {
      const validTransitions = {
        'PENDING': ['IN_PROGRESS', 'CANCELLED'],
        'IN_PROGRESS': ['COMPLETED', 'CANCELLED'],
        'COMPLETED': [],
        'CANCELLED': []
      };

      const currentStatus = existingRequest.status;
      const newStatus = data.status;

      if (currentStatus === newStatus) {
        throw new Error(`Status is already ${newStatus}`);
      }

      if (!validTransitions[currentStatus].includes(newStatus)) {
        throw new Error(`Cannot transition from ${currentStatus} to ${newStatus}`);
      }
    }

    // Update request
    const request = await prisma.maintenanceRequest.update({
      where: { id },
      data: {
        status: data.status,
        internalNotes: data.internalNotes
      },
      include: {
        contract: {
          include: {
            property: {
              select: {
                id: true,
                name: true,
                type: true,
                estate: {
                  select: {
                    name: true,
                    city: true
                  }
                }
              }
            }
          }
        },
        tenant: {
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

    return request;
  }

  /**
   * Delete maintenance request
   */
  async deleteMaintenanceRequest(id, userRole, userId) {
    // Check if request exists and user has access
    await this.getMaintenanceRequestById(id, userRole, userId);

    // Delete request
    await prisma.maintenanceRequest.delete({
      where: { id }
    });

    return { message: 'Maintenance request deleted successfully' };
  }

  /**
   * Get maintenance statistics
   */
  async getMaintenanceStats(userRole, userId) {
    const where = {};

    // If user is PROPERTY_OWNER, only their properties
    if (userRole === 'PROPERTY_OWNER') {
      where.contract = {
        property: {
          ownerId: userId
        }
      };
    }

    const [total, pending, inProgress, completed, cancelled] = await Promise.all([
      prisma.maintenanceRequest.count({ where }),
      prisma.maintenanceRequest.count({ where: { ...where, status: 'PENDING' } }),
      prisma.maintenanceRequest.count({ where: { ...where, status: 'IN_PROGRESS' } }),
      prisma.maintenanceRequest.count({ where: { ...where, status: 'COMPLETED' } }),
      prisma.maintenanceRequest.count({ where: { ...where, status: 'CANCELLED' } })
    ]);

    return {
      total,
      pending,
      inProgress,
      completed,
      cancelled
    };
  }
}

module.exports = new MaintenanceService();
