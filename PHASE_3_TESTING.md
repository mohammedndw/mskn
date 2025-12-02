# PHASE 3 - Estates & Properties Testing Guide

## Overview
This phase implements estate and property management with full CRUD operations, filters, role-based access control, and image upload functionality.

---

## API Endpoints

### 1. ESTATE ENDPOINTS

All estate endpoints require authentication. Create/Update/Delete operations require ADMIN or PROPERTY_MANAGER role.

#### Get All Estates
**Endpoint:** `GET /api/estates`
**Auth:** Required (All authenticated users)
**Query Parameters:**
- `search` (optional) - Search in name, description, or address
- `region` (optional) - Filter by region
- `city` (optional) - Filter by city

```bash
# Get all estates
curl -X GET http://localhost:5000/api/estates \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get estates with filters
curl -X GET "http://localhost:5000/api/estates?city=Riyadh&region=Central" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "estate-uuid",
      "name": "Al Nakheel Estate",
      "description": "Luxury residential estate",
      "region": "Central",
      "city": "Riyadh",
      "street": "King Fahd Road",
      "address": "Building 123, King Fahd Road, Riyadh",
      "createdAt": "2025-11-23T12:00:00.000Z",
      "updatedAt": "2025-11-23T12:00:00.000Z",
      "properties": [
        {
          "id": "property-uuid",
          "name": "Apartment 101",
          "status": "AVAILABLE"
        }
      ],
      "_count": {
        "properties": 5
      }
    }
  ],
  "message": "Estates retrieved successfully"
}
```

#### Get Estate by ID
**Endpoint:** `GET /api/estates/:id`
**Auth:** Required (All authenticated users)

```bash
curl -X GET http://localhost:5000/api/estates/ESTATE_UUID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Get Estate Statistics
**Endpoint:** `GET /api/estates/:id/stats`
**Auth:** Required (All authenticated users)

```bash
curl -X GET http://localhost:5000/api/estates/ESTATE_UUID/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalProperties": 10,
    "availableProperties": 5,
    "reservedProperties": 2,
    "rentedProperties": 3
  },
  "message": "Estate statistics retrieved successfully"
}
```

#### Create Estate
**Endpoint:** `POST /api/estates`
**Auth:** Required (ADMIN or PROPERTY_MANAGER)

```bash
curl -X POST http://localhost:5000/api/estates \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Al Nakheel Estate",
    "description": "Luxury residential estate in the heart of Riyadh",
    "region": "Central",
    "city": "Riyadh",
    "street": "King Fahd Road",
    "address": "Building 123, King Fahd Road, Riyadh 12345"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "estate-uuid",
    "name": "Al Nakheel Estate",
    "description": "Luxury residential estate in the heart of Riyadh",
    "region": "Central",
    "city": "Riyadh",
    "street": "King Fahd Road",
    "address": "Building 123, King Fahd Road, Riyadh 12345",
    "createdAt": "2025-11-23T12:00:00.000Z",
    "updatedAt": "2025-11-23T12:00:00.000Z",
    "_count": {
      "properties": 0
    }
  },
  "message": "Estate created successfully"
}
```

#### Update Estate
**Endpoint:** `PUT /api/estates/:id`
**Auth:** Required (ADMIN or PROPERTY_MANAGER)

```bash
curl -X PUT http://localhost:5000/api/estates/ESTATE_UUID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Updated description",
    "city": "Jeddah"
  }'
```

#### Delete Estate
**Endpoint:** `DELETE /api/estates/:id`
**Auth:** Required (ADMIN or PROPERTY_MANAGER)
**Note:** Cannot delete estate with existing properties

```bash
curl -X DELETE http://localhost:5000/api/estates/ESTATE_UUID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

### 2. PROPERTY ENDPOINTS

All property endpoints require authentication. Create/Delete operations require ADMIN or PROPERTY_MANAGER role. Property owners have read-only access to their properties.

