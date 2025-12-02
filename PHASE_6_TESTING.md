# PHASE 6 - Maintenance Requests Testing Guide

## Overview
This phase implements maintenance request management with status workflow, tenant portal integration, and role-based access control.

---

## Maintenance Status Workflow

Requests follow this status flow:
```
PENDING → IN_PROGRESS → COMPLETED
         ↓
      CANCELLED
```

**Valid Transitions:**
- `PENDING` → `IN_PROGRESS` or `CANCELLED`
- `IN_PROGRESS` → `COMPLETED` or `CANCELLED`
- `COMPLETED` → (Final state, no transitions)
- `CANCELLED` → (Final state, no transitions)

---

## API Endpoints

### 1. MAINTENANCE REQUEST ENDPOINTS (Authenticated Users)

#### Get All Maintenance Requests (with Filters)
**Endpoint:** `GET /api/maintenance`
**Auth:** Required (All authenticated users)
**Query Parameters:**
- `contractId` (optional) - Filter by contract
- `tenantId` (optional) - Filter by tenant
- `propertyId` (optional) - Filter by property
- `status` (optional) - Filter by status: PENDING, IN_PROGRESS, COMPLETED, CANCELLED

**RBAC:**
- **ADMIN & PROPERTY_MANAGER**: See all maintenance requests
- **PROPERTY_OWNER**: See only requests for their properties

```bash
# Get all maintenance requests
curl -X GET http://localhost:5000/api/maintenance \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get pending requests only
curl -X GET "http://localhost:5000/api/maintenance?status=PENDING" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get requests for a specific property
curl -X GET "http://localhost:5000/api/maintenance?propertyId=PROPERTY_UUID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "maintenance-uuid",
      "contractId": "contract-uuid",
      "tenantId": "tenant-uuid",
      "title": "AC not working",
      "description": "The air conditioning unit stopped working this morning",
      "status": "PENDING",
      "images": [
        "/uploads/maintenance/image1.jpg",
        "/uploads/maintenance/image2.jpg"
      ],
      "internalNotes": null,
      "createdAt": "2025-11-23T12:00:00.000Z",
      "updatedAt": "2025-11-23T12:00:00.000Z",
      "contract": {
        "id": "contract-uuid",
        "property": {
          "id": "property-uuid",
          "name": "Apartment 101",
          "type": "Apartment",
          "estate": {
            "id": "estate-uuid",
            "name": "Al Nakheel Estate",
            "city": "Riyadh"
          },
          "owner": {
            "id": "owner-uuid",
            "firstName": "Fahad",
            "lastName": "Al-Mansour",
            "email": "fahad@example.com",
            "phone": "0501234567"
          }
        }
      },
      "tenant": {
        "id": "tenant-uuid",
        "firstName": "Ahmad",
        "lastName": "Al-Zahrani",
        "email": "ahmad@example.com",
        "phone": "0512345678",
        "nationalId": "1234567890"
      }
    }
  ],
  "message": "Maintenance requests retrieved successfully"
}
```

#### Get Maintenance Request by ID
**Endpoint:** `GET /api/maintenance/:id`
**Auth:** Required (All authenticated users)

**RBAC:**
- **ADMIN & PROPERTY_MANAGER**: Can view any request
- **PROPERTY_OWNER**: Can only view requests for their properties

