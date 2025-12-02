const { prisma } = require('../config/database');
const PasswordUtil = require('../utils/password');
const { AppError } = require('../middlewares/errorHandler');

class UserService {
  // Get all users (admin only)
  async getAllUsers(filters = {}) {
    const { role, isBlocked } = filters;

    const where = {};
    if (role) where.role = role;
    if (isBlocked !== undefined) where.isBlocked = isBlocked === 'true';

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        nationalId: true,
        role: true,
        isBlocked: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return users;
  }

  // Get user by ID (admin only)
  async getUserById(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        nationalId: true,
        role: true,
        isBlocked: true,
        createdAt: true,
        updatedAt: true,
        subscription: {
          include: {
            plan: true
          }
        }
      }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  // Create user (admin only)
  async createUser(userData) {
    const { email, password, firstName, lastName, phone, nationalId, role } = userData;

    // Check if user with email already exists
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUserByEmail) {
      throw new AppError('User with this email already exists', 400);
    }

    // Check if user with national ID already exists
    const existingUserByNationalId = await prisma.user.findUnique({
      where: { nationalId }
    });

    if (existingUserByNationalId) {
      throw new AppError('User with this national ID already exists', 400);
    }

    // Hash password
    const hashedPassword = await PasswordUtil.hash(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        nationalId,
        role
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        nationalId: true,
        role: true,
        isBlocked: true,
        createdAt: true
      }
    });

    return user;
  }

  // Update user (admin only)
  async updateUser(userId, updateData) {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      throw new AppError('User not found', 404);
    }

    // If email is being updated, check uniqueness
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: updateData.email }
      });

      if (emailExists) {
        throw new AppError('Email already in use', 400);
      }
    }

    // If national ID is being updated, check uniqueness
    if (updateData.nationalId && updateData.nationalId !== existingUser.nationalId) {
      const nationalIdExists = await prisma.user.findUnique({
        where: { nationalId: updateData.nationalId }
      });

      if (nationalIdExists) {
        throw new AppError('National ID already in use', 400);
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        nationalId: true,
        role: true,
        isBlocked: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return updatedUser;
  }

  // Change user role (admin only)
  async changeUserRole(userId, newRole) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        nationalId: true,
        role: true,
        isBlocked: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return updatedUser;
  }

  // Block/Unblock user (admin only)
  async toggleBlockUser(userId, isBlocked) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Prevent admin from blocking themselves
    if (user.role === 'ADMIN' && isBlocked) {
      throw new AppError('Cannot block admin users', 400);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isBlocked },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        nationalId: true,
        role: true,
        isBlocked: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return updatedUser;
  }

  // Delete user (admin only)
  async deleteUser(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Prevent admin from deleting themselves
    if (user.role === 'ADMIN') {
      throw new AppError('Cannot delete admin users', 400);
    }

    await prisma.user.delete({
      where: { id: userId }
    });

    return { message: 'User deleted successfully' };
  }
}

module.exports = new UserService();
