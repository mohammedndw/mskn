const { prisma } = require('../config/database');

class TenantPortalService {
  /**
   * Get tenant contracts by national ID (from token)
   */
  async getTenantContracts(tenantNationalId) {
    // Find tenant
    const tenant = await prisma.tenant.findUnique({
      where: { nationalId: tenantNationalId }
    });

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    // Get all contracts for this tenant
    const contracts = await prisma.contract.findMany({
      where: {
        tenantId: tenant.id
      },
      include: {
        property: {
          include: {
            estate: {
              select: {
                id: true,
                name: true,
                city: true,
                region: true,
                address: true
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
        },
        maintenanceRequests: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            images: true,
            createdAt: true,
            updatedAt: true
          },
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Add calculated fields
    const contractsWithCalculations = contracts.map(contract => {
      const today = new Date();
      const end = new Date(contract.endDate);
      const diffTime = end - today;
      const daysUntilExpiration = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        ...contract,
        daysUntilExpiration,
        isActive: end >= today
      };
    });

    return {
      tenant: {
        id: tenant.id,
        firstName: tenant.firstName,
        lastName: tenant.lastName,
        email: tenant.email,
        phone: tenant.phone
      },
      contracts: contractsWithCalculations
    };
  }

  /**
   * Get specific contract by ID (verify access via national ID)
   */
  async getContractById(contractId, tenantNationalId) {
    // Find tenant
    const tenant = await prisma.tenant.findUnique({
      where: { nationalId: tenantNationalId }
    });

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    // Get contract and verify it belongs to this tenant
    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
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
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            nationalId: true
          }
        },
        maintenanceRequests: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            images: true,
            createdAt: true,
            updatedAt: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!contract) {
      throw new Error('Contract not found');
    }

    // Verify contract belongs to this tenant
    if (contract.tenantId !== tenant.id) {
      throw new Error('Access denied: This contract does not belong to you');
    }

    // Add calculated fields
    const today = new Date();
    const end = new Date(contract.endDate);
    const diffTime = end - today;
    const daysUntilExpiration = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      ...contract,
      daysUntilExpiration,
      isActive: end >= today
    };
  }
}

module.exports = new TenantPortalService();