```bash
curl -X GET http://localhost:5000/api/maintenance/MAINTENANCE_UUID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Get Maintenance Statistics
**Endpoint:** `GET /api/maintenance/stats`
**Auth:** Required (All authenticated users)

**RBAC:**
- **ADMIN & PROPERTY_MANAGER**: Stats for all requests
- **PROPERTY_OWNER**: Stats for their properties only

```bash
curl -X GET http://localhost:5000/api/maintenance/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 45,
    "pending": 12,
    "inProgress": 8,
    "completed": 20,
    "cancelled": 5
  },
  "message": "Maintenance statistics retrieved successfully"
}
```

#### Create Maintenance Request
**Endpoint:** `POST /api/maintenance`
**Auth:** Required (ADMIN or PROPERTY_MANAGER)

**Note:** Regular users (PM/Admin) can create maintenance requests. Tenants create via tenant portal.

```bash
curl -X POST http://localhost:5000/api/maintenance \
  -H "Authorization: Bearer YOUR_PM_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contractId": "CONTRACT_UUID",
    "title": "AC not working",
    "description": "The air conditioning unit stopped working this morning. It makes a strange noise and does not cool.",
    "images": [
      "/uploads/maintenance/image1.jpg",
      "/uploads/maintenance/image2.jpg"
    ]
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "maintenance-uuid",
    "contractId": "contract-uuid",
    "tenantId": "tenant-uuid",
    "title": "AC not working",
    "description": "The air conditioning unit stopped working this morning. It makes a strange noise and does not cool.",
    "status": "PENDING",
    "images": [
      "/uploads/maintenance/image1.jpg",
      "/uploads/maintenance/image2.jpg"
    ],
    "internalNotes": null,
    "createdAt": "2025-11-23T12:00:00.000Z",
    "updatedAt": "2025-11-23T12:00:00.000Z",
    "contract": { ... },
    "tenant": { ... }
  },
  "message": "Maintenance request created successfully"
}
```

#### Update Maintenance Request (Status & Notes)
**Endpoint:** `PUT /api/maintenance/:id`
**Auth:** Required (ADMIN or PROPERTY_MANAGER)

**Allowed Updates:**
- `status` - Change status (must follow valid transitions)
- `internalNotes` - Add/update internal notes (visible to PM/Admin only)

```bash
# Update status to IN_PROGRESS
curl -X PUT http://localhost:5000/api/maintenance/MAINTENANCE_UUID \
  -H "Authorization: Bearer YOUR_PM_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "IN_PROGRESS",
    "internalNotes": "Assigned to technician John. Scheduled for tomorrow at 10 AM."
  }'

# Complete the request
curl -X PUT http://localhost:5000/api/maintenance/MAINTENANCE_UUID \
  -H "Authorization: Bearer YOUR_PM_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "COMPLETED",
    "internalNotes": "AC unit replaced. Work completed successfully."
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "maintenance-uuid",
    "contractId": "contract-uuid",
    "tenantId": "tenant-uuid",
    "title": "AC not working",
    "description": "The air conditioning unit stopped working this morning",
    "status": "COMPLETED",
    "images": [...],
    "internalNotes": "AC unit replaced. Work completed successfully.",
    "createdAt": "2025-11-23T12:00:00.000Z",
    "updatedAt": "2025-11-23T14:30:00.000Z",
    "contract": { ... },
    "tenant": { ... }
  },
  "message": "Maintenance request updated successfully"
}
```

#### Delete Maintenance Request
**Endpoint:** `DELETE /api/maintenance/:id`
**Auth:** Required (ADMIN or PROPERTY_MANAGER)

```bash
curl -X DELETE http://localhost:5000/api/maintenance/MAINTENANCE_UUID \
  -H "Authorization: Bearer YOUR_PM_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": null,
  "message": "Maintenance request deleted successfully"
}
```

---

### 2. TENANT PORTAL MAINTENANCE ENDPOINT

#### Create Maintenance Request (Tenant Portal)
**Endpoint:** `POST /api/tenant-portal/maintenance`
**Auth:** Tenant Portal Token

Tenants can create maintenance requests via their tenant portal link.

**Automated Actions:**
- Contract ID automatically taken from token
- Tenant ID automatically linked via national ID in token
- Status automatically set to PENDING

```bash
# Using Authorization header
curl -X POST http://localhost:5000/api/tenant-portal/maintenance \
  -H "Authorization: Bearer TENANT_PORTAL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Kitchen sink leaking",
    "description": "The kitchen sink has been leaking for 2 days. Water pools under the sink.",
    "images": [
      "/uploads/maintenance/leak1.jpg"
    ]
  }'

