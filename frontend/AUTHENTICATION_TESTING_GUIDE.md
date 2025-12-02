# Authentication System Testing Guide

## Overview
This guide provides comprehensive testing instructions for the authentication system implemented for the Property Management Platform.

## Features Implemented

### 1. **JWT Token Management** (`lib/auth.ts`)
- Save/retrieve access tokens from localStorage
- Token expiration checking
- Authorization header generation
- User data persistence

### 2. **Authentication Context** (`contexts/AuthContext.tsx`)
- Centralized auth state management
- Login/logout functionality
- Role-based access checking
- User session persistence

### 3. **Protected Routes** (`components/ProtectedRoute.tsx`)
- Route protection based on authentication
- Role-based access control (RBAC)
- Automatic redirect to login for unauthenticated users
- Access denied page for unauthorized roles

### 4. **Login Page** (`pages/login.tsx`)
- Clean, professional UI matching Property Manager design
- Email/password authentication
- Loading states
- Error handling with toast notifications

### 5. **Integration**
- All routes protected with role-based access
- User menu in header with logout
- Automatic token injection in API requests

## Testing Checklist

### Test 1: Login Functionality

#### Test 1.1: Successful Login (Property Manager)
1. Navigate to `http://localhost:5000/login`
2. Enter valid Property Manager credentials:
   - Email: `manager@example.com` (use actual test user from your database)
   - Password: `password123` (use actual password)
3. Click "Sign in"
4. **Expected Results:**
   - Toast notification: "Welcome back, [First Name]!"
   - Redirect to dashboard (`/`)
   - User menu appears in header with user's name
   - Access token stored in localStorage

#### Test 1.2: Successful Login (Admin)
1. Navigate to `http://localhost:5000/login`
2. Enter valid Admin credentials
3. Click "Sign in"
4. **Expected Results:**
   - Successfully logged in
   - Can access all pages including `/users` and `/settings`

#### Test 1.3: Successful Login (Property Owner)
1. Navigate to `http://localhost:5000/login`
2. Enter valid Property Owner credentials
3. Click "Sign in"
4. **Expected Results:**
   - Successfully logged in
   - Can access dashboard, properties, tenants, contracts
   - Cannot access `/maintenance`, `/parent-estates`, `/users`, `/settings`

#### Test 1.4: Failed Login - Invalid Credentials
1. Navigate to `http://localhost:5000/login`
2. Enter invalid credentials
3. Click "Sign in"
4. **Expected Results:**
   - Error toast notification displayed
   - Stay on login page
   - No token stored

#### Test 1.5: Blocked User Login
1. Block a user via Admin panel or database
2. Try to login with blocked user credentials
3. **Expected Results:**
   - Error message: "Your account has been blocked. Please contact support."
   - No login allowed

### Test 2: Protected Routes

#### Test 2.1: Redirect When Not Authenticated
1. Clear localStorage (or open in incognito)
2. Try to navigate directly to `http://localhost:5000/`
3. **Expected Results:**
   - Automatically redirected to `/login`

#### Test 2.2: Role-Based Access - Admin Only Routes
1. Login as Property Manager
2. Try to access:
   - `/users`
   - `/settings`
3. **Expected Results:**
   - "Access Denied" page displayed
   - Cannot access the page

#### Test 2.3: Role-Based Access - Property Manager Routes
1. Login as Property Owner
2. Try to access:
   - `/maintenance`
   - `/parent-estates`
3. **Expected Results:**
   - "Access Denied" page displayed

#### Test 2.4: Allowed Access
1. Login as Admin
2. Navigate to all routes:
   - `/` (Dashboard)
   - `/properties`
   - `/tenants`
   - `/contracts`
   - `/maintenance`
   - `/parent-estates`
   - `/users`
   - `/settings`
3. **Expected Results:**
   - All pages accessible

### Test 3: Logout Functionality

#### Test 3.1: Normal Logout
1. Login with any user
2. Click on user menu in top-right header
3. Click "Log out"
4. **Expected Results:**
   - Toast notification: "You have been successfully logged out."
   - Redirect to `/login`
   - All auth data cleared from localStorage
   - Cannot access protected routes anymore

### Test 4: Session Persistence

#### Test 4.1: Page Refresh
1. Login with any user
2. Navigate to any page (e.g., `/properties`)
3. Refresh the page (F5)
4. **Expected Results:**
   - User remains logged in
   - User data persists
   - Still on the same page

#### Test 4.2: New Tab
1. Login with any user
2. Open a new tab
3. Navigate to `http://localhost:5000/`
4. **Expected Results:**
   - User is logged in in the new tab
   - Can access protected pages

### Test 5: API Request Authorization

