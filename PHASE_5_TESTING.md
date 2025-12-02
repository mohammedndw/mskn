# PHASE 5 - Contracts + Tenant Portal Testing Guide

## Overview
This phase implements contract management with document generation, tenant portal token-based access, and automatic property status updates.

---

## Payment Frequency Options

Contracts support two payment frequencies:
- **ONCE** - Full payment upfront
- **TWICE** - Payment in two installments

---

## API Endpoints

### 1. CONTRACT ENDPOINTS

All contract endpoints require authentication. Create/Update/Delete operations require ADMIN or PROPERTY_MANAGER role.

#### Get All Contracts (with Filters)
**Endpoint:** `GET /api/contracts`
**Auth:** Required (All authenticated users)
**Query Parameters:**
- `propertyId` (optional) - Filter by property
- `tenantId` (optional) - Filter by tenant
- `ownerId` (optional) - Filter by owner (Admin/PM only)
- `status` (optional) - Filter by status: `active`, `expired`, `all`

**RBAC:**
- **ADMIN & PROPERTY_MANAGER**: See all contracts
- **PROPERTY_OWNER**: See only contracts for their properties

```bash
# Get all contracts
curl -X GET http://localhost:5000/api/contracts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get active contracts only
curl -X GET "http://localhost:5000/api/contracts?status=active" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get contracts for a specific property
curl -X GET "http://localhost:5000/api/contracts?propertyId=PROPERTY_UUID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "contract-uuid",
      "propertyId": "property-uuid",
      "tenantId": "tenant-uuid",
      "price": 30000,
      "startDate": "2025-01-01T00:00:00.000Z",
      "endDate": "2026-01-01T00:00:00.000Z",
      "paymentFrequency": "ONCE",
      "documentUrl": "/uploads/documents/contract_uuid_timestamp.html",
      "tenantPortalToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "createdAt": "2025-11-23T12:00:00.000Z",
      "updatedAt": "2025-11-23T12:00:00.000Z",
      "property": {
        "id": "property-uuid",
        "name": "Apartment 101",
        "type": "Apartment",
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
      },
      "tenant": {
        "id": "tenant-uuid",
        "firstName": "Ahmad",
        "lastName": "Al-Zahrani",
        "email": "ahmad@example.com",
        "phone": "0512345678",
        "nationalId": "1234567890"
      },
      "_count": {
        "maintenanceRequests": 3
      },
      "daysUntilExpiration": 39,
      "isActive": true,
      "tenantPortalLink": "http://localhost:3000/tenant-portal/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  ],
  "message": "Contracts retrieved successfully"
}
```

#### Get Contract by ID
**Endpoint:** `GET /api/contracts/:id`
**Auth:** Required (All authenticated users)

**RBAC:**
- **ADMIN & PROPERTY_MANAGER**: Can view any contract
- **PROPERTY_OWNER**: Can only view contracts for their properties