# Using query parameter
curl -X POST "http://localhost:5000/api/tenant-portal/maintenance?token=TENANT_PORTAL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Kitchen sink leaking",
    "description": "The kitchen sink has been leaking for 2 days. Water pools under the sink.",
    "images": [
      "/uploads/maintenance/leak1.jpg"
    ]
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "maintenance-uuid",
    "contractId": "contract-uuid",
    "tenantId": "tenant-uuid",
    "title": "Kitchen sink leaking",
    "description": "The kitchen sink has been leaking for 2 days. Water pools under the sink.",
    "status": "PENDING",
    "images": [
      "/uploads/maintenance/leak1.jpg"
    ],
    "internalNotes": null,
    "createdAt": "2025-11-23T15:00:00.000Z",
    "updatedAt": "2025-11-23T15:00:00.000Z",
    "contract": {
      "property": {
        "id": "property-uuid",
        "name": "Apartment 101",
        "type": "Apartment",
        "estate": {
          "name": "Al Nakheel Estate",
          "city": "Riyadh"
        }
      }
    },
    "tenant": {
      "id": "tenant-uuid",
      "firstName": "Ahmad",
      "lastName": "Al-Zahrani",
      "email": "ahmad@example.com",
      "phone": "0512345678"
    }
  },
  "message": "Maintenance request created successfully"
}
```

---

## Testing Workflow

### Step 1: Create Maintenance Request as Property Manager

```bash
# Login as Property Manager
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@example.com",
    "password": "your-password"
  }'

# Create maintenance request
curl -X POST http://localhost:5000/api/maintenance \
  -H "Authorization: Bearer YOUR_PM_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contractId": "CONTRACT_UUID",
    "title": "Broken window",
    "description": "Living room window is cracked and needs replacement"
  }'
```

### Step 2: Create Maintenance Request via Tenant Portal

```bash
# Use tenant portal token from contract

curl -X POST http://localhost:5000/api/tenant-portal/maintenance \
  -H "Authorization: Bearer TENANT_PORTAL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "AC not cooling",
    "description": "The air conditioner runs but does not produce cold air"
  }'
```

### Step 3: View All Maintenance Requests

```bash
# As Property Manager - see all
curl -X GET http://localhost:5000/api/maintenance \
  -H "Authorization: Bearer YOUR_PM_TOKEN"

# As Property Owner - see only their properties
curl -X GET http://localhost:5000/api/maintenance \
  -H "Authorization: Bearer YOUR_OWNER_TOKEN"
```

### Step 4: Filter Maintenance Requests

```bash
# Get pending requests only
curl -X GET "http://localhost:5000/api/maintenance?status=PENDING" \
  -H "Authorization: Bearer YOUR_PM_TOKEN"

# Get requests for specific property
curl -X GET "http://localhost:5000/api/maintenance?propertyId=PROPERTY_UUID" \
  -H "Authorization: Bearer YOUR_PM_TOKEN"

# Get requests for specific contract
curl -X GET "http://localhost:5000/api/maintenance?contractId=CONTRACT_UUID" \
  -H "Authorization: Bearer YOUR_PM_TOKEN"
```

### Step 5: Update Status (Workflow)

```bash
# Step 1: Change from PENDING to IN_PROGRESS
curl -X PUT http://localhost:5000/api/maintenance/MAINTENANCE_UUID \
  -H "Authorization: Bearer YOUR_PM_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "IN_PROGRESS",
    "internalNotes": "Technician assigned. Will visit on Nov 25 at 2 PM."
  }'

# Step 2: Complete the request
curl -X PUT http://localhost:5000/api/maintenance/MAINTENANCE_UUID \
  -H "Authorization: Bearer YOUR_PM_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "COMPLETED",
    "internalNotes": "Work completed successfully. AC unit repaired."
  }'