#### Get All Properties (with Filters)
**Endpoint:** `GET /api/properties`
**Auth:** Required (All authenticated users)
**Query Parameters:**
- `status` (optional) - Filter by status: AVAILABLE, RESERVED, RENTED
- `estateId` (optional) - Filter by estate
- `ownerId` (optional) - Filter by owner (Admin/PM only)
- `type` (optional) - Filter by property type
- `minArea` (optional) - Minimum area in sqm
- `maxArea` (optional) - Maximum area in sqm
- `minBedrooms` (optional) - Minimum number of bedrooms
- `maxBedrooms` (optional) - Maximum number of bedrooms

**Note:** Property owners automatically see only their properties.

```bash
# Get all properties
curl -X GET http://localhost:5000/api/properties \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get available properties
curl -X GET "http://localhost:5000/api/properties?status=AVAILABLE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get properties by estate
curl -X GET "http://localhost:5000/api/properties?estateId=ESTATE_UUID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get properties with multiple filters
curl -X GET "http://localhost:5000/api/properties?status=AVAILABLE&minBedrooms=2&maxBedrooms=4&minArea=100" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "property-uuid",
      "estateId": "estate-uuid",
      "ownerId": "owner-uuid",
      "name": "Luxury Apartment 101",
      "description": "3-bedroom apartment with modern amenities",
      "type": "Apartment",
      "bedrooms": 3,
      "bathrooms": 2,
      "area": 150.5,
      "floor": 1,
      "imageUrl": "/uploads/properties/property_123456789_image.jpg",
      "status": "AVAILABLE",
      "createdAt": "2025-11-23T12:00:00.000Z",
      "updatedAt": "2025-11-23T12:00:00.000Z",
      "estate": {
        "id": "estate-uuid",
        "name": "Al Nakheel Estate",
        "city": "Riyadh",
        "region": "Central"
      },
      "owner": {
        "id": "owner-uuid",
        "firstName": "Ahmad",
        "lastName": "Al-Mansour",
        "email": "ahmad@example.com",
        "phone": "+966501234567"
      },
      "contracts": []
    }
  ],
  "message": "Properties retrieved successfully"
}
```

#### Get Property by ID
**Endpoint:** `GET /api/properties/:id`
**Auth:** Required (All authenticated users)
**Note:** Property owners can only view their own properties

```bash
curl -X GET http://localhost:5000/api/properties/PROPERTY_UUID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "property-uuid",
    "estateId": "estate-uuid",
    "ownerId": "owner-uuid",
    "name": "Luxury Apartment 101",
    "description": "3-bedroom apartment with modern amenities",
    "type": "Apartment",
    "bedrooms": 3,
    "bathrooms": 2,
    "area": 150.5,
    "floor": 1,
    "imageUrl": "/uploads/properties/property_123456789_image.jpg",
    "status": "AVAILABLE",
    "createdAt": "2025-11-23T12:00:00.000Z",
    "updatedAt": "2025-11-23T12:00:00.000Z",
    "estate": {
      "id": "estate-uuid",
      "name": "Al Nakheel Estate",
      "description": "Luxury residential estate",
      "region": "Central",
      "city": "Riyadh",
      "street": "King Fahd Road",
      "address": "Building 123, King Fahd Road, Riyadh"
    },
    "owner": {
      "id": "owner-uuid",
      "firstName": "Ahmad",
      "lastName": "Al-Mansour",
      "email": "ahmad@example.com",
      "phone": "+966501234567",
      "nationalId": "1234567890"
    },
    "contracts": []
  },
  "message": "Property retrieved successfully"
}
```

#### Create Property
**Endpoint:** `POST /api/properties`
**Auth:** Required (ADMIN or PROPERTY_MANAGER)