```bash
curl -X GET http://localhost:5000/api/contracts/CONTRACT_UUID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Create Contract
**Endpoint:** `POST /api/contracts`
**Auth:** Required (ADMIN or PROPERTY_MANAGER)

**Automated Actions:**
1. Auto-links ownerId from property
2. Generates contract document (HTML)
3. Saves document URL
4. Generates tenant portal token
5. Updates property status to RENTED

**Validation:**
- Property must exist and be available
- Tenant must exist
- End date must be after start date
- Property cannot have another active contract

```bash
curl -X POST http://localhost:5000/api/contracts \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "propertyId": "PROPERTY_UUID",
    "tenantId": "TENANT_UUID",
    "price": 30000,
    "startDate": "2025-01-01T00:00:00.000Z",
    "endDate": "2026-01-01T00:00:00.000Z",
    "paymentFrequency": "ONCE"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "contract-uuid",
    "propertyId": "property-uuid",
    "tenantId": "tenant-uuid",
    "price": 30000,
    "startDate": "2025-01-01T00:00:00.000Z",
    "endDate": "2026-01-01T00:00:00.000Z",
    "paymentFrequency": "ONCE",
    "documentUrl": "/uploads/documents/contract_uuid_1732368000000.html",
    "tenantPortalToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "createdAt": "2025-11-23T12:00:00.000Z",
    "updatedAt": "2025-11-23T12:00:00.000Z",
    "property": { ... },
    "tenant": { ... },
    "daysUntilExpiration": 365,
    "isActive": true,
    "tenantPortalLink": "http://localhost:3000/tenant-portal/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Contract created successfully"
}
```

**After creation, the property status is automatically changed to RENTED.**

#### Update Contract
**Endpoint:** `PUT /api/contracts/:id`
**Auth:** Required (ADMIN or PROPERTY_MANAGER)

**Note:** If significant fields change (price, dates, payment frequency), the contract document is automatically regenerated.

```bash
curl -X PUT http://localhost:5000/api/contracts/CONTRACT_UUID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 32000,
    "endDate": "2026-06-01T00:00:00.000Z"
  }'
```

#### Delete Contract
**Endpoint:** `DELETE /api/contracts/:id`
**Auth:** Required (ADMIN or PROPERTY_MANAGER)

**Automated Actions:**
- If no other active contracts exist for the property, status is changed back to AVAILABLE

```bash
curl -X DELETE http://localhost:5000/api/contracts/CONTRACT_UUID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": null,
  "message": "Contract deleted successfully"
}
```

---

### 2. TENANT PORTAL ENDPOINTS

Tenant portal uses token-based authentication (no login required). Tenants access via unique token link.

**Token Structure:**
```json
{
  "contractId": "uuid",
  "tenantNationalId": "1234567890",
  "type": "TENANT_PORTAL",
  "exp": 1735689600
}
```

**Token can be passed:**
- As Bearer token in Authorization header
- As query parameter: `?token=YOUR_TOKEN`

#### Get Tenant Contracts
**Endpoint:** `GET /api/tenant-portal/contracts`
**Auth:** Tenant Portal Token

Returns all contracts for the tenant (identified by national ID in token).

```bash
# Using Authorization header
curl -X GET http://localhost:5000/api/tenant-portal/contracts \
  -H "Authorization: Bearer TENANT_PORTAL_TOKEN"

# Using query parameter
curl -X GET "http://localhost:5000/api/tenant-portal/contracts?token=TENANT_PORTAL_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tenant": {
      "id": "tenant-uuid",
      "firstName": "Ahmad",
      "lastName": "Al-Zahrani",
      "email": "ahmad@example.com",
      "phone": "0512345678"
    },
    "contracts": [
      {
        "id": "contract-uuid",
        "propertyId": "property-uuid",
        "tenantId": "tenant-uuid",
        "price": 30000,
        "startDate": "2025-01-01T00:00:00.000Z",
        "endDate": "2026-01-01T00:00:00.000Z",
        "paymentFrequency": "ONCE",
        "documentUrl": "/uploads/documents/contract_uuid_timestamp.html",
        "property": {
          "id": "property-uuid",
          "name": "Apartment 101",
          "type": "Apartment",
          "bedrooms": 3,
          "bathrooms": 2,
          "area": 150.5,
          "estate": {
            "id": "estate-uuid",
            "name": "Al Nakheel Estate",
            "city": "Riyadh",
            "region": "Central",
            "address": "Building 123, King Fahd Road, Riyadh"
          },
          "owner": {
            "id": "owner-uuid",
            "firstName": "Fahad",
            "lastName": "Al-Mansour",
            "email": "fahad@example.com",
            "phone": "0501234567"
          }
        },
        "maintenanceRequests": [],
        "daysUntilExpiration": 365,
        "isActive": true
      }
    ]
  },
  "message": "Contracts retrieved successfully"
}
```

#### Get Specific Contract (Tenant Portal)
**Endpoint:** `GET /api/tenant-portal/contracts/:id`
**Auth:** Tenant Portal Token

**Access Control:** Can only view contracts that belong to them (verified via national ID in token).

```bash
curl -X GET http://localhost:5000/api/tenant-portal/contracts/CONTRACT_UUID \
  -H "Authorization: Bearer TENANT_PORTAL_TOKEN"
