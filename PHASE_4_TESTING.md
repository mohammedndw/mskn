# PHASE 4 - Tenants Testing Guide

## Overview
This phase implements full tenant management with CRUD operations, advanced filtering, role-based access control, and validation.

---

## Validation Rules

All tenant operations enforce these validation rules:

- **firstName**: Minimum 2 characters
- **lastName**: Minimum 2 characters
- **email**: Valid email format
- **phone**: Must be in format `05XXXXXXXX` (10 digits starting with 05)
- **nationalId**: Exactly 10 digits, unique across all tenants
- **birthDate**: Must be in the past (before today)

---

## API Endpoints

### 1. TENANT ENDPOINTS

All tenant endpoints require authentication. Create/Update/Delete operations require ADMIN or PROPERTY_MANAGER role.

#### Get All Tenants (with Filters)
**Endpoint:** `GET /api/tenants`
**Auth:** Required (All authenticated users)
**Query Parameters:**
- `search` (optional) - Search in firstName, lastName, email, phone, or nationalId
- `email` (optional) - Filter by email
- `phone` (optional) - Filter by phone
- `nationalId` (optional) - Filter by national ID

**RBAC:**
- **ADMIN & PROPERTY_MANAGER**: See all tenants
- **PROPERTY_OWNER**: See only tenants renting their properties (active contracts only)

```bash
# Get all tenants
curl -X GET http://localhost:5000/api/tenants \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Search tenants
curl -X GET "http://localhost:5000/api/tenants?search=Ahmad" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Filter by phone
curl -X GET "http://localhost:5000/api/tenants?phone=0512345678" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "tenant-uuid",
      "firstName": "Ahmad",
      "lastName": "Al-Zahrani",
      "email": "ahmad@example.com",
      "phone": "0512345678",
      "nationalId": "1234567890",
      "birthDate": "1990-05-15T00:00:00.000Z",
      "createdAt": "2025-11-23T12:00:00.000Z",
      "updatedAt": "2025-11-23T12:00:00.000Z",
      "contracts": [
        {
          "id": "contract-uuid",
          "startDate": "2025-01-01T00:00:00.000Z",
          "endDate": "2026-01-01T00:00:00.000Z",
          "price": 30000,
          "property": {
            "id": "property-uuid",
            "name": "Apartment 101",
            "status": "RENTED",
            "estate": {
              "id": "estate-uuid",
              "name": "Al Nakheel Estate"
            }
          }
        }
      ],
      "_count": {
        "contracts": 1,
        "maintenanceRequests": 3
      }
    }
  ],
  "message": "Tenants retrieved successfully"
}
```

#### Get Tenant by ID
**Endpoint:** `GET /api/tenants/:id`
**Auth:** Required (All authenticated users)

**RBAC:**
- **ADMIN & PROPERTY_MANAGER**: Can view any tenant
- **PROPERTY_OWNER**: Can only view tenants with active contracts on their properties

```bash
curl -X GET http://localhost:5000/api/tenants/TENANT_UUID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "tenant-uuid",
    "firstName": "Ahmad",
    "lastName": "Al-Zahrani",
    "email": "ahmad@example.com",
    "phone": "0512345678",
    "nationalId": "1234567890",
    "birthDate": "1990-05-15T00:00:00.000Z",
    "createdAt": "2025-11-23T12:00:00.000Z",
    "updatedAt": "2025-11-23T12:00:00.000Z",
    "contracts": [
      {
        "id": "contract-uuid",
        "propertyId": "property-uuid",
        "startDate": "2025-01-01T00:00:00.000Z",
        "endDate": "2026-01-01T00:00:00.000Z",
        "price": 30000,
        "paymentFrequency": "MONTHLY",
        "property": {
          "id": "property-uuid",
          "name": "Apartment 101",
          "type": "Apartment",
          "bedrooms": 3,
          "bathrooms": 2,
          "area": 150.5,
          "status": "RENTED",
          "estate": {
            "id": "estate-uuid",
            "name": "Al Nakheel Estate",
            "city": "Riyadh",
            "region": "Central"
          },
          "owner": {
            "id": "owner-uuid",
            "firstName": "Fahad",
            "lastName": "Al-Mansour",
            "email": "fahad@example.com",
            "phone": "0501234567"
          }
        }
      }
    ],
    "maintenanceRequests": [
      {
        "id": "maintenance-uuid",
        "title": "AC not working",
        "status": "PENDING",
        "createdAt": "2025-11-20T10:00:00.000Z"
      }
    ],
    "_count": {
      "contracts": 1,
      "maintenanceRequests": 3
    }
  },
  "message": "Tenant retrieved successfully"
}
```

#### Get Tenant Statistics
**Endpoint:** `GET /api/tenants/:id/stats`
**Auth:** Required (All authenticated users)

