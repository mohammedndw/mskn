const jwt = require('jsonwebtoken');
const config = require('../config/env');
const ApiResponse = require('../utils/response');

/**
 * Middleware to verify tenant portal token
 */
const verifyTenantPortalToken = (req, res, next) => {
  try {
    // Get token from header or query parameter
    let token = req.headers.authorization;

    if (token && token.startsWith('Bearer ')) {
      token = token.substring(7);
    } else if (req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return ApiResponse.error(res, 'Access token is required', 401);
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);

    // Verify it's a tenant portal token
    if (decoded.type !== 'TENANT_PORTAL') {
      return ApiResponse.error(res, 'Invalid token type', 401);
    }

    // Attach decoded data to request
    req.tenantPortal = {
      contractId: decoded.contractId,
      tenantNationalId: decoded.tenantNationalId
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return ApiResponse.error(res, 'Token has expired', 401);
    }
    if (error.name === 'JsonWebTokenError') {
      return ApiResponse.error(res, 'Invalid token', 401);
    }
    return ApiResponse.error(res, 'Token verification failed', 401);
  }
};

module.exports = { verifyTenantPortalToken };