```

---

## Testing Workflow

### Step 1: Prepare Prerequisites

```bash
# 1. Login as Property Manager
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@example.com",
    "password": "your-password"
  }'

# Save the token

# 2. Ensure you have:
# - An estate (from Phase 3)
# - A property (from Phase 3) with status AVAILABLE
# - A property owner (from Phase 1)
# - A tenant (from Phase 4)
```

### Step 2: Create a Contract

```bash
curl -X POST http://localhost:5000/api/contracts \
  -H "Authorization: Bearer YOUR_PM_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "propertyId": "PROPERTY_UUID",
    "tenantId": "TENANT_UUID",
    "price": 30000,
    "startDate": "2025-01-01T00:00:00.000Z",
    "endDate": "2026-01-01T00:00:00.000Z",
    "paymentFrequency": "ONCE"
  }'

# Save the response - note the tenantPortalToken and documentUrl
```

### Step 3: Verify Property Status Changed

```bash
# Check property status - should now be RENTED
curl -X GET http://localhost:5000/api/properties/PROPERTY_UUID \
  -H "Authorization: Bearer YOUR_PM_TOKEN"

# Response should show: "status": "RENTED"
```

### Step 4: View Contract Document

```bash
# Access the document URL from the response
# Example: http://localhost:5000/uploads/documents/contract_uuid_timestamp.html

# Open in browser or:
curl http://localhost:5000/uploads/documents/contract_uuid_timestamp.html
```

### Step 5: Test Tenant Portal Access

```bash
# Use the tenantPortalToken from contract creation response

# Get all contracts for the tenant
curl -X GET http://localhost:5000/api/tenant-portal/contracts \
  -H "Authorization: Bearer TENANT_PORTAL_TOKEN"

# Get specific contract
curl -X GET http://localhost:5000/api/tenant-portal/contracts/CONTRACT_UUID \
  -H "Authorization: Bearer TENANT_PORTAL_TOKEN"
```

### Step 6: Test Filters and Search

```bash
# Get active contracts only
curl -X GET "http://localhost:5000/api/contracts?status=active" \
  -H "Authorization: Bearer YOUR_PM_TOKEN"

# Get expired contracts
curl -X GET "http://localhost:5000/api/contracts?status=expired" \
  -H "Authorization: Bearer YOUR_PM_TOKEN"

# Get contracts for a specific property
curl -X GET "http://localhost:5000/api/contracts?propertyId=PROPERTY_UUID" \
  -H "Authorization: Bearer YOUR_PM_TOKEN"

# Get contracts for a specific tenant
curl -X GET "http://localhost:5000/api/contracts?tenantId=TENANT_UUID" \
  -H "Authorization: Bearer YOUR_PM_TOKEN"
```

### Step 7: Test Property Owner Access

```bash
# Login as property owner
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@example.com",
    "password": "your-password"
  }'

# Property owner can only see contracts for their properties
curl -X GET http://localhost:5000/api/contracts \
  -H "Authorization: Bearer OWNER_TOKEN"
```

### Step 8: Update Contract

```bash
curl -X PUT http://localhost:5000/api/contracts/CONTRACT_UUID \
  -H "Authorization: Bearer YOUR_PM_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 32000,
    "paymentFrequency": "TWICE"
  }'

# A new document will be generated automatically
```

### Step 9: Delete Contract and Verify Property Status

```bash
# Delete contract
curl -X DELETE http://localhost:5000/api/contracts/CONTRACT_UUID \
  -H "Authorization: Bearer YOUR_PM_TOKEN"

