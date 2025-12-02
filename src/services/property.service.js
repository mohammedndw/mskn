const { prisma } = require ('../config/database');
const bcrypt = require('bcrypt');

class PropertyService {
  // Get all properties with filters
  async getAllProperties(filters = {}, userRole, userId) {
    const { status, estateId, ownerId, type, minArea, maxArea, minBedrooms, maxBedrooms } = filters;

    const where = {};

    // If user is PROPERTY_OWNER, only show their properties
    if (userRole === 'PROPERTY_OWNER') {
      where.ownerId = userId;
    }

    // If user is PROPERTY_MANAGER, only show properties they created/manage
    if (userRole === 'PROPERTY_MANAGER') {
      where.managerId = userId;
    }

    // Apply status filter
    if (status) {
      where.status = status;
    }

    // Apply estate filter
    if (estateId) {
      where.estateId = estateId;
    }

    // Apply owner filter (only for ADMIN)
    if (ownerId && userRole === 'ADMIN') {
      where.ownerId = ownerId;
    }

    // Apply type filter
    if (type) {
      where.type = { contains: type, mode: 'insensitive' };
    }

    // Apply area filters
    if (minArea || maxArea) {
      where.area = {};
      if (minArea) where.area.gte = parseFloat(minArea);
      if (maxArea) where.area.lte = parseFloat(maxArea);
    }

    // Apply bedrooms filters
    if (minBedrooms || maxBedrooms) {
      where.bedrooms = {};
      if (minBedrooms) where.bedrooms.gte = parseInt(minBedrooms);
      if (maxBedrooms) where.bedrooms.lte = parseInt(maxBedrooms);
    }

    const properties = await prisma.property.findMany({
      where,
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
        },
        contracts: {
          where: {
            endDate: { gte: new Date() }
          },
          select: {
            id: true,
            startDate: true,
            endDate: true,
            tenant: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return properties;
  }

  // Get property by ID
  async getPropertyById(id, userRole, userId) {
    const property = await prisma.property.findUnique({
      where: { id },
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
        },
        contracts: {
          include: {
            tenant: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!property) {
      throw new Error('Property not found');
    }

    // If user is PROPERTY_OWNER, verify they own this property
    if (userRole === 'PROPERTY_OWNER' && property.ownerId !== userId) {
      throw new Error('Access denied: You can only view your own properties');
    }

    // If user is PROPERTY_MANAGER, verify they manage this property
    if (userRole === 'PROPERTY_MANAGER' && property.managerId !== userId) {
      throw new Error('Access denied: You can only view properties you manage');
    }

    return property;
  }

  // Create property
  async createProperty(data, userRole, userId) {
    // Verify estate exists if provided
    let estate = null;
    if (data.estateId) {
      estate = await prisma.estate.findUnique({
        where: { id: data.estateId }
      });

      if (!estate) {
        throw new Error('Estate not found');
      }

      // If user is PROPERTY_MANAGER, verify the estate belongs to them
      if (userRole === 'PROPERTY_MANAGER' && estate.managerId !== userId) {
        throw new Error('Access denied: You can only create properties in estates you manage');
      }
    }

    // Find or create owner by nationalId
    let ownerId = null;

    // Check if owner exists by national ID
    let existingOwner = await prisma.user.findUnique({
      where: { nationalId: data.ownerNationalId }
    });

    if (existingOwner) {
      // Owner exists - verify role and use their ID
      if (existingOwner.role !== 'PROPERTY_OWNER') {
        throw new Error('User with this National ID exists but is not a PROPERTY_OWNER');
      }
      ownerId = existingOwner.id;
    } else {
      // Owner doesn't exist - create new owner

      // Generate email if not provided (use nationalId@owner.local as placeholder)
      const ownerEmail = data.ownerEmail || `owner_${data.ownerNationalId}@property.local`;

      // Check if email already exists
      const emailExists = await prisma.user.findUnique({
        where: { email: ownerEmail }
      });
      if (emailExists) {
        throw new Error('Email already exists for another user');
      }

      // Generate default password (nationalId + first 3 chars of phone)
      const defaultPassword = data.ownerNationalId + data.ownerPhone.slice(0, 3);
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      // Create new owner
      const newOwner = await prisma.user.create({
        data: {
          nationalId: data.ownerNationalId,
          firstName: data.ownerFirstName,
          lastName: data.ownerLastName,
          phone: data.ownerPhone,
          email: ownerEmail,
          password: hashedPassword,
          role: 'PROPERTY_OWNER',
          isBlocked: false
        }
      });
      ownerId = newOwner.id;
    }

    // Prepare data for creation (remove owner fields, keep only property fields)
    const createData = {
      estateId: data.estateId,
      ownerId: ownerId,
      managerId: userRole === 'PROPERTY_MANAGER' ? userId : null,
      name: data.name,
      type: data.type,
    };

    // Add optional property fields
    if (data.description) createData.description = data.description;
    if (data.bedrooms !== undefined) createData.bedrooms = data.bedrooms;
    if (data.bathrooms !== undefined) createData.bathrooms = data.bathrooms;
    if (data.area !== undefined) createData.area = data.area;
    if (data.floor !== undefined) createData.floor = data.floor;
    if (data.imageUrl) createData.imageUrl = data.imageUrl;
    if (data.status) createData.status = data.status;

    // Add location fields (for standalone properties without parent estate)
    if (data.region) createData.region = data.region;
    if (data.city) createData.city = data.city;
    if (data.district) createData.district = data.district;
    if (data.street) createData.street = data.street;
    if (data.buildingNumber) createData.buildingNumber = data.buildingNumber;
    if (data.zipCode) createData.zipCode = data.zipCode;
    if (data.latitude !== undefined) createData.latitude = data.latitude;
    if (data.longitude !== undefined) createData.longitude = data.longitude;

    const property = await prisma.property.create({
      data: createData,
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
    });

    return property;
  }

  // Update property
  async updateProperty(id, data, userRole, userId) {
    // Check if property exists
    const existingProperty = await this.getPropertyById(id, userRole, userId);

    // Verify estate if changing
    if (data.estateId) {
      const estate = await prisma.estate.findUnique({
        where: { id: data.estateId }
      });

      if (!estate) {
        throw new Error('Estate not found');
      }
    }

    // Verify owner if changing
    if (data.ownerId) {
      const owner = await prisma.user.findUnique({
        where: { id: data.ownerId }
      });

      if (!owner) {
        throw new Error('Owner not found');
      }

      if (owner.role !== 'PROPERTY_OWNER') {
        throw new Error('Owner must have PROPERTY_OWNER role');
      }
    }

    // Property owners cannot change certain fields
    if (userRole === 'PROPERTY_OWNER') {
      delete data.ownerId;
      delete data.estateId;
    }

    const property = await prisma.property.update({
      where: { id },
      data,
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
    });

    return property;
  }

  // Delete property
  async deleteProperty(id, userRole, userId) {
    // Check if property exists and user has access
    const property = await this.getPropertyById(id, userRole, userId);

    // Check if property has active contracts
    const activeContracts = await prisma.contract.count({
      where: {
        propertyId: id,
        endDate: { gte: new Date() }
      }
    });

    if (activeContracts > 0) {
      throw new Error('Cannot delete property with active contracts');
    }

    // Property owners cannot delete properties
    if (userRole === 'PROPERTY_OWNER') {
      throw new Error('Property owners cannot delete properties. Please contact admin.');
    }

    await prisma.property.delete({
      where: { id }
    });

    return { message: 'Property deleted successfully' };
  }

  // Update property status
  async updatePropertyStatus(id, status, userRole, userId) {
    // Only ADMIN and PROPERTY_MANAGER can update status
    if (userRole === 'PROPERTY_OWNER') {
      throw new Error('Property owners cannot change property status');
    }

    const property = await prisma.property.update({
      where: { id },
      data: { status },
      include: {
        estate: {
          select: {
            id: true,
            name: true
          }
        },
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    return property;
  }
}

module.exports = new PropertyService();