```

### Step 6: Test Invalid Status Transitions

```bash
# Try to go from COMPLETED back to PENDING (should fail)
curl -X PUT http://localhost:5000/api/maintenance/MAINTENANCE_UUID \
  -H "Authorization: Bearer YOUR_PM_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "PENDING"
  }'

# Response:
# {
#   "success": false,
#   "message": "Cannot transition from COMPLETED to PENDING"
# }
```

### Step 7: Get Statistics

```bash
curl -X GET http://localhost:5000/api/maintenance/stats \
  -H "Authorization: Bearer YOUR_PM_TOKEN"
```

---

## Role-Based Access Control

### ADMIN & PROPERTY_MANAGER
- ✓ View all maintenance requests
- ✓ Create maintenance requests
- ✓ Update status and internal notes
- ✓ Delete maintenance requests
- ✓ Filter by any criteria
- ✓ View statistics for all requests

### PROPERTY_OWNER
- ✓ View requests for their properties only
- ✓ View statistics for their properties only
- ✗ Cannot create requests
- ✗ Cannot update requests
- ✗ Cannot delete requests

### TENANT (via Portal Token)
- ✓ Create maintenance requests for their contract
- ✓ Include optional images
- ✗ Cannot view request status (will be added in future)
- ✗ Cannot update requests
- ✗ Cannot delete requests

---

## Business Rules Implemented

1. **Status Workflow**: Requests must follow valid status transitions
2. **Contract Validation**: Contract must exist and be active
3. **Tenant Verification**: Tenant must belong to the contract
4. **Expired Contracts**: Cannot create requests for expired contracts
5. **Owner Access Control**: Property owners only see their property requests
6. **Internal Notes**: Only visible to PM/Admin, not to tenants
7. **Images**: Optional array of image URLs
8. **Auto Status**: New requests start as PENDING

---

## Status Transition Rules

```
From PENDING:
  ✓ To IN_PROGRESS
  ✓ To CANCELLED
  ✗ To COMPLETED (must go through IN_PROGRESS first)

From IN_PROGRESS:
  ✓ To COMPLETED
  ✓ To CANCELLED
  ✗ To PENDING (cannot go backwards)

From COMPLETED:
  ✗ No transitions allowed (final state)

From CANCELLED:
  ✗ No transitions allowed (final state)
```

---

## Error Handling

### Common Errors

**Invalid status transition:**
```json
{
  "success": false,
  "message": "Cannot transition from COMPLETED to PENDING"
}
```

**Status already set:**
```json
{
  "success": false,
  "message": "Status is already PENDING"
}
```

**Contract not found:**
```json
{
  "success": false,
  "message": "Contract not found"
}
```

**Expired contract:**
```json
{
  "success": false,
  "message": "Cannot create maintenance request for expired contract"
}
```

**Contract doesn't belong to tenant:**
```json
{
  "success": false,
  "message": "This contract does not belong to you"
}
```

**Property owner access denied:**
```json
{
  "success": false,
  "message": "Access denied: You can only view maintenance requests for your properties"
}
```

---

## Internal Notes

Internal notes are only visible to Property Managers and Admins. They can be used for:
- Technician assignment details
- Appointment scheduling
- Work progress updates
- Cost estimates
- Completion notes

**Example:**
```json
{
  "internalNotes": "Assigned to John Smith (technician). Scheduled for Nov 25, 2 PM. Est. cost: 500 SAR. Parts ordered."
}
```

---

## PHASE 6 COMPLETE ✓

All Maintenance Request functionalities are now implemented:
- ✓ Full CRUD operations
- ✓ Status workflow (PENDING → IN_PROGRESS → COMPLETED/CANCELLED)
- ✓ Status transition validation
- ✓ Tenant portal maintenance creation
- ✓ Internal notes (PM/Admin only)
- ✓ Optional images support
- ✓ Role-based access control
- ✓ Property owner read-only access
- ✓ Maintenance statistics
- ✓ Contract validation
- ✓ Expired contract prevention

**Next Phase:** Phase 7 - System Settings + Audit Logs + Documentation