# Check property status - should be AVAILABLE again
curl -X GET http://localhost:5000/api/properties/PROPERTY_UUID \
  -H "Authorization: Bearer YOUR_PM_TOKEN"

# Response should show: "status": "AVAILABLE"
```

---

## Business Rules Implemented

1. **Property Availability**: Cannot create contract if property already has active contract
2. **Date Validation**: End date must be after start date
3. **Auto Status Update**: Property status automatically changes to RENTED when contract created
4. **Auto Status Restore**: Property status returns to AVAILABLE when last active contract deleted
5. **Owner Auto-Link**: Owner is automatically linked from property (no manual input needed)
6. **Document Generation**: Contract document automatically generated on creation and significant updates
7. **Token Generation**: Tenant portal token automatically generated with 30-day expiration
8. **Days Calculation**: Days until expiration automatically calculated
9. **Tenant Portal Access Control**: Tenants can only view their own contracts

---

## Role-Based Access Control

### ADMIN & PROPERTY_MANAGER
- ✓ View all contracts
- ✓ Create contracts
- ✓ Update contracts
- ✓ Delete contracts
- ✓ Filter contracts by any criteria
- ✓ Generate contract documents
- ✓ Generate tenant portal tokens

### PROPERTY_OWNER
- ✓ View contracts for their properties only
- ✓ Filter contracts for their properties
- ✗ Cannot create contracts
- ✗ Cannot update contracts
- ✗ Cannot delete contracts

### TENANT (via Portal Token)
- ✓ View their own contracts
- ✓ View contract documents
- ✓ Access via token (no login)
- ✗ Cannot modify contracts
- ✗ Cannot view other tenants' contracts

---

## Contract Document

The generated contract document includes:
- **Header**: Contract ID, generation date
- **Property Information**: Name, type, location, features
- **Tenant Information**: Full name, national ID, contact info
- **Owner Information**: Full name, contact info
- **Contract Terms**: Dates, duration, rental amount, payment frequency
- **Terms and Conditions**: Standard rental agreement clauses
- **Signature Blocks**: For tenant and owner

Documents are generated in HTML format and stored in `/uploads/documents/`.

**Access Document:**
```
http://localhost:5000/uploads/documents/contract_uuid_timestamp.html
```

---

## Error Handling

### Common Errors

**Property already rented:**
```json
{
  "success": false,
  "message": "Property already has an active contract"
}
```

**Property not found:**
```json
{
  "success": false,
  "message": "Property not found"
}
```

**Tenant not found:**
```json
{
  "success": false,
  "message": "Tenant not found"
}
```

**Invalid dates:**
```json
{
  "success": false,
  "message": "End date must be after start date"
}
```

**Property owner access denied:**
```json
{
  "success": false,
  "message": "Access denied: You can only view contracts for your properties"
}
```

**Tenant portal access denied:**
```json
{
  "success": false,
  "message": "Access denied: This contract does not belong to you"
}
```

**Invalid portal token:**
```json
{
  "success": false,
  "message": "Invalid token"
}
```

**Expired portal token:**
```json
{
  "success": false,
  "message": "Token has expired"
}
```

---

## PHASE 5 COMPLETE ✓

All Contract & Tenant Portal functionalities are now implemented:
- ✓ Full contract CRUD operations
- ✓ Owner auto-linked from property
- ✓ Contract document generation (HTML)
- ✓ Document URL storage
- ✓ Days until expiration calculation
- ✓ Automatic property status updates
- ✓ Tenant portal token generation
- ✓ Token-based tenant portal access
- ✓ Tenant portal endpoints (view contracts)
- ✓ Role-based access control
- ✓ Payment frequency: ONCE or TWICE
- ✓ Comprehensive validation

**Note:** Tenant portal maintenance request creation will be added in Phase 6.

**Next Phase:** Phase 6 - Maintenance Requests
