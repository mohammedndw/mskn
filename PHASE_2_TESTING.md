# PHASE 2 - Admin Module Testing Guide

## Prerequisites

### 1. Setup PostgreSQL Database
```bash
# Install PostgreSQL if not already installed
# Update .env file with your database connection string
DATABASE_URL="postgresql://username:password@localhost:5432/property_management?schema=public"
```

### 2. Run Prisma Migrations
```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Open Prisma Studio to view data
npm run prisma:studio
```

### 3. Start the Server
```bash
npm run dev
```

Server will run on `http://localhost:5000`

---

## Phase 2 API Endpoints

### 1. DASHBOARD ENDPOINTS

#### Get Dashboard (Role-based)
Returns dashboard data based on authenticated user's role.

**Endpoint:** `GET /api/dashboard`
**Auth:** Required (Any authenticated user)
**Role:** ADMIN | PROPERTY_MANAGER | PROPERTY_OWNER

**Example:**
```bash
curl -X GET http://localhost:5000/api/dashboard \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (Admin):**
```json
{
  "success": true,
  "data": {
    "totalUsers": 25,
    "totalProperties": 150,
    "totalContracts": 89,
    "activeSubscriptions": 20,
    "totalRevenue": 125000,
    "recentUsers": [...],
    "recentContracts": [...],
    "maintenanceRequests": {
      "pending": 5,
      "inProgress": 3,
      "completed": 45
    }
  },
  "message": "Dashboard data retrieved successfully"
}
```

---

### 2. SUBSCRIPTION PLAN ENDPOINTS (Admin Only)

#### Get All Subscription Plans
**Endpoint:** `GET /api/subscription-plans`
**Auth:** Required (ADMIN)

```bash
curl -X GET http://localhost:5000/api/subscription-plans \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

#### Get Single Subscription Plan
**Endpoint:** `GET /api/subscription-plans/:id`
**Auth:** Required (ADMIN)

```bash
curl -X GET http://localhost:5000/api/subscription-plans/PLAN_UUID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

#### Create Subscription Plan
**Endpoint:** `POST /api/subscription-plans`
**Auth:** Required (ADMIN)

```bash
curl -X POST http://localhost:5000/api/subscription-plans \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Professional Plan",
    "description": "For property managers with up to 100 properties",
    "price": 99.99,
    "durationInDays": 30,
    "features": {
      "maxProperties": 100,
      "maxUsers": 5,
      "support": "email"
    },
    "isActive": true
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "name": "Professional Plan",
    "description": "For property managers with up to 100 properties",
    "price": 99.99,
    "durationInDays": 30,
    "features": {
      "maxProperties": 100,
      "maxUsers": 5,
      "support": "email"
    },
    "isActive": true,
    "createdAt": "2025-11-23T12:00:00.000Z",
    "updatedAt": "2025-11-23T12:00:00.000Z"
  },
  "message": "Subscription plan created successfully"
}
```

#### Update Subscription Plan
**Endpoint:** `PUT /api/subscription-plans/:id`
**Auth:** Required (ADMIN)

```bash
curl -X PUT http://localhost:5000/api/subscription-plans/PLAN_UUID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 89.99,
    "durationInDays": 30
  }'
```

#### Delete Subscription Plan
**Endpoint:** `DELETE /api/subscription-plans/:id`
**Auth:** Required (ADMIN)

```bash
curl -X DELETE http://localhost:5000/api/subscription-plans/PLAN_UUID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

#### Toggle Plan Active Status
**Endpoint:** `PATCH /api/subscription-plans/:id/toggle`
**Auth:** Required (ADMIN)

```bash
curl -X PATCH http://localhost:5000/api/subscription-plans/PLAN_UUID/toggle \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

### 3. USER SUBSCRIPTION ENDPOINTS (Admin Only)

#### Get All User Subscriptions
**Endpoint:** `GET /api/user-subscriptions`
**Auth:** Required (ADMIN)

```bash
curl -X GET http://localhost:5000/api/user-subscriptions \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": "user-uuid",
      "planId": "plan-uuid",
      "startDate": "2025-11-01T00:00:00.000Z",
      "endDate": "2025-12-01T00:00:00.000Z",
      "isActive": true,
      "user": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com"
      },
      "plan": {
        "name": "Professional Plan",
        "price": 99.99
      }
    }
  ],
  "message": "User subscriptions retrieved successfully"
}
```

#### Get User Subscription by User ID
**Endpoint:** `GET /api/user-subscriptions/:userId`
**Auth:** Required (ADMIN)

```bash
curl -X GET http://localhost:5000/api/user-subscriptions/USER_UUID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

#### Assign Subscription to User
**Endpoint:** `POST /api/user-subscriptions`
**Auth:** Required (ADMIN)

