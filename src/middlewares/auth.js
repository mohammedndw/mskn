const JWTUtil = require('../utils/jwt');
const { AppError } = require('./errorHandler');
const { prisma } = require('../config/database');
const asyncHandler = require('./asyncHandler');

// Authenticate user via JWT
const authenticate = asyncHandler(async (req, res, next) => {
  // Get token from header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('No token provided', 401);
  }

  const token = authHeader.split(' ')[1];

  // Verify token
  let decoded;
  try {
    decoded = JWTUtil.verifyToken(token);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Token expired', 401);
    }
    throw new AppError('Invalid token', 401);
  }

  // Check if user still exists
  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isBlocked: true
    }
  });

  if (!user) {
    throw new AppError('User no longer exists', 401);
  }

  // Check if user is blocked
  if (user.isBlocked) {
    throw new AppError('Your account has been blocked. Please contact support.', 403);
  }

  // Attach user to request
  req.user = user;
  next();
});

// Authorize based on roles
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError('You do not have permission to perform this action', 403);
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize
};
