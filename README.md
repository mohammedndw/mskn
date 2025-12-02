# Property Management System - Backend

A comprehensive Property Management System backend built with Node.js, Express, PostgreSQL, and Prisma.

## Phase 0 - Setup ✅

### Project Structure
```
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── config/
│   │   ├── database.js        # Prisma client setup
│   │   └── env.js             # Environment configuration
│   ├── middlewares/
│   │   ├── asyncHandler.js    # Async error wrapper
│   │   ├── auth.js            # Auth middleware (Phase 1)
│   │   ├── errorHandler.js    # Central error handler
│   │   └── validate.js        # Validation middleware
│   ├── routes/
│   │   └── index.js           # Main routes
│   ├── utils/
│   │   ├── logger.js          # Logging utility
│   │   └── response.js        # Response formatter
│   ├── app.js                 # Express app setup
│   └── server.js              # Server entry point
├── .env                       # Environment variables
├── .env.example               # Environment template
├── .gitignore                 # Git ignore rules
└── package.json               # Dependencies
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- **Supabase Account** (recommended) OR PostgreSQL (v12 or higher)
- npm or yarn

### Quick Start with Supabase (Recommended) ⚡

**See detailed guide:** [`QUICK_START_SUPABASE.md`](./QUICK_START_SUPABASE.md)

1. Create Supabase project at [supabase.com](https://supabase.com)
2. Get your database connection URL
3. Update `.env` with your Supabase URL:
   ```env
   DATABASE_URL="postgresql://postgres.xxxxx:[PASSWORD]@aws-0-xx.pooler.supabase.com:6543/postgres?pgbouncer=true"
   ```
4. Run setup commands:
   ```bash
   npm install
   npm run test:db          # Test connection
   npm run prisma:generate  # Generate Prisma client
   npm run prisma:migrate   # Create tables
   npm run seed:admin       # Create admin user
   npm run dev              # Start server
   ```

**Total setup time: ~15 minutes** 🚀

### Alternative: Local PostgreSQL Setup

<details>
<summary>Click to expand local PostgreSQL instructions</summary>

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment
1. Copy `.env.example` to `.env`
2. Update the database URL with your PostgreSQL credentials:
```
DATABASE_URL="postgresql://username:password@localhost:5432/property_management?schema=public"
```
3. Update JWT secret:
```
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### Step 3: Create Database
```bash
# Create PostgreSQL database
createdb property_management

# Or using psql
psql -U postgres -c "CREATE DATABASE property_management;"
```

### Step 4: Run Prisma Migrations
```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Optional: Open Prisma Studio
npm run prisma:studio
```

### Step 5: Start Server
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

</details>

## Testing Phase 0

### 1. Health Check
```bash
curl http://localhost:5000/api/health
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "data": {
    "uptime": 12.345,
    "timestamp": "2025-11-22T...",
    "environment": "development"
  }
}
```

### 2. API Info
```bash
curl http://localhost:5000/api
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Property Management System API",
  "data": {
    "version": "1.0.0",
    "endpoints": {
      "health": "/api/health",
      "auth": "/api/auth (Coming in Phase 1)",
      ...
    }
  }
}
```

### 3. Test 404 Handler
```bash
curl http://localhost:5000/api/nonexistent
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Route /api/nonexistent not found"
}
```

### 4. Test Rate Limiting
```bash
# Run this command multiple times quickly (>100 times in 15 minutes)
for i in {1..110}; do curl http://localhost:5000/api/health; done
```

**Expected Response (after 100 requests):**
```json
{
  "success": false,
  "message": "Too many requests from this IP, please try again later"
}
```

## Database Models

Phase 0 includes the complete database schema:

- **User** - Admin, Property Manager, Property Owner
- **SubscriptionPlan** - Subscription plans
- **UserSubscription** - User subscriptions
- **Estate** - Parent property groups
- **Property** - Individual properties
- **Tenant** - Tenant information
- **Contract** - Rental contracts
- **MaintenanceRequest** - Maintenance tickets
- **AuditLog** - System audit trail

## Useful Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with auto-reload |
| `npm start` | Start production server |
| `npm run test:db` | Test database connection |
| `npm run prisma:generate` | Generate Prisma Client |
| `npm run prisma:migrate` | Run database migrations |
| `npm run prisma:studio` | Open visual database editor |
| `npm run seed:admin` | Create admin user |

## Features Implemented

✅ Express server with security middleware (helmet, cors, rate limiting)
✅ Prisma ORM with PostgreSQL / Supabase
✅ Clean folder structure (Controllers/Services separation ready)
✅ Central error handler with detailed error responses
✅ Logging system
✅ Environment configuration with validation
✅ Async error handling wrapper
✅ Validation middleware (Zod ready)
✅ Unified response format
✅ Graceful shutdown handling
✅ Complete database schema
✅ Database connection testing script
✅ Admin user seeding script

## Next Phase

**Phase 1** will implement:
- User authentication (Signup/Login)
- JWT token generation
- Role-Based Access Control (RBAC)
- Password hashing with bcrypt
- User management endpoints

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Environment mode | development |
| PORT | Server port | 5000 |
| DATABASE_URL | PostgreSQL connection string | Required |
| JWT_SECRET | JWT signing secret | Required |
| JWT_EXPIRES_IN | JWT expiration time | 7d |
| TENANT_PORTAL_TOKEN_EXPIRES_IN | Tenant token expiration | 30d |
| CLIENT_URL | Frontend URL for CORS | http://localhost:3000 |

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
pg_isready

# Test connection
psql -U username -d property_management
```

### Prisma Issues
```bash
# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Regenerate Prisma client
npx prisma generate
```

### Port Already in Use
```bash
# Change PORT in .env file or kill process using port 5000
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill
```

## API Response Format

All API responses follow this format:

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Success message"
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error message",
  "errors": [ ... ]  // Optional validation errors
}
```

---

**Phase 0 Status:** ✅ Complete and Tested
