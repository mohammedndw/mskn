# Phase 1 - Authentication & Users - Testing Guide

## What's New in Phase 1

✅ User Signup (Property Manager & Property Owner)
✅ User Login with JWT
✅ Password hashing with bcrypt
✅ Role-Based Access Control (RBAC)
✅ Blocked user prevention
✅ Admin user creation
✅ User management (Admin only)
✅ JWT authentication middleware
✅ Input validation with Zod

---

## Prerequisites

1. Server running: `npm run dev`
2. Database connected and migrated
3. PostgreSQL running

---

## Testing Flow

### Step 1: Create Admin User (Directly in Database)

Since only admins can create users, and signup is only for PM/Owner, we need to create the first admin manually.

```bash
npx prisma studio
```

Or via SQL:
```sql
-- First, hash a password using Node.js
-- Run this in Node.js console:
-- const bcrypt = require('bcrypt');
-- bcrypt.hash('Admin@123', 10).then(hash => console.log(hash));

INSERT INTO "User" (id, email, password, "firstName", "lastName", phone, "nationalId", role, "isBlocked", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'admin@propmanage.com',
  '$2b$10$YourHashedPasswordHere',
  'Admin',
  'User',
  '1234567890',
  'ADMIN001',
  'ADMIN',
  false,
  NOW(),
  NOW()
);
```

**Easier way - Create admin via script:**

Create a file `scripts/createAdmin.js`:
```javascript
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createAdmin() {
  const hashedPassword = await bcrypt.hash('Admin@123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@propmanage.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      phone: '1234567890',
      nationalId: 'ADMIN001',
      role: 'ADMIN'
    }
  });

  console.log('Admin created:', admin);
  await prisma.$disconnect();
}

createAdmin();
```

Run: `node scripts/createAdmin.js`

---

## API Tests

### 1. User Signup (Property Manager)

**Endpoint:** `POST /api/auth/signup`

**cURL:**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@test.com",
    "password": "Manager@123",
    "firstName": "John",
    "lastName": "Manager",
    "phone": "1234567890",
    "nationalId": "PM001",
    "role": "PROPERTY_MANAGER"
  }'
```

**Expected Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "manager@test.com",
      "firstName": "John",
      "lastName": "Manager",
      "phone": "1234567890",
      "nationalId": "PM001",
      "role": "PROPERTY_MANAGER",
      "isBlocked": false,
      "createdAt": "2025-11-22T..."
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User registered successfully"
}
```

---

### 2. User Signup (Property Owner)

**cURL:**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@test.com",
    "password": "Owner@123",
    "firstName": "Jane",
    "lastName": "Owner",
    "phone": "0987654321",
    "nationalId": "PO001",
    "role": "PROPERTY_OWNER"
  }'
```

**Expected Response (201):** Similar to above

---

### 3. User Login

**Endpoint:** `POST /api/auth/login`

**cURL:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@propmanage.com",
    "password": "Admin@123"
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "admin@propmanage.com",
      "firstName": "Admin",
      "lastName": "User",
      "phone": "1234567890",
      "nationalId": "ADMIN001",
      "role": "ADMIN",
      "isBlocked": false,
      "createdAt": "2025-11-22T..."
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

**Save this token for subsequent requests!**

---

### 4. Get Current User Profile

**Endpoint:** `GET /api/auth/profile`

**cURL:**
```bash
curl http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "email": "admin@propmanage.com",
    "firstName": "Admin",
    "lastName": "User",
    "phone": "1234567890",
    "nationalId": "ADMIN001",
    "role": "ADMIN",
    "isBlocked": false,
    "createdAt": "2025-11-22T...",
    "updatedAt": "2025-11-22T..."
  },
  "message": "Profile retrieved successfully"
}
```

---

### 5. Get All Users (Admin Only)

**Endpoint:** `GET /api/users`

**cURL:**
```bash
curl http://localhost:5000/api/users \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

**With filters:**
```bash
# Filter by role
curl http://localhost:5000/api/users?role=PROPERTY_MANAGER \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"

# Filter by blocked status
curl http://localhost:5000/api/users?isBlocked=true \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-1",
      "email": "admin@propmanage.com",
      "firstName": "Admin",
      "lastName": "User",
      "phone": "1234567890",
      "nationalId": "ADMIN001",
      "role": "ADMIN",
      "isBlocked": false,
      "createdAt": "2025-11-22T...",
      "updatedAt": "2025-11-22T..."
    },
    {
      "id": "uuid-2",
      "email": "manager@test.com",
      "firstName": "John",
      "lastName": "Manager",
      "phone": "1234567890",
      "nationalId": "PM001",
      "role": "PROPERTY_MANAGER",
      "isBlocked": false,
      "createdAt": "2025-11-22T...",
      "updatedAt": "2025-11-22T..."
    }
  ],
  "message": "Users retrieved successfully"
}
```

---

### 6. Get User by ID (Admin Only)

**Endpoint:** `GET /api/users/:id`

