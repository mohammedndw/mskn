const { prisma } = require('../config/database');

class EstateService {
  // Get all estates
  async getAllEstates(filters = {}, userRole, userId) {
    const { search, region, city } = filters;

    const where = {};

    // If user is PROPERTY_MANAGER, only show estates they manage
    if (userRole === 'PROPERTY_MANAGER') {
      where.managerId = userId;
    }

    // Apply search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Apply region filter
    if (region) {
      where.region = { contains: region, mode: 'insensitive' };
    }

    // Apply city filter
    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }

    const estates = await prisma.estate.findMany({
      where,
      include: {
        properties: {
          select: {
            id: true,
            name: true,
            status: true
          }
        },
        _count: {
          select: { properties: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return estates;
  }

  // Get estate by ID
  async getEstateById(id, userRole, userId) {
    const estate = await prisma.estate.findUnique({
      where: { id },
      include: {
        properties: {
          include: {
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
        _count: {
          select: { properties: true }
        }
      }
    });

    if (!estate) {
      throw new Error('Estate not found');
    }

    // If user is PROPERTY_MANAGER, verify they manage this estate
    if (userRole === 'PROPERTY_MANAGER' && estate.managerId !== userId) {
      throw new Error('Access denied: You can only view estates you manage');
    }

    return estate;
  }

  // Create estate
  async createEstate(data, userRole, userId) {
    // If user is PROPERTY_MANAGER, automatically set them as manager
    const createData = {
      ...data,
      managerId: userRole === 'PROPERTY_MANAGER' ? userId : null
    };

    const estate = await prisma.estate.create({
      data: createData,
      include: {
        _count: {
          select: { properties: true }
        }
      }
    });

    return estate;
  }

  // Update estate
  async updateEstate(id, data, userRole, userId) {
    // Check if estate exists and user has access
    await this.getEstateById(id, userRole, userId);

    const estate = await prisma.estate.update({
      where: { id },
      data,
      include: {
        properties: {
          select: {
            id: true,
            name: true,
            status: true
          }
        },
        _count: {
          select: { properties: true }
        }
      }
    });

    return estate;
  }

  // Delete estate
  async deleteEstate(id, userRole, userId) {
    // Check if estate exists and user has access
    const estate = await this.getEstateById(id, userRole, userId);

    // Check if estate has properties
    if (estate._count.properties > 0) {
      throw new Error('Cannot delete estate with existing properties. Please delete or reassign properties first.');
    }

    await prisma.estate.delete({
      where: { id }
    });

    return { message: 'Estate deleted successfully' };
  }

  // Get estate statistics
  async getEstateStats(id, userRole, userId) {
    const estate = await this.getEstateById(id, userRole, userId);

    const stats = {
      totalProperties: estate._count.properties,
      availableProperties: estate.properties.filter(p => p.status === 'AVAILABLE').length,
      reservedProperties: estate.properties.filter(p => p.status === 'RESERVED').length,
      rentedProperties: estate.properties.filter(p => p.status === 'RENTED').length
    };

    return stats;
  }
}

module.exports = new EstateService();