```bash
curl -X GET http://localhost:5000/api/tenants/TENANT_UUID/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalContracts": 3,
    "activeContracts": 1,
    "expiredContracts": 2,
    "totalMaintenanceRequests": 8,
    "pendingMaintenanceRequests": 2
  },
  "message": "Tenant statistics retrieved successfully"
}
```

#### Create Tenant
**Endpoint:** `POST /api/tenants`
**Auth:** Required (ADMIN or PROPERTY_MANAGER)

**Validation:**
- nationalId must be exactly 10 digits and unique
- email must be valid format and unique
- phone must be in format 05XXXXXXXX
- birthDate must be in the past

```bash
curl -X POST http://localhost:5000/api/tenants \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Ahmad",
    "lastName": "Al-Zahrani",
    "email": "ahmad@example.com",
    "phone": "0512345678",
    "nationalId": "1234567890",
    "birthDate": "1990-05-15T00:00:00.000Z"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "tenant-uuid",
    "firstName": "Ahmad",
    "lastName": "Al-Zahrani",
    "email": "ahmad@example.com",
    "phone": "0512345678",
    "nationalId": "1234567890",
    "birthDate": "1990-05-15T00:00:00.000Z",
    "createdAt": "2025-11-23T12:00:00.000Z",
    "updatedAt": "2025-11-23T12:00:00.000Z",
    "_count": {
      "contracts": 0,
      "maintenanceRequests": 0
    }
  },
  "message": "Tenant created successfully"
}
```

#### Update Tenant
**Endpoint:** `PUT /api/tenants/:id`
**Auth:** Required (ADMIN or PROPERTY_MANAGER)

**Validation:** Same as create, but all fields are optional

```bash
curl -X PUT http://localhost:5000/api/tenants/TENANT_UUID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "0598765432",
    "email": "ahmad.new@example.com"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "tenant-uuid",
    "firstName": "Ahmad",
    "lastName": "Al-Zahrani",
    "email": "ahmad.new@example.com",
    "phone": "0598765432",
    "nationalId": "1234567890",
    "birthDate": "1990-05-15T00:00:00.000Z",
    "createdAt": "2025-11-23T12:00:00.000Z",
    "updatedAt": "2025-11-23T13:00:00.000Z",
    "contracts": [],
    "_count": {
      "contracts": 0,
      "maintenanceRequests": 0
    }
  },
  "message": "Tenant updated successfully"
}
```

#### Delete Tenant
**Endpoint:** `DELETE /api/tenants/:id`
**Auth:** Required (ADMIN or PROPERTY_MANAGER)

**Business Rules:**
- Cannot delete tenant with active contracts
- Must end or delete all active contracts first

```bash
curl -X DELETE http://localhost:5000/api/tenants/TENANT_UUID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": null,
  "message": "Tenant deleted successfully"
}
```

---

## Testing Workflow

### Step 1: Create a Tenant (Property Manager)

```bash
# Login as Property Manager
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@example.com",
    "password": "your-password"
  }'

# Create tenant
curl -X POST http://localhost:5000/api/tenants \
  -H "Authorization: Bearer YOUR_PM_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Ahmad",
    "lastName": "Al-Zahrani",
    "email": "ahmad@example.com",
    "phone": "0512345678",
    "nationalId": "1234567890",
    "birthDate": "1990-05-15T00:00:00.000Z"
  }'
```

### Step 2: Test Validation Errors

```bash
# Invalid phone format (should fail)
curl -X POST http://localhost:5000/api/tenants \
  -H "Authorization: Bearer YOUR_PM_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "phone": "1234567890",
    "nationalId": "9876543210",
    "birthDate": "1995-01-01T00:00:00.000Z"
  }'

# Response:
# {
#   "success": false,
#   "message": "Phone must be in format 05XXXXXXXX (10 digits starting with 05)"
# }

# Invalid national ID (not 10 digits)
curl -X POST http://localhost:5000/api/tenants \
  -H "Authorization: Bearer YOUR_PM_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "phone": "0512345678",
    "nationalId": "123",
    "birthDate": "1995-01-01T00:00:00.000Z"
  }'

# Response:
# {
#   "success": false,
#   "message": "National ID must be exactly 10 digits"
# }

# Future birthDate (should fail)
curl -X POST http://localhost:5000/api/tenants \
  -H "Authorization: Bearer YOUR_PM_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "phone": "0512345678",
    "nationalId": "9876543210",
    "birthDate": "2030-01-01T00:00:00.000Z"
  }'

# Response:
# {
#   "success": false,
#   "message": "Birth date must be in the past"
# }

# Duplicate national ID (should fail)
curl -X POST http://localhost:5000/api/tenants \
  -H "Authorization: Bearer YOUR_PM_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Duplicate",
    "lastName": "Test",
    "email": "duplicate@example.com",
    "phone": "0598765432",
    "nationalId": "1234567890",
    "birthDate": "1992-01-01T00:00:00.000Z"
  }'

# Response:
# {
#   "success": false,
#   "message": "Tenant with this national ID already exists"
# }
```

