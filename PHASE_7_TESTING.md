# PHASE 7 - System Settings & Audit Logs Testing Guide

## Overview
This phase implements system settings management and audit logging functionality for tracking user actions throughout the system.

---

## Settings Management

### Public vs Private Settings
- **Public Settings**: Visible to all users (even unauthenticated)
- **Private Settings**: Only visible to Admin users

Settings keys must be uppercase with underscores only (e.g., `COMPANY_NAME`, `MAX_UPLOAD_SIZE_MB`).

---

## API Endpoints

### 1. SETTINGS ENDPOINTS

#### Get All Settings
**Endpoint:** `GET /api/settings`
**Auth:** Optional (filters by user role)
**Query Parameters:**
- `key` (optional) - Filter by setting key
- `isPublic` (optional) - Filter by public/private (Admin only)

**Access:**
- **Unauthenticated/All Users**: See only public settings
- **ADMIN**: See all settings (can filter by isPublic)

```bash
# Get public settings (no authentication)
curl -X GET http://localhost:5000/api/settings

# Get all settings as admin
curl -X GET http://localhost:5000/api/settings \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Filter by key
curl -X GET "http://localhost:5000/api/settings?key=COMPANY" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Get only public settings as admin
curl -X GET "http://localhost:5000/api/settings?isPublic=true" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "setting-uuid",
      "key": "COMPANY_NAME",
      "value": "Property Management System",
      "description": "Company name displayed in the system",
      "isPublic": true,
      "createdAt": "2025-11-23T12:00:00.000Z",
      "updatedAt": "2025-11-23T12:00:00.000Z"
    },
    {
      "id": "setting-uuid-2",
      "key": "COMPANY_EMAIL",
      "value": "info@propertymanagement.com",
      "description": "Company contact email",
      "isPublic": true,
      "createdAt": "2025-11-23T12:00:00.000Z",
      "updatedAt": "2025-11-23T12:00:00.000Z"
    }
  ],
  "message": "Settings retrieved successfully"
}
```

#### Get Setting by Key
**Endpoint:** `GET /api/settings/:key`
**Auth:** Optional (role-based access)

```bash
# Get public setting (no auth required)
curl -X GET http://localhost:5000/api/settings/COMPANY_NAME

# Get private setting (admin only)
curl -X GET http://localhost:5000/api/settings/ENABLE_EMAIL_NOTIFICATIONS \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "setting-uuid",
    "key": "COMPANY_NAME",
    "value": "Property Management System",
    "description": "Company name displayed in the system",
    "isPublic": true,
    "createdAt": "2025-11-23T12:00:00.000Z",
    "updatedAt": "2025-11-23T12:00:00.000Z"
  },
  "message": "Setting retrieved successfully"
}
```

#### Initialize Default Settings
**Endpoint:** `POST /api/settings/initialize`
**Auth:** Admin only

This endpoint creates the default system settings if they don't exist.

**Default Settings Created:**
- `COMPANY_NAME` (public)
- `COMPANY_EMAIL` (public)
- `COMPANY_PHONE` (public)
- `COMPANY_ADDRESS` (public)
- `ENABLE_EMAIL_NOTIFICATIONS` (private)
- `ENABLE_SMS_NOTIFICATIONS` (private)
- `MAINTENANCE_AUTO_ASSIGN` (private)
- `CONTRACT_EXPIRY_WARNING_DAYS` (private)
- `MAX_UPLOAD_SIZE_MB` (private)

```bash
curl -X POST http://localhost:5000/api/settings/initialize \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": null,
  "message": "Default settings initialized successfully"
}
```

#### Create Setting
**Endpoint:** `POST /api/settings`
**Auth:** Admin only

```bash
curl -X POST http://localhost:5000/api/settings \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "MAINTENANCE_SLA_HOURS",
    "value": 24,
    "description": "SLA time in hours for maintenance requests",
    "isPublic": false
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "setting-uuid",
    "key": "MAINTENANCE_SLA_HOURS",
    "value": 24,
    "description": "SLA time in hours for maintenance requests",
    "isPublic": false,
    "createdAt": "2025-11-23T14:00:00.000Z",
    "updatedAt": "2025-11-23T14:00:00.000Z"
  },
  "message": "Setting created successfully"
}
```

**Validation Rules:**
- Key must be uppercase letters and underscores only
- Value can be any JSON type (string, number, boolean, object, array)
- Key must be unique

#### Update Setting
**Endpoint:** `PUT /api/settings/:key`
**Auth:** Admin only

```bash
curl -X PUT http://localhost:5000/api/settings/COMPANY_NAME \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "value": "Advanced Property Management Solutions",
    "description": "Updated company name"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "setting-uuid",
    "key": "COMPANY_NAME",
    "value": "Advanced Property Management Solutions",
    "description": "Updated company name",
    "isPublic": true,
    "createdAt": "2025-11-23T12:00:00.000Z",
    "updatedAt": "2025-11-23T14:30:00.000Z"
  },
  "message": "Setting updated successfully"
}
```