#### Test 5.1: Authenticated API Calls
1. Login with any user
2. Open browser DevTools → Network tab
3. Navigate to dashboard or any page that fetches data
4. Inspect the API requests (e.g., `/api/properties`)
5. **Expected Results:**
   - All requests include `Authorization: Bearer [token]` header

#### Test 5.2: Unauthenticated API Calls
1. Logout
2. Clear localStorage
3. Open browser console and run:
   ```javascript
   fetch('/api/properties').then(r => r.json()).then(console.log)
   ```
4. **Expected Results:**
   - 401 Unauthorized response

### Test 6: User Interface

#### Test 6.1: Login Page Design
1. Navigate to `/login`
2. **Expected Results:**
   - Clean, centered card design
   - Building icon header
   - "Property Manager" title
   - Email and password fields
   - "Sign in" button
   - Matches Property Manager UI design system

#### Test 6.2: User Menu
1. Login with any user
2. Check header
3. **Expected Results:**
   - User menu button shows user's first name
   - Dropdown shows:
     - Full name
     - Email
     - Role (formatted: "Administrator", "Property Manager", "Property Owner")
     - "Log out" option

#### Test 6.3: Loading States
1. Navigate to `/login`
2. Enter credentials
3. Click "Sign in"
4. **Expected Results:**
   - Button text changes to "Signing in..."
   - Button disabled during loading
   - Form fields disabled during loading

### Test 7: Edge Cases

#### Test 7.1: Direct Login Page Access When Logged In
1. Login with any user
2. Navigate to `http://localhost:5000/login`
3. **Expected Results:**
   - Automatically redirected to dashboard (`/`)

#### Test 7.2: Token Expiration
1. Login with any user
2. Manually expire the token (modify `exp` in localStorage token)
3. Try to access any page or API
4. **Expected Results:**
   - Should handle expired token gracefully
   - May need to implement token refresh logic in future

#### Test 7.3: Invalid Token
1. Login with any user
2. Manually corrupt the token in localStorage
3. Refresh the page
4. **Expected Results:**
   - Auth state cleared
   - Redirected to login

## Role-Based Access Control Matrix

| Route | ADMIN | PROPERTY_MANAGER | PROPERTY_OWNER |
|-------|-------|------------------|----------------|
| `/` (Dashboard) | ✅ | ✅ | ✅ |
| `/properties` | ✅ | ✅ | ✅ |
| `/tenants` | ✅ | ✅ | ✅ |
| `/contracts` | ✅ | ✅ | ✅ |
| `/maintenance` | ✅ | ✅ | ❌ |
| `/parent-estates` | ✅ | ✅ | ❌ |
| `/users` | ✅ | ❌ | ❌ |
| `/settings` | ✅ | ❌ | ❌ |
| `/login` | Public | Public | Public |
| `/tenant/:token` | Public | Public | Public |

## Manual Testing Commands

### Test Login API Directly
```bash
# Test login endpoint
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

### Check localStorage in Browser Console
```javascript
// Check access token
localStorage.getItem('access_token')

// Check user data
JSON.parse(localStorage.getItem('user'))

// Clear auth data
localStorage.removeItem('access_token')
localStorage.removeItem('user')
```

## Common Issues & Solutions

### Issue 1: CORS Errors
**Solution:** Ensure backend CORS is configured to allow frontend origin.

### Issue 2: 401 Unauthorized on API Calls
**Solution:** Check that Authorization header is being sent. Verify token is valid.

### Issue 3: Infinite Redirect Loop
**Solution:** Check that `/login` route is not protected. Verify ProtectedRoute logic.

### Issue 4: User Data Not Persisting
**Solution:** Verify saveUser() is called after login. Check localStorage.

### Issue 5: Toast Not Showing
**Solution:** Ensure `<Toaster />` component is in App.tsx. Verify useToast hook.

## Next Steps

After authentication is working:
1. Implement token refresh mechanism
2. Add "Remember Me" functionality
3. Add password reset flow
4. Add 2FA (optional)
5. Complete Admin UI
6. Build Property Owner UI
7. Add activity logging for security

## Files Modified/Created

### New Files:
- `frontend/client/src/lib/auth.ts`
- `frontend/client/src/contexts/AuthContext.tsx`
- `frontend/client/src/components/ProtectedRoute.tsx`
- `frontend/client/src/pages/login.tsx`

### Modified Files:
- `frontend/client/src/App.tsx`
- `frontend/client/src/lib/queryClient.ts`

## Backend Requirements

Ensure these backend endpoints exist:
- `POST /api/auth/login` - Returns `{ token, user }`
- All protected endpoints verify JWT token
- User object includes: `id`, `email`, `firstName`, `lastName`, `role`, `isBlocked`
