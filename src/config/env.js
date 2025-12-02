require('dotenv').config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  databaseUrl: process.env.DATABASE_URL,
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    tenantPortalExpiresIn: process.env.TENANT_PORTAL_TOKEN_EXPIRES_IN || '30d'
  },
  // Direct access for backward compatibility
  jwtSecret: process.env.JWT_SECRET,
  tenantPortalTokenExpiresIn: process.env.TENANT_PORTAL_TOKEN_EXPIRES_IN || '30d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000'
};

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

module.exports = config;