```bash
curl -X POST http://localhost:5000/api/properties \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "estateId": "ESTATE_UUID",
    "ownerId": "OWNER_UUID",
    "name": "Luxury Apartment 101",
    "description": "3-bedroom apartment with modern amenities and city view",
    "type": "Apartment",
    "bedrooms": 3,
    "bathrooms": 2,
    "area": 150.5,
    "floor": 1,
    "imageUrl": "/uploads/properties/property_123456789_image.jpg",
    "status": "AVAILABLE"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "property-uuid",
    "estateId": "estate-uuid",
    "ownerId": "owner-uuid",
    "name": "Luxury Apartment 101",
    "description": "3-bedroom apartment with modern amenities and city view",
    "type": "Apartment",
    "bedrooms": 3,
    "bathrooms": 2,
    "area": 150.5,
    "floor": 1,
    "imageUrl": "/uploads/properties/property_123456789_image.jpg",
    "status": "AVAILABLE",
    "createdAt": "2025-11-23T12:00:00.000Z",
    "updatedAt": "2025-11-23T12:00:00.000Z",
    "estate": {
      "id": "estate-uuid",
      "name": "Al Nakheel Estate",
      "city": "Riyadh",
      "region": "Central"
    },
    "owner": {
      "id": "owner-uuid",
      "firstName": "Ahmad",
      "lastName": "Al-Mansour",
      "email": "ahmad@example.com",
      "phone": "+966501234567"
    }
  },
  "message": "Property created successfully"
}
```

#### Update Property
**Endpoint:** `PUT /api/properties/:id`
**Auth:** Required (All authenticated users)
**Note:** Property owners can update their properties but cannot change estateId or ownerId

```bash
curl -X PUT http://localhost:5000/api/properties/PROPERTY_UUID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Updated description with new renovations",
    "bedrooms": 4,
    "area": 160
  }'
```

#### Delete Property
**Endpoint:** `DELETE /api/properties/:id`
**Auth:** Required (ADMIN or PROPERTY_MANAGER)
**Note:** Cannot delete property with active contracts. Property owners cannot delete properties.

```bash
curl -X DELETE http://localhost:5000/api/properties/PROPERTY_UUID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

#### Update Property Status
**Endpoint:** `PATCH /api/properties/:id/status`
**Auth:** Required (ADMIN or PROPERTY_MANAGER)

```bash
curl -X PATCH http://localhost:5000/api/properties/PROPERTY_UUID/status \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "RENTED"
  }'
```

**Valid Status Values:**
- `AVAILABLE`
- `RESERVED`
- `RENTED`

---

### 3. IMAGE UPLOAD ENDPOINT

#### Upload Property Image
**Endpoint:** `POST /api/upload/property-image`
**Auth:** Required (ADMIN or PROPERTY_MANAGER)
**Content-Type:** `multipart/form-data`
**Field Name:** `image`
**Allowed Types:** JPEG, PNG, GIF, WebP
**Max Size:** 5MB

```bash
# Upload image using curl
curl -X POST http://localhost:5000/api/upload/property-image \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "image=@/path/to/property-image.jpg"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "filename": "property_1732368000000_123456789_apartment.jpg",
    "originalname": "apartment.jpg",
    "size": 245678,
    "mimetype": "image/jpeg",
    "url": "/uploads/properties/property_1732368000000_123456789_apartment.jpg"
  },
  "message": "Image uploaded successfully"
}
```

**Using the uploaded image:**
After uploading, use the returned `url` value in the `imageUrl` field when creating or updating a property.

**Access uploaded images:**
```
http://localhost:5000/uploads/properties/property_1732368000000_123456789_apartment.jpg
```

---

## Testing Workflow

### Step 1: Create an Estate

```bash
# Login as Admin or Property Manager
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "your-password"
  }'

# Create estate
curl -X POST http://localhost:5000/api/estates \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Al Nakheel Estate",
    "description": "Luxury residential estate",
    "region": "Central",
    "city": "Riyadh",
    "street": "King Fahd Road",
    "address": "Building 123, King Fahd Road, Riyadh"
  }'
```

### Step 2: Create a Property Owner

```bash
curl -X POST http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@example.com",
    "password": "SecurePass123!",
    "firstName": "Ahmad",
    "lastName": "Al-Mansour",
    "phone": "+966501234567",
    "nationalId": "1234567890",
    "role": "PROPERTY_OWNER"
  }'