**cURL:**
```bash
curl http://localhost:5000/api/users/USER_UUID_HERE \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "email": "manager@test.com",
    "firstName": "John",
    "lastName": "Manager",
    "phone": "1234567890",
    "nationalId": "PM001",
    "role": "PROPERTY_MANAGER",
    "isBlocked": false,
    "createdAt": "2025-11-22T...",
    "updatedAt": "2025-11-22T...",
    "subscription": null
  },
  "message": "User retrieved successfully"
}
```

---

### 7. Create User (Admin Only)

**Endpoint:** `POST /api/users`

**cURL:**
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@test.com",
    "password": "NewUser@123",
    "firstName": "New",
    "lastName": "User",
    "phone": "1122334455",
    "nationalId": "NU001",
    "role": "PROPERTY_MANAGER"
  }'
```

**Expected Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "email": "newuser@test.com",
    "firstName": "New",
    "lastName": "User",
    "phone": "1122334455",
    "nationalId": "NU001",
    "role": "PROPERTY_MANAGER",
    "isBlocked": false,
    "createdAt": "2025-11-22T..."
  },
  "message": "User created successfully"
}
```

---

### 8. Update User (Admin Only)

**Endpoint:** `PUT /api/users/:id`

**cURL:**
```bash
curl -X PUT http://localhost:5000/api/users/USER_UUID_HERE \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Updated",
    "lastName": "Name",
    "phone": "9999999999"
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "email": "newuser@test.com",
    "firstName": "Updated",
    "lastName": "Name",
    "phone": "9999999999",
    "nationalId": "NU001",
    "role": "PROPERTY_MANAGER",
    "isBlocked": false,
    "createdAt": "2025-11-22T...",
    "updatedAt": "2025-11-22T..."
  },
  "message": "User updated successfully"
}
```

---

### 9. Change User Role (Admin Only)

**Endpoint:** `PATCH /api/users/:id/role`

**cURL:**
```bash
curl -X PATCH http://localhost:5000/api/users/USER_UUID_HERE/role \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "PROPERTY_OWNER"
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "email": "newuser@test.com",
    "firstName": "Updated",
    "lastName": "Name",
    "phone": "9999999999",
    "nationalId": "NU001",
    "role": "PROPERTY_OWNER",
    "isBlocked": false,
    "createdAt": "2025-11-22T...",
    "updatedAt": "2025-11-22T..."
  },
  "message": "User role updated successfully"
}
```

---

### 10. Block User (Admin Only)

**Endpoint:** `PATCH /api/users/:id/block`

**cURL:**
```bash
curl -X PATCH http://localhost:5000/api/users/USER_UUID_HERE/block \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "isBlocked": true
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "email": "newuser@test.com",
    "firstName": "Updated",
    "lastName": "Name",
    "phone": "9999999999",
    "nationalId": "NU001",
    "role": "PROPERTY_OWNER",
    "isBlocked": true,
    "createdAt": "2025-11-22T...",
    "updatedAt": "2025-11-22T..."
  },
  "message": "User blocked successfully"
}
```

---

### 11. Unblock User (Admin Only)

**cURL:**
```bash
curl -X PATCH http://localhost:5000/api/users/USER_UUID_HERE/block \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "isBlocked": false
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "isBlocked": false,
    ...
  },
  "message": "User unblocked successfully"
}
```

---

### 12. Delete User (Admin Only)

**Endpoint:** `DELETE /api/users/:id`

**cURL:**
```bash
curl -X DELETE http://localhost:5000/api/users/USER_UUID_HERE \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": null,
  "message": "User deleted successfully"
}
```

---

## Error Testing

### Test 1: Signup with Existing Email

**cURL:**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@test.com",
    "password": "Test@123",
    "firstName": "Test",
    "lastName": "User",
    "phone": "1234567890",
    "nationalId": "TU001",
    "role": "PROPERTY_MANAGER"
  }'
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "User with this email already exists"
}
```

---

### Test 2: Signup with Admin Role (Should Fail)

**cURL:**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "hacker@test.com",
    "password": "Test@123",
    "firstName": "Hacker",
    "lastName": "User",
    "phone": "1234567890",
    "nationalId": "HU001",
    "role": "ADMIN"
  }'
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "body.role",
      "message": "Role must be either PROPERTY_MANAGER or PROPERTY_OWNER"
    }
  ]
}
```

---

### Test 3: Login with Wrong Password

**cURL:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@propmanage.com",
    "password": "WrongPassword"
  }'
```

**Expected Response (401):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

### Test 4: Login as Blocked User

**First, block a user via admin, then try to login:**

**Expected Response (403):**
```json
{
  "success": false,
  "message": "Your account has been blocked. Please contact support."
}
```

---

### Test 5: Access Protected Route without Token

**cURL:**
```bash
curl http://localhost:5000/api/auth/profile
```

**Expected Response (401):**
```json
{
  "success": false,
  "message": "No token provided"
}
```

---

### Test 6: Access Admin Route as Non-Admin

**Login as Property Manager, then:**

**cURL:**
```bash
curl http://localhost:5000/api/users \
  -H "Authorization: Bearer MANAGER_TOKEN_HERE"