#### Delete Setting
**Endpoint:** `DELETE /api/settings/:key`
**Auth:** Admin only

```bash
curl -X DELETE http://localhost:5000/api/settings/MAINTENANCE_SLA_HOURS \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": null,
  "message": "Setting deleted successfully"
}
```

---

### 2. AUDIT LOG ENDPOINTS

Audit logs are automatically created when users perform actions throughout the system. The audit logging middleware tracks:
- User ID
- Action (CREATE, UPDATE, DELETE, etc.)
- Entity type
- Entity ID
- Additional details
- IP address
- Timestamp

#### Get All Audit Logs
**Endpoint:** `GET /api/audit-logs`
**Auth:** Admin only
**Query Parameters:**
- `userId` (optional) - Filter by user ID
- `action` (optional) - Filter by action
- `entity` (optional) - Filter by entity type
- `entityId` (optional) - Filter by entity ID
- `startDate` (optional) - Filter by start date (ISO 8601)
- `endDate` (optional) - Filter by end date (ISO 8601)
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 50)

```bash
# Get all audit logs
curl -X GET http://localhost:5000/api/audit-logs \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Filter by user
curl -X GET "http://localhost:5000/api/audit-logs?userId=USER_UUID" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Filter by action
curl -X GET "http://localhost:5000/api/audit-logs?action=CREATE" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Filter by entity
curl -X GET "http://localhost:5000/api/audit-logs?entity=Property" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Filter by date range
curl -X GET "http://localhost:5000/api/audit-logs?startDate=2025-11-01T00:00:00Z&endDate=2025-11-30T23:59:59Z" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Pagination
curl -X GET "http://localhost:5000/api/audit-logs?page=2&limit=20" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "auditLogs": [
      {
        "id": "audit-uuid",
        "userId": "user-uuid",
        "action": "CREATE",
        "entity": "Property",
        "entityId": "property-uuid",
        "details": {
          "created": true
        },
        "ipAddress": "192.168.1.1",
        "createdAt": "2025-11-23T14:00:00.000Z",
        "user": {
          "id": "user-uuid",
          "firstName": "Mohammed",
          "lastName": "Al-Rashid",
          "email": "manager@example.com",
          "role": "PROPERTY_MANAGER"
        }
      },
      {
        "id": "audit-uuid-2",
        "userId": "user-uuid",
        "action": "UPDATE",
        "entity": "Settings",
        "entityId": null,
        "details": {
          "changes": ["value", "description"]
        },
        "ipAddress": "192.168.1.1",
        "createdAt": "2025-11-23T14:30:00.000Z",
        "user": {
          "id": "user-uuid",
          "firstName": "Admin",
          "lastName": "User",
          "email": "admin@example.com",
          "role": "ADMIN"
        }
      }
    ],
    "pagination": {
      "total": 150,
      "page": 1,
      "limit": 50,
      "totalPages": 3
    }
  },
  "message": "Audit logs retrieved successfully"
}
```

#### Get Audit Log by ID
**Endpoint:** `GET /api/audit-logs/:id`
**Auth:** Admin only

```bash
curl -X GET http://localhost:5000/api/audit-logs/AUDIT_LOG_UUID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "audit-uuid",
    "userId": "user-uuid",
    "action": "DELETE",
    "entity": "Tenant",
    "entityId": "tenant-uuid",
    "details": {
      "deletedId": "tenant-uuid"
    },
    "ipAddress": "192.168.1.1",
    "createdAt": "2025-11-23T15:00:00.000Z",
    "user": {
      "id": "user-uuid",
      "firstName": "Mohammed",
      "lastName": "Al-Rashid",
      "email": "manager@example.com",
      "role": "PROPERTY_MANAGER"
    }
  },
  "message": "Audit log retrieved successfully"
}
```

#### Get Audit Log Statistics
**Endpoint:** `GET /api/audit-logs/stats`
**Auth:** Admin only

```bash
curl -X GET http://localhost:5000/api/audit-logs/stats \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 1250,
    "last24Hours": 45,
    "last7Days": 320,
    "last30Days": 980,
    "topActions": [
      { "action": "CREATE", "count": 450 },
      { "action": "UPDATE", "count": 380 },
      { "action": "DELETE", "count": 120 },
      { "action": "LOGIN", "count": 300 }
    ],
    "topEntities": [
      { "entity": "Property", "count": 280 },
      { "entity": "Tenant", "count": 210 },
      { "entity": "Contract", "count": 195 },
      { "entity": "MaintenanceRequest", "count": 165 }
    ]
  },
  "message": "Audit log statistics retrieved successfully"
}
```

#### Delete Old Audit Logs
**Endpoint:** `DELETE /api/audit-logs/cleanup`
**Auth:** Admin only

Delete audit logs older than specified days (default: 90 days).

```bash
curl -X DELETE http://localhost:5000/api/audit-logs/cleanup \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "daysToKeep": 90
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "deletedCount": 234
  },
  "message": "Deleted 234 old audit logs"
}
```

