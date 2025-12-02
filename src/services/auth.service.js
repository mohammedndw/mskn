const { prisma } = require('../config/database');
const PasswordUtil = require('../utils/password');
const JWTUtil = require('../utils/jwt');
const { AppError } = require('../middlewares/errorHandler');

class AuthService {
  // Signup for Property Manager and Property Owner
  async signup(userData) {
    const { email, password, firstName, lastName, phone, nationalId, role } = userData;

    // Check if role is allowed for signup
    if (role !== 'PROPERTY_MANAGER' && role !== 'PROPERTY_OWNER') {
      throw new AppError('Only PROPERTY_MANAGER and PROPERTY_OWNER can signup', 400);
    }

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

    // Generate JWT token
    const token = JWTUtil.generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    return { user, token };
  }

  // Login
  async login(credentials) {
    const { email, password } = credentials;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
        phone: true,
        nationalId: true,
        role: true,
        isBlocked: true,
        createdAt: true
      }
    });

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Check if user is blocked
    if (user.isBlocked) {
      throw new AppError('Your account has been blocked. Please contact support.', 403);
    }

    // Verify password
    const isPasswordValid = await PasswordUtil.compare(password, user.password);

    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    // Generate JWT token
    const token = JWTUtil.generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    return { user: userWithoutPassword, token };
  }

  // Get current user profile
  async getProfile(userId) {
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
        updatedAt: true
      }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  // Owner Login by National ID only
  async ownerLogin(nationalId) {
    // Find user by national ID
    const user = await prisma.user.findUnique({
      where: { nationalId },
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

    if (!user) {
      throw new AppError('No account found with this National ID', 401);
    }

    // Check if user is a Property Owner
    if (user.role !== 'PROPERTY_OWNER') {
      throw new AppError('This login is only for Property Owners', 403);
    }

    // Check if user is blocked
    if (user.isBlocked) {
      throw new AppError('Your account has been blocked. Please contact support.', 403);
    }

    // Check if owner has any properties assigned
    const propertyCount = await prisma.property.count({
      where: { ownerId: user.id }
    });

    if (propertyCount === 0) {
      throw new AppError('You do not have any properties assigned to your account. Please contact the property manager.', 403);
    }

    // Generate JWT token
    const token = JWTUtil.generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    return { user, token, propertyCount };
  }
}

module.exports = new AuthService();