### Step 3: View Tenants (All Roles)

```bash
# As Property Manager - see all tenants
curl -X GET http://localhost:5000/api/tenants \
  -H "Authorization: Bearer YOUR_PM_TOKEN"

# As Property Owner - see only tenants renting their properties
curl -X GET http://localhost:5000/api/tenants \
  -H "Authorization: Bearer YOUR_OWNER_TOKEN"
```

### Step 4: Search and Filter Tenants

```bash
# Search by name
curl -X GET "http://localhost:5000/api/tenants?search=Ahmad" \
  -H "Authorization: Bearer YOUR_PM_TOKEN"

# Filter by phone
curl -X GET "http://localhost:5000/api/tenants?phone=0512345678" \
  -H "Authorization: Bearer YOUR_PM_TOKEN"

# Filter by national ID
curl -X GET "http://localhost:5000/api/tenants?nationalId=1234567890" \
  -H "Authorization: Bearer YOUR_PM_TOKEN"
```

### Step 5: Update Tenant

```bash
curl -X PUT http://localhost:5000/api/tenants/TENANT_UUID \
  -H "Authorization: Bearer YOUR_PM_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "0598765432",
    "email": "ahmad.updated@example.com"
  }'
```

### Step 6: Test Delete Protection

```bash
# First, create a contract for the tenant (Phase 5)
# Then try to delete - should fail

curl -X DELETE http://localhost:5000/api/tenants/TENANT_UUID \
  -H "Authorization: Bearer YOUR_PM_TOKEN"

# Response:
# {
#   "success": false,
#   "message": "Cannot delete tenant with active contracts. Please end or delete contracts first."
# }
```

---

## Role-Based Access Control

### ADMIN & PROPERTY_MANAGER
- ✓ View all tenants
- ✓ Create tenants
- ✓ Update tenants
- ✓ Delete tenants (if no active contracts)
- ✓ Search and filter tenants
- ✓ View tenant statistics

### PROPERTY_OWNER
- ✓ View only tenants renting their properties (active contracts)
- ✓ View tenant details (if tenant rents their property)
- ✓ View tenant statistics (if tenant rents their property)
- ✗ Cannot create tenants
- ✗ Cannot update tenants
- ✗ Cannot delete tenants

---

## Business Rules Implemented

1. **Unique National ID**: Each tenant must have a unique 10-digit national ID
2. **Unique Email**: Email addresses must be unique across all tenants
3. **Phone Format**: Phone must be in Saudi format (05XXXXXXXX)
4. **Birth Date Validation**: Birth date must be in the past
5. **Delete Protection**: Cannot delete tenant with active contracts
6. **Owner Access Control**: Property owners can only see tenants renting their properties
7. **Active Contracts Only**: Property owners only see tenants with active (non-expired) contracts

---

## Error Handling

### Common Errors

**Tenant not found:**
```json
{
  "success": false,
  "message": "Tenant not found"
}
```

**Duplicate national ID:**
```json
{
  "success": false,
  "message": "Tenant with this national ID already exists"
}
```

**Duplicate email:**
```json
{
  "success": false,
  "message": "Tenant with this email already exists"
}
```

**Invalid phone format:**
```json
{
  "success": false,
  "message": "Phone must be in format 05XXXXXXXX (10 digits starting with 05)"
}
```

**Invalid national ID:**
```json
{
  "success": false,
  "message": "National ID must be exactly 10 digits"
}
```

**Future birth date:**
```json
{
  "success": false,
  "message": "Birth date must be in the past"
}
```

**Cannot delete tenant with contracts:**
```json
{
  "success": false,
  "message": "Cannot delete tenant with active contracts. Please end or delete contracts first."
}
```

**Property owner access denied:**
```json
{
  "success": false,
  "message": "Access denied: You can only view tenants renting your properties"
}
```

---

## Phone Number Format Examples

**Valid:**
- `0512345678`
- `0501234567`
- `0598765432`

**Invalid:**
- `1234567890` (doesn't start with 05)
- `05123456` (too short)
- `051234567890` (too long)
- `+966512345678` (includes country code)

---

## National ID Format Examples

**Valid:**
- `1234567890`
- `1111111111`
- `9999999999`

**Invalid:**
- `123` (too short)
- `12345678901` (too long)
- `12345-67890` (contains special characters)
- `ABCD123456` (contains letters)

---

## PHASE 4 COMPLETE ✓

All Tenant functionalities are now implemented:
- ✓ Full CRUD operations
- ✓ Advanced validation (nationalId, phone, email, birthDate)
- ✓ Role-based access control
- ✓ Property owner read-only access to their tenants
- ✓ Search and filter functionality
- ✓ Unique constraints (nationalId, email)
- ✓ Delete protection (active contracts)
- ✓ Tenant statistics

**Next Phase:** Phase 5 - Contracts + Tenant Portal