```

**Expected Response (403):**
```json
{
  "success": false,
  "message": "You do not have permission to perform this action"
}
```

---

### Test 7: Invalid Token

**cURL:**
```bash
curl http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer invalid.token.here"
```

**Expected Response (401):**
```json
{
  "success": false,
  "message": "Invalid token"
}
```

---

### Test 8: Validation Error - Weak Password

**cURL:**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "weak",
    "firstName": "Test",
    "lastName": "User",
    "phone": "1234567890",
    "nationalId": "TU002",
    "role": "PROPERTY_MANAGER"
  }'
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "body.password",
      "message": "Password must be at least 8 characters long"
    }
  ]
}
```

---

## Postman Collection

Create a collection with these requests and use environment variables:

**Environment Variables:**
- `baseUrl`: `http://localhost:5000/api`
- `adminToken`: (set after admin login)
- `managerToken`: (set after manager login)
- `ownerToken`: (set after owner login)

**Collection Structure:**
```
Property Management System
├── Auth
│   ├── Signup (PM)
│   ├── Signup (Owner)
│   ├── Login
│   └── Get Profile
├── Users (Admin)
│   ├── Get All Users
│   ├── Get User by ID
│   ├── Create User
│   ├── Update User
│   ├── Change Role
│   ├── Block User
│   ├── Unblock User
│   └── Delete User
└── Error Cases
    ├── Duplicate Email
    ├── Wrong Password
    ├── Invalid Token
    └── Unauthorized Access
```

---

## Testing Checklist ✅

Before moving to Phase 2, verify:

### Authentication
- [ ] Property Manager can signup
- [ ] Property Owner can signup
- [ ] Admin cannot signup (only via admin creation)
- [ ] Users can login with correct credentials
- [ ] Login fails with wrong password
- [ ] Token is returned on signup/login
- [ ] Profile endpoint works with valid token
- [ ] Profile endpoint fails without token

### Authorization
- [ ] Admin can access user management routes
- [ ] Non-admin cannot access user management routes
- [ ] Blocked users cannot login
- [ ] Token verification works correctly

### User Management (Admin)
- [ ] Admin can view all users
- [ ] Admin can view user by ID
- [ ] Admin can create new users (any role)
- [ ] Admin can update user details
- [ ] Admin can change user role
- [ ] Admin can block users
- [ ] Admin can unblock users
- [ ] Admin can delete users (except other admins)

### Validation
- [ ] Email format validation works
- [ ] Password strength validation works
- [ ] Required fields validation works
- [ ] Duplicate email prevention works
- [ ] Duplicate national ID prevention works
- [ ] Invalid UUID format rejected

### Security
- [ ] Passwords are hashed (not stored in plain text)
- [ ] Password is never returned in responses
- [ ] JWT tokens expire after configured time
- [ ] Blocked users cannot access system
- [ ] RBAC prevents unauthorized actions

---

## Quick Test Script

Save as `test-phase1.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:5000/api"

echo "=== Testing Phase 1 ==="

echo -e "\n1. Signup Property Manager..."
MANAGER_RESPONSE=$(curl -s -X POST $BASE_URL/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@test.com",
    "password": "Manager@123",
    "firstName": "John",
    "lastName": "Manager",
    "phone": "1234567890",
    "nationalId": "PM001",
    "role": "PROPERTY_MANAGER"
  }')
echo $MANAGER_RESPONSE | jq .

MANAGER_TOKEN=$(echo $MANAGER_RESPONSE | jq -r '.data.token')

echo -e "\n2. Signup Property Owner..."
curl -s -X POST $BASE_URL/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@test.com",
    "password": "Owner@123",
    "firstName": "Jane",
    "lastName": "Owner",
    "phone": "0987654321",
    "nationalId": "PO001",
    "role": "PROPERTY_OWNER"
  }' | jq .

echo -e "\n3. Login as Admin..."
ADMIN_RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@propmanage.com",
    "password": "Admin@123"
  }')
echo $ADMIN_RESPONSE | jq .

ADMIN_TOKEN=$(echo $ADMIN_RESPONSE | jq -r '.data.token')

echo -e "\n4. Get Profile..."
curl -s $BASE_URL/auth/profile \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .

echo -e "\n5. Get All Users (Admin)..."
curl -s $BASE_URL/users \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .

echo -e "\n6. Test RBAC - Manager tries to access admin route..."
curl -s $BASE_URL/users \
  -H "Authorization: Bearer $MANAGER_TOKEN" | jq .

echo -e "\n=== Phase 1 Tests Complete ==="
```

Run: `chmod +x test-phase1.sh && ./test-phase1.sh`

---

**Phase 1 Complete!** Once all tests pass, you're ready for **Phase 2: Admin Dashboard & Subscriptions**.