```bash
curl -X POST http://localhost:5000/api/user-subscriptions \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_UUID",
    "planId": "PLAN_UUID",
    "startDate": "2025-11-23T00:00:00.000Z"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "subscription-uuid",
    "userId": "user-uuid",
    "planId": "plan-uuid",
    "startDate": "2025-11-23T00:00:00.000Z",
    "endDate": "2025-12-23T00:00:00.000Z",
    "isActive": true,
    "createdAt": "2025-11-23T12:00:00.000Z",
    "updatedAt": "2025-11-23T12:00:00.000Z"
  },
  "message": "Subscription assigned successfully"
}
```

#### Update User Subscription
**Endpoint:** `PUT /api/user-subscriptions/:userId`
**Auth:** Required (ADMIN)

```bash
curl -X PUT http://localhost:5000/api/user-subscriptions/USER_UUID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "endDate": "2025-12-31T00:00:00.000Z",
    "isActive": true
  }'
```

#### Remove User Subscription
**Endpoint:** `DELETE /api/user-subscriptions/:userId`
**Auth:** Required (ADMIN)

```bash
curl -X DELETE http://localhost:5000/api/user-subscriptions/USER_UUID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

#### Toggle Subscription Status
**Endpoint:** `PATCH /api/user-subscriptions/:userId/toggle`
**Auth:** Required (ADMIN)

```bash
curl -X PATCH http://localhost:5000/api/user-subscriptions/USER_UUID/toggle \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "isActive": false
  }'
```

#### Renew Subscription
**Endpoint:** `PATCH /api/user-subscriptions/:userId/renew`
**Auth:** Required (ADMIN)

```bash
curl -X PATCH http://localhost:5000/api/user-subscriptions/USER_UUID/renew \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "extensionDays": 30
  }'
```

---

### 4. USER MANAGEMENT ENDPOINTS (From Phase 1 - Admin Only)

#### Get All Users
**Endpoint:** `GET /api/users`
**Auth:** Required (ADMIN)

```bash
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

#### Get User by ID
**Endpoint:** `GET /api/users/:id`
**Auth:** Required (ADMIN)

```bash
curl -X GET http://localhost:5000/api/users/USER_UUID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

#### Create User (Admin creates user)
**Endpoint:** `POST /api/users`
**Auth:** Required (ADMIN)

```bash
curl -X POST http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "SecurePass123!",
    "firstName": "Jane",
    "lastName": "Smith",
    "phone": "+1234567890",
    "nationalId": "1234567890",
    "role": "PROPERTY_MANAGER"
  }'
```

#### Update User
**Endpoint:** `PUT /api/users/:id`
**Auth:** Required (ADMIN)

```bash
curl -X PUT http://localhost:5000/api/users/USER_UUID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane Updated",
    "role": "PROPERTY_OWNER"
  }'
```

#### Delete User
**Endpoint:** `DELETE /api/users/:id`
**Auth:** Required (ADMIN)

```bash
curl -X DELETE http://localhost:5000/api/users/USER_UUID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

#### Block/Unblock User
**Endpoint:** `PATCH /api/users/:id/block`
**Auth:** Required (ADMIN)

```bash
# Block user
curl -X PATCH http://localhost:5000/api/users/USER_UUID/block \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "isBlocked": true
  }'

# Unblock user
curl -X PATCH http://localhost:5000/api/users/USER_UUID/block \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "isBlocked": false
  }'
```

---

## Testing Workflow

### Step 1: Create Admin User
First, you need to create an admin user manually via Prisma Studio or direct database access:

```bash
npm run prisma:studio
```

Or use the signup endpoint and manually change the role in the database.

### Step 2: Login as Admin
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "your-password"
  }'
```

Save the JWT token from the response.

### Step 3: Test Dashboard
```bash
curl -X GET http://localhost:5000/api/dashboard \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Step 4: Create a Subscription Plan
```bash
curl -X POST http://localhost:5000/api/subscription-plans \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Basic Plan",
    "description": "Basic plan for small property managers",
    "price": 49.99,
    "durationInDays": 30,
    "features": {
      "maxProperties": 10,
      "support": "email"
    }
  }'
```

### Step 5: Create a Property Manager User
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Manager",
    "phone": "+1234567890",
    "nationalId": "9876543210",
    "role": "PROPERTY_MANAGER"
  }'
```

### Step 6: Assign Subscription to User
```bash
curl -X POST http://localhost:5000/api/user-subscriptions \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_UUID_FROM_STEP_5",
    "planId": "PLAN_UUID_FROM_STEP_4"
  }'
```

---

## Error Responses

All endpoints follow a consistent error format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## PHASE 2 COMPLETE ✓

All Admin Module functionalities are now implemented:
- ✓ Dashboard (role-based)
- ✓ User management (CRUD + block/unblock)
- ✓ Subscription plan management (CRUD + toggle status)
- ✓ User subscription management (assign, update, remove, renew, toggle)

**Next Phase:** Phase 3 - Estates & Properties
