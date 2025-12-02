You are a senior full-stack engineer specializing in:

React (frontend)

Node.js + Express + PostgreSQL + Prisma (backend)

System architecture

Clean code + best practices

Your task is to complete both backend & frontend of my graduation project.

🚩 IMPORTANT PROJECT STATUS
✔ I ALREADY COMPLETED:

Frontend: Property Manager UI

Backend: Phase 0, Phase 1, Phase 2, Phase 3
(Setup, Authentication, Admin basics, Properties/Estates)

✔ YOU MUST:

Review backend Phases 0–3

If correct → keep untouched

If something is missing → update only the necessary parts

DO NOT rewrite or restructure everything

DO NOT break my existing frontend

Then continue backend from Phase 4 → Phase 7

Implement all remaining frontend with EXACT SAME DESIGN, COMPONENTS, SPACING, STYLING, AND LAYOUT** I used for Property Manager UI.

Follow detailed phase requirements below.

=============================================
🎯 FULL SYSTEM DESCRIPTION
=============================================

We have 4 actors:

1. ADMIN

Full system supervisor.

2. PROPERTY MANAGER

Main user — manages estates, properties, tenants, contracts, maintenance.

3. PROPERTY OWNER

Side actor — can only view their own data.

4. TENANT PORTAL

Link-based access: tenant can view contracts and send maintenance requests.

=============================================
🧩 DETAILED BACKEND PHASES
=============================================

You MUST follow these phases EXACTLY.
Every phase must include:
✓ controllers
✓ services
✓ routes
✓ validation
✓ Prisma updates
✓ security
✓ testing instructions
✓ sample requests

🚀 PHASE 0 — SYSTEM SETUP (Already Done – Review Only)

Review and ONLY fix if needed:

Required Structure:

Express server

Folder architecture:
/routes, /controllers, /services, /middlewares, /prisma, /utils, /validators

CORS, Helmet, JSON parser

Error handler

Logging

Prisma connected to PostgreSQL

.env variables

Deliverable:

If something missing → patch minimal fix.

🔐 PHASE 1 — Authentication & Users (Already Done – Review Only)

Review and update only if necessary:

Required:

User signup (roles: PROPERTY_MANAGER, PROPERTY_OWNER)

Login with JWT

Password hashing (bcrypt)

Blocked user cannot log in

RBAC middleware

Admin create user endpoint

Validation schemas

Duplicate email/national_id protection

🛠 PHASE 2 — Admin Module (Already Done – Review Only)

Must include:

Admin Functionalities:

Dashboard metrics:

total users

total properties

total tenants

total contracts

active subscriptions

maintenance requests count

User Management:

list users

view user details

update user

change role

block/unblock

delete user

Subscription plan (single plan) CRUD

Manage user subscription: activate, expire, cancel

🏘 PHASE 3 — Estates & Properties (Already Done – Review Only)

Must include:

Parent Estate:

Create

List

Update

Delete

Property:

Create property with:

property details

address

features

ownerId

image upload

optional estateId

List properties with filters:

status: available/reserved/rented

by estate

Update property

Delete property

Auto-status change via contract

If missing, patch minimal fix.

=============================================
🧑‍🤝‍🧑 PHASE 4 — Tenants (Backend)
=============================================
Implement Full Tenant Module:
Property Manager:

Add tenant:

firstName

lastName

phone

email

nationalId

birthDate

List all tenants

View tenant details

Update tenant

Delete tenant

Link rented property (optional)

Property Owner:

Read-only: list tenants renting his properties

Validation Rules:

nationalId = 10 digits

email format

phone = 05XXXXXXXX

birthDate < today

Deliverables:

Routes

Controllers

Services

Prisma model relations

Validation

Unit tests / sample requests

=============================================
📄 PHASE 5 — Contracts + Tenant Portal
=============================================
Contract Module

Property Manager can:

Create contract:

propertyId

tenantId

ownerId auto-linked

price

startDate

endDate

paymentFrequency: ONCE or TWICE

Generate contract document (HTML/PDF)

Save document URL

Auto update property status

Generate tenant portal token

Show contract detail

Edit contract

List all contracts with:

days until expiration

tenant portal link

Tenant Portal (Backend APIs):

Tenant (via token link) can:

View all their contracts

Send maintenance requests

Token Structure:

JWT containing:

tenantNationalId

contractId

expiration date

=============================================
🛠 PHASE 6 — Maintenance Requests
=============================================
Tenant:

Create maintenance request:

title

description

images (optional)

status = pending

Property Manager:

View maintenance requests

Update status:

pending → in_progress → done/rejected

Add internal notes (optional)

Admin:

View all maintenance requests

=============================================
⚙️ PHASE 7 — System Settings + Audit Logs + Documentation
=============================================
Settings:

System-wide config fields

Company info fields

Notification settings

Audit Logs:

Track actions (user creation, property update, etc.)

API Documentation:

Full Swagger/OpenAPI page

Authentication flows

Error codes

Schema definitions

Deployment:

Environment variables

Prisma migration

Production build steps

=============================================
🎨 FRONTEND COMPLETION REQUIREMENTS
=============================================

I have completed the entire Property Manager UI.

You MUST build all missing actors’ frontend using the SAME:

design system

styling

spacing

components

modals

tables

forms

color palette

layout structure

NO new design is allowed.
Everything must visually match the Property Manager UI.

🟦 FRONTEND PHASE A — Admin UI
Pages Required:

Login

Dashboard

User Management

list

view/edit

create

block/unblock

Subscription Plan page

Subscription assignment page

Maintenance view (list all tickets)

Settings page

🟩 FRONTEND PHASE B — Property Owner UI
Pages Required:

Login

Dashboard

Properties list

Tenants list

Contracts list

Read-only access only.


🟪 FRONTEND PHASE c — Routing & UI Integration

Protect routes by role

404 page

Shared components

API integration

Reusable services

Error handling

Toast notifications

=============================================
🧾 CHECKLIST (MUST BE COMPLETED BEFORE ANY OUTPUT)
=============================================

Claude must check ALL of the following before writing any code:

✔ GENERAL

[ ] I re-read ALL instructions
[ ] I understand backend Phases 0–3 already exist
[ ] I will only patch Phases 0–3 if necessary
[ ] I will continue backend from Phase 4
[ ] I will build remaining frontend using the same UI design
[ ] I will not break existing functionality
[ ] I will provide routes, controllers, services, validation
[ ] I will provide sample test requests
[ ] I will provide UI component code in React
[ ] I will maintain code cleanliness

✔ BACKEND PHASE CHECKS (for the active phase)

[ ] Prisma models correct
[ ] Security correct (JWT, bcrypt, RBAC)
[ ] Validation included
[ ] REST response format used
[ ] Business logic enforced

✔ FRONTEND PHASE CHECKS (for active FE phase)

[ ] UI matches Property Manager design
[ ] Uses same components and patterns
[ ] Pages fully functional
[ ] Integrated with backend APIs

🧨 OUTPUT RULE

Before giving ANY code, Claude MUST start with:

"I have re-read all instructions and completed all items in the checklist for this phase. The output below fully follows the instructions."

Then provide the deliverables for the current phase only.

🚀 START NOW

Review backend Phases 0–3 → update ONLY if needed

Continue with Backend Phase 4