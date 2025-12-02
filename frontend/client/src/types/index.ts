// Type definitions for the frontend

export type PropertyStatus = 'AVAILABLE' | 'RESERVED' | 'RENTED';

export type PropertyType = 'unit' | 'parent' | 'all';

export interface ParentRealEstate {
  id: string;
  name: string;
  description?: string;
  region: string;
  city: string;
  street?: string;
  address: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    properties: number;
  };
}

export interface PropertyImage {
  id: string;
  propertyId: string;
  url: string;
  alt?: string;
  createdAt: string;
}

export interface PropertyWithDetails {
  id: string;
  estateId: string;
  name: string;
  description?: string;
  type: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  floor?: number;
  imageUrl?: string;
  status: PropertyStatus;
  ownerId?: string;
  createdAt: string;
  updatedAt: string;
  estate?: {
    id: string;
    name: string;
    city: string;
    region: string;
    street?: string;
    address?: string;
  };
  owner?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  contracts?: Array<{
    id: string;
    startDate: string;
    endDate: string;
    tenant?: {
      firstName: string;
      lastName: string;
    };
  }>;
}

export interface Tenant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nationalId: string;
  birthDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContractWithDetails {
  id: string;
  propertyId: string;
  tenantId: string;
  price: number;
  startDate: string;
  endDate: string;
  paymentFrequency: 'MONTHLY' | 'QUARTERLY' | 'SEMI_ANNUALLY' | 'ANNUALLY';
  tenantPortalToken?: string;
  tenantPortalLink?: string;
  documentUrl?: string;
  daysUntilExpiration?: number;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
  property: {
    id: string;
    name: string;
    city: string;
    region?: string;
    address?: string;
    street?: string;
    neighborhood?: string;
    description?: string;
    numberOfRooms?: number;
    numberOfBathrooms?: number;
    sqm?: number;
    estate?: {
      id: string;
      name: string;
      city: string;
      region: string;
      address: string;
    };
    owner?: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    };
  };
  tenant: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
    nationalId?: string;
  };
  maintenanceRequests?: MaintenanceRequest[];
}

export interface MaintenanceRequest {
  id: string;
  contractId: string;
  category: string;
  title: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  photoUrls: string[];
  createdAt: string;
  updatedAt: string;
  contract?: {
    id: string;
    property: {
      name: string;
      address: string;
    };
    tenant: {
      firstName: string;
      lastName: string;
    };
  };
}