```

### Step 3: Upload Property Image

```bash
curl -X POST http://localhost:5000/api/upload/property-image \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "image=@apartment.jpg"

# Save the returned URL
```

### Step 4: Create a Property

```bash
curl -X POST http://localhost:5000/api/properties \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "estateId": "ESTATE_UUID_FROM_STEP_1",
    "ownerId": "OWNER_UUID_FROM_STEP_2",
    "name": "Luxury Apartment 101",
    "description": "3-bedroom apartment with modern amenities",
    "type": "Apartment",
    "bedrooms": 3,
    "bathrooms": 2,
    "area": 150.5,
    "floor": 1,
    "imageUrl": "URL_FROM_STEP_3",
    "status": "AVAILABLE"
  }'
```

### Step 5: Test Filters

```bash
# Get available properties
curl -X GET "http://localhost:5000/api/properties?status=AVAILABLE" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get properties in specific estate
curl -X GET "http://localhost:5000/api/properties?estateId=ESTATE_UUID" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get properties with 2-4 bedrooms and area between 100-200 sqm
curl -X GET "http://localhost:5000/api/properties?minBedrooms=2&maxBedrooms=4&minArea=100&maxArea=200" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Step 6: Test Owner Access

```bash
# Login as property owner
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@example.com",
    "password": "SecurePass123!"
  }'

# Property owner can only see their own properties
curl -X GET http://localhost:5000/api/properties \
  -H "Authorization: Bearer OWNER_TOKEN"
```

---

## Role-Based Access Control

### ADMIN & PROPERTY_MANAGER
- ✓ View all estates
- ✓ Create/Update/Delete estates
- ✓ View all properties
- ✓ Create/Update/Delete properties
- ✓ Change property status
- ✓ Upload property images
- ✓ Filter properties by any criteria including owner

### PROPERTY_OWNER
- ✓ View all estates (read-only)
- ✓ View only their own properties
- ✓ Update their own properties (limited fields)
- ✗ Cannot create properties
- ✗ Cannot delete properties
- ✗ Cannot change property status
- ✗ Cannot change estate or owner assignment
- ✗ Cannot upload images

---

## Business Rules Implemented

1. **Estate Deletion:** Cannot delete estate with existing properties
2. **Property Deletion:** Cannot delete property with active contracts
3. **Owner Validation:** Property owner must have PROPERTY_OWNER role
4. **Estate Validation:** Estate must exist when creating/updating property
5. **Owner Access Control:** Property owners can only view/edit their properties
6. **Status Management:** Only Admin/PM can change property status
7. **Image Upload:** Only Admin/PM can upload images
8. **File Validation:** Images must be JPEG, PNG, GIF, or WebP (max 5MB)

---

## Error Handling

### Common Errors

**Estate not found:**
```json
{
  "success": false,
  "message": "Estate not found"
}
```

**Cannot delete estate with properties:**
```json
{
  "success": false,
  "message": "Cannot delete estate with existing properties. Please delete or reassign properties first."
}
```

**Owner must be PROPERTY_OWNER:**
```json
{
  "success": false,
  "message": "Owner must have PROPERTY_OWNER role"
}
```

**Property owner access denied:**
```json
{
  "success": false,
  "message": "Access denied: You can only view your own properties"
}
```

**Invalid file type:**
```json
{
  "success": false,
  "message": "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed."
}
```

---

## PHASE 3 COMPLETE ✓

All Estates & Properties functionalities are now implemented:
- ✓ Estate CRUD operations
- ✓ Property CRUD operations
- ✓ Advanced property filters (status, estate, type, area, bedrooms)
- ✓ Role-based access control
- ✓ Property owner read-only access to their properties
- ✓ Image upload functionality
- ✓ Static file serving for uploaded images
- ✓ Input validation
- ✓ Business rules enforcement

**Next Phase:** Phase 4 - Tenants
