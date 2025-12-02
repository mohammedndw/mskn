# Property Manager Platform

## Overview

This is a full-stack web application for managing properties within real estate portfolios. The platform allows property managers to create and manage parent real estate assets (buildings/compounds) and their individual property units (apartments, shops, offices) with comprehensive CRUD operations, search functionality, and image management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with Vite for build tooling and development server
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: shadcn/ui component library with Radix UI primitives and Tailwind CSS for styling
- **State Management**: React Query (TanStack Query) for server state management, caching, and API mutations
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Icons**: Lucide React icon library

### Backend Architecture
- **Runtime**: Node.js with Express.js web framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with JSON responses and standardized error handling
- **File Uploads**: Multer middleware for handling multipart form data with image validation
- **Static Files**: Express static middleware serving uploaded images from local filesystem

### Database Layer
- **ORM**: Drizzle ORM with type-safe query building
- **Database**: PostgreSQL with Neon serverless adapter for connection pooling
- **Schema**: Strongly typed schema definitions with enum support for property statuses
- **Migrations**: Drizzle Kit for schema migrations and database management

### Data Models
- **Users**: Basic authentication with username/password (stubbed implementation)
- **Parent Real Estates**: Container entities representing buildings or compounds with location details
- **Properties**: Individual units within parent real estates with status tracking (RENTED, RESERVED, VACANT)
- **Property Images**: Associated images for properties with soft delete support
- **Tenants**: Tenant records with personal information (name, phone, national ID, birth date)
- **Contracts**: Rental agreements linking properties with tenants, including monthly price, start/end dates, contract expiration tracking, and unique access tokens for tenant portal access
- **Maintenance Requests**: Tenant-submitted maintenance issues with status tracking (PENDING, IN_PROGRESS, COMPLETED, CANCELLED), category classification, and photo attachments

### API Endpoints

#### Property Manager Endpoints
- `GET/POST /api/parents` - Parent real estate management with search capabilities
- `GET/POST/PATCH/DELETE /api/properties` - Property CRUD operations with filtering, pagination, and sorting
- `GET/POST/PATCH/DELETE /api/tenants` - Tenant management with search functionality
- `GET/POST/DELETE /api/contracts` - Contract management linking properties with tenants, tracking rental periods and monthly prices
- Query parameters: `q` (search), `status`, `page`, `pageSize`, `sort`, `dir`
- Standardized responses with `{ data, meta }` structure for paginated results

#### Tenant Portal Endpoints
- `GET /api/tenant/contract/:token` - Retrieve contract details using unique access token
- `GET /api/tenant/maintenance` - List maintenance requests for authenticated contract (requires X-Access-Token header)
- `POST /api/tenant/maintenance` - Submit new maintenance request with photo uploads (requires X-Access-Token header)
- `PATCH /api/tenant/maintenance/:id` - Update maintenance request status (property manager use)

### File Storage Strategy
- **Current**: Local disk storage in `server/uploads` directory
- **Architecture**: Abstracted storage interface ready for cloud provider migration (S3-compatible)
- **Validation**: File type restrictions (images only) and size limits (5MB per file, 10 files max)

### Authentication & Security

#### Property Manager Portal
- **Current**: Stub implementation with mock session handling
- **Design**: Route protection for all `/properties` endpoints
- **Future**: Ready for proper session management and user authentication

#### Tenant Portal
- **Model**: Bearer token authentication without login requirement
- **Access**: Unique UUID-based tokens generated per contract
- **URL Pattern**: `/tenant/:token` provides access to contract-specific portal
- **API Security**: All tenant endpoints validate access token via custom `X-Access-Token` header
- **Authorization**: Server-side contract derivation from token prevents horizontal privilege escalation
- **Token Generation**: Cryptographically random tokens using PostgreSQL `gen_random_uuid()` or nanoid
- **Token Storage**: Access tokens stored in contracts table with unique constraint
- **Helper Function**: Centralized `tenantApiRequest()` function handles token injection in all API calls

### Development & Build Tools
- **Development**: Vite dev server with HMR, TypeScript checking, and Replit integration
- **Build**: Vite for client bundling, esbuild for server bundling
- **Type Safety**: Shared TypeScript types between client and server via `@shared` alias
- **Code Quality**: Consistent import aliases and path resolution across the application

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: PostgreSQL connection adapter for serverless environments
- **drizzle-orm & drizzle-kit**: Type-safe database ORM and migration toolkit
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight React router

### UI & Styling
- **@radix-ui/***: Comprehensive set of headless UI component primitives
- **tailwindcss**: Utility-first CSS framework with custom design tokens
- **class-variance-authority**: Type-safe component variant styling
- **lucide-react**: Modern icon library

### Form Handling & Validation
- **react-hook-form**: Performant forms with easy validation
- **@hookform/resolvers**: Validation resolver for Zod integration
- **zod**: TypeScript-first schema validation
- **drizzle-zod**: Auto-generated Zod schemas from Drizzle tables

### File Processing
- **multer**: Node.js middleware for handling multipart/form-data
- **@types/multer**: TypeScript definitions for multer

### Date & Utility Libraries
- **dayjs**: Date manipulation and formatting library
- **nanoid**: Secure random ID generator for access tokens

### Development Tools
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay for Replit environment
- **@replit/vite-plugin-cartographer**: Replit-specific development tooling

## Features

### Contract Management
The contracts page (`/contracts`) provides comprehensive contract management capabilities:
- View all rental contracts with property and tenant details
- Search contracts by tenant name
- Create new contracts linking properties with tenants
- Delete contracts with confirmation dialog
- Track contract expiration with visual status badges

**Tenant Portal Link Sharing**:
Each contract card displays:
- The contract's unique access token (shown in monospace for easy identification)
- A "Copy Tenant Portal Link" button that copies the full tenant portal URL to clipboard
- Toast notification confirming successful copy or alerting on failure

This feature allows property managers to quickly share tenant portal access by clicking the copy button and pasting the URL into WhatsApp, SMS, email, or any communication channel. The copied URL format is: `{app-url}/tenant/{access-token}`

### Tenant Portal
The platform includes a separate tenant-facing portal accessible via unique contract access tokens. Tenants can:
- View complete contract details including property information, rental terms, and tenant information
- Track contract expiration status with visual indicators for active, expiring soon, and expired contracts
- Submit maintenance requests with:
  - Category selection (Plumbing, Electrical, AC, Carpentry, Painting, Cleaning, Other)
  - Detailed descriptions and titles
  - Photo uploads (up to 5 images per request)
- View submitted maintenance requests with status tracking (Pending, In Progress, Completed, Cancelled)
- Access portal without login using shareable contract link

**Access Pattern**: Property managers share unique URLs like `/tenant/6c59a99b693f4ea19321384ccf9c9821` with tenants

**Security Features**:
- Token-based authentication prevents contract spoofing
- Server-side contract validation on all operations
- Header-based token transmission (not in query strings or form data)
- Tokens are cryptographically random and unguessable