---

## Testing Workflow

### Step 1: Initialize Default Settings

```bash
# Login as admin
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "your-password"
  }'

# Save the token from response

# Initialize default settings
curl -X POST http://localhost:5000/api/settings/initialize \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Step 2: View Public Settings (No Auth)

```bash
# Anyone can view public settings
curl -X GET http://localhost:5000/api/settings

# Get specific public setting
curl -X GET http://localhost:5000/api/settings/COMPANY_NAME
```

### Step 3: Try to Access Private Setting (Should Fail)

```bash
# Non-admin user tries to access private setting
curl -X GET http://localhost:5000/api/settings/ENABLE_EMAIL_NOTIFICATIONS \
  -H "Authorization: Bearer YOUR_PM_TOKEN"

# Response: Access denied
```

### Step 4: Create Custom Setting

```bash
curl -X POST http://localhost:5000/api/settings \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "TENANT_PORTAL_EXPIRY_DAYS",
    "value": 365,
    "description": "Number of days tenant portal token is valid",
    "isPublic": false
  }'
```

### Step 5: Update Setting

```bash
curl -X PUT http://localhost:5000/api/settings/COMPANY_PHONE \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "value": "+966501234567",
    "description": "Updated company phone number"
  }'
```

### Step 6: View Audit Logs

```bash
# Get all audit logs
curl -X GET http://localhost:5000/api/audit-logs \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# The above setting operations should be logged

# Get statistics
curl -X GET http://localhost:5000/api/audit-logs/stats \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Step 7: Filter Audit Logs

```bash
# Get all CREATE actions
curl -X GET "http://localhost:5000/api/audit-logs?action=CREATE" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Get all Settings operations
curl -X GET "http://localhost:5000/api/audit-logs?entity=Settings" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Get logs for specific user
curl -X GET "http://localhost:5000/api/audit-logs?userId=YOUR_USER_ID" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Step 8: Test Automatic Audit Logging

Perform any action in the system (create property, update tenant, etc.) and verify it's logged:

```bash
# Create a property
curl -X POST http://localhost:5000/api/properties \
  -H "Authorization: Bearer YOUR_PM_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "estateId": "ESTATE_UUID",
    "ownerId": "OWNER_UUID",
    "name": "Test Apartment",
    "type": "Apartment"
  }'

# Check audit logs for this action
curl -X GET "http://localhost:5000/api/audit-logs?entity=Property&action=CREATE" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## Audit Logging Coverage

The audit logging middleware automatically tracks the following actions:

### Tracked Entities:
- **User**: CREATE, UPDATE, DELETE, BLOCK
- **Property**: CREATE, UPDATE, DELETE
- **Estate**: CREATE, UPDATE, DELETE
- **Tenant**: CREATE, UPDATE, DELETE
- **Contract**: CREATE, UPDATE, DELETE
- **MaintenanceRequest**: CREATE, UPDATE, DELETE
- **Settings**: CREATE, UPDATE, DELETE, INITIALIZE
- **SubscriptionPlan**: CREATE, UPDATE, DELETE
- **UserSubscription**: CREATE, UPDATE, DELETE

### Not Tracked:
- Login attempts (can be added if needed)
- Read operations (GET requests)
- Failed operations (only successful 2xx responses are logged)

---

## Role-Based Access Control

### Settings Endpoints:
- **GET /api/settings** - Public (filtered by role)
- **GET /api/settings/:key** - Public (filtered by setting visibility)
- **POST /api/settings/initialize** - Admin only
- **POST /api/settings** - Admin only
- **PUT /api/settings/:key** - Admin only
- **DELETE /api/settings/:key** - Admin only

### Audit Log Endpoints:
- **GET /api/audit-logs** - Admin only
- **GET /api/audit-logs/:id** - Admin only
- **GET /api/audit-logs/stats** - Admin only
- **DELETE /api/audit-logs/cleanup** - Admin only

---

## Error Handling

### Common Errors

**Setting not found:**
```json
{
  "success": false,
  "message": "Setting not found"
}
```

**Access denied to private setting:**
```json
{
  "success": false,
  "message": "Access denied to this setting"
}
```

**Duplicate setting key:**
```json
{
  "success": false,
  "message": "Setting with this key already exists"
}
```

**Invalid setting key format:**
```json
{
  "success": false,
  "message": "Key must be uppercase letters and underscores only"
}
```

**Admin access required:**
```json
{
  "success": false,
  "message": "Access denied: Admin role required"
}
```

---

## PHASE 7 COMPLETE ✓

All Phase 7 functionalities are now implemented:
- ✓ System settings CRUD operations
- ✓ Public/private settings with role-based access
- ✓ Default settings initialization
- ✓ Automatic audit logging middleware
- ✓ Audit log viewing and filtering
- ✓ Audit log statistics
- ✓ Audit log cleanup
- ✓ Swagger/OpenAPI documentation
- ✓ Comprehensive deployment guide

**Next Steps:** The backend is now complete! All 7 phases have been successfully implemented.
