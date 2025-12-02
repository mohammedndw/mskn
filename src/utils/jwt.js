const jwt = require('jsonwebtoken');
const config = require('../config/env');

class JWTUtil {
  // Generate access token
  static generateToken(payload, expiresIn = config.jwt.expiresIn) {
    return jwt.sign(payload, config.jwt.secret, { expiresIn });
  }

  // Generate tenant portal token (longer expiration)
  static generateTenantPortalToken(payload) {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.tenantPortalExpiresIn
    });
  }

  // Verify token
  static verifyToken(token) {
    try {
      return jwt.verify(token, config.jwt.secret);
    } catch (error) {
      throw error;
    }
  }

  // Decode token without verification
  static decodeToken(token) {
    return jwt.decode(token);
  }
}

module.exports = JWTUtil;
