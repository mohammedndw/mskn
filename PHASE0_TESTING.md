# Phase 0 - Testing Guide

## Prerequisites
- PostgreSQL installed and running
- Node.js installed
- Terminal/Command Prompt

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Database
Update `.env` file with your PostgreSQL credentials:
```env
DATABASE_URL="postgresql://your_username:your_password@localhost:5432/property_management?schema=public"
```

### 3. Initialize Database
```bash
# Generate Prisma Client
npm run prisma:generate

# Create and run migrations
npm run prisma:migrate
```

When prompted for migration name, enter: `init`

### 4. Start Server
```bash
npm run dev
```

Expected output:
```
[INFO] 2025-11-22T... Database connected successfully
[INFO] 2025-11-22T... Server running in development mode on port 5000
[INFO] 2025-11-22T... Health check: http://localhost:5000/api/health
```

---

## API Testing

### Test 1: Health Check Endpoint

**cURL:**
```bash
curl http://localhost:5000/api/health
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "data": {
    "uptime": 5.123,
    "timestamp": "2025-11-22T10:30:00.000Z",
    "environment": "development"
  }
}
```

**Status Code:** 200 OK

---

### Test 2: API Information

**cURL:**
```bash
curl http://localhost:5000/api
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Property Management System API",
  "data": {
    "version": "1.0.0",
    "endpoints": {
      "health": "/api/health",
      "auth": "/api/auth (Coming in Phase 1)",
      "admin": "/api/admin (Coming in Phase 2)",
      "estates": "/api/estates (Coming in Phase 3)",
      "properties": "/api/properties (Coming in Phase 3)",
      "tenants": "/api/tenants (Coming in Phase 4)",
      "contracts": "/api/contracts (Coming in Phase 5)",
      "maintenance": "/api/maintenance (Coming in Phase 6)"
    }
  }
}
```

**Status Code:** 200 OK

---

### Test 3: 404 Error Handler

**cURL:**
```bash
curl http://localhost:5000/api/nonexistent
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Route /api/nonexistent not found"
}
```

**Status Code:** 404 Not Found

---

### Test 4: Rate Limiting

**cURL (Linux/Mac):**
```bash
for i in {1..105}; do
  curl -s http://localhost:5000/api/health | head -1
  sleep 0.1
done
```

**PowerShell (Windows):**
```powershell
1..105 | ForEach-Object {
  Invoke-RestMethod -Uri http://localhost:5000/api/health
  Start-Sleep -Milliseconds 100
}
```

After 100 requests within 15 minutes:

**Expected Response:**
```json
{
  "success": false,
  "message": "Too many requests from this IP, please try again later"
}
```

**Status Code:** 429 Too Many Requests

---

## Postman Testing

### Import Collection

Create a new Postman collection with these requests:

#### 1. Health Check
- **Method:** GET
- **URL:** `http://localhost:5000/api/health`
- **Headers:** None required

#### 2. API Info
- **Method:** GET
- **URL:** `http://localhost:5000/api`
- **Headers:** None required

#### 3. 404 Test
- **Method:** GET
- **URL:** `http://localhost:5000/api/invalid-route`
- **Headers:** None required

---

## Database Verification

### Check Prisma Studio
```bash
npm run prisma:studio
```

This opens a browser interface at `http://localhost:5555` where you can:
- View all database tables
- Verify schema structure
- Check that all models are created correctly

### Expected Tables
- User
- SubscriptionPlan
- UserSubscription
- Estate
- Property
- Tenant
- Contract
- MaintenanceRequest
- AuditLog

### Verify via SQL
```bash
# Connect to database
psql -U your_username -d property_management

# List all tables
\dt

# View User table structure
\d "User"

# Exit
\q
```

---

## Error Handling Tests

### Test Invalid JSON

**cURL:**
```bash
curl -X POST http://localhost:5000/api/test \
  -H "Content-Type: application/json" \
  -d '{invalid json}'
```

**Expected:** Error response with 400 status

---

## Security Tests

### Test CORS Headers

**cURL:**
```bash
curl -I http://localhost:5000/api/health
```

**Expected Headers:**
- `X-DNS-Prefetch-Control`
- `X-Frame-Options`
- `X-Content-Type-Options`
- `Access-Control-Allow-Origin`

---

## Performance Tests

### Response Time Check
```bash
curl -w "@-" -o /dev/null -s http://localhost:5000/api/health <<'EOF'
    time_namelookup:  %{time_namelookup}\n
       time_connect:  %{time_connect}\n
    time_appconnect:  %{time_appconnect}\n
      time_redirect:  %{time_redirect}\n
   time_starttransfer:  %{time_starttransfer}\n
                      ----------\n
          time_total:  %{time_total}\n
EOF
```

**Expected:** Total time < 100ms for local testing

---

## Logging Verification

Check terminal output for proper logging:

### Development Mode
```
[INFO] 2025-11-22T... Database connected successfully
[INFO] 2025-11-22T... Server running in development mode on port 5000
GET /api/health 200 5.123 ms - 150
```

### Error Logs
Trigger an error and verify logging:
```bash
# Stop PostgreSQL temporarily to test database error handling
# Then try to restart server

# Expected log:
[ERROR] 2025-11-22T... Database connection failed: ...
```

---

## Checklist ✅

Before moving to Phase 1, verify:

- [ ] Server starts without errors
- [ ] Database connection successful
- [ ] Health check returns 200 OK
- [ ] API info endpoint works
- [ ] 404 handler returns proper error
- [ ] Rate limiting works after 100 requests
- [ ] Error handler catches and formats errors
- [ ] CORS headers present
- [ ] Security headers (helmet) active
- [ ] Morgan logging visible in terminal
- [ ] Prisma Studio shows all tables
- [ ] All database models created correctly
- [ ] Graceful shutdown works (Ctrl+C)

---

## Troubleshooting

### Issue: Database connection failed

**Solution:**
1. Check PostgreSQL is running: `pg_isready`
2. Verify credentials in `.env`
3. Ensure database exists: `psql -l`
4. Check connection string format

### Issue: Port 5000 already in use

**Solution:**
```bash
# Change PORT in .env
PORT=5001

# Or kill process using port 5000
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac:
lsof -ti:5000 | xargs kill
```

### Issue: Prisma migration fails

**Solution:**
```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Then run migrations again
npm run prisma:migrate
```

### Issue: Module not found errors

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## Phase 0 Complete! ✅

Once all tests pass, you're ready for **Phase 1: Authentication & Users**

Phase 1 will add:
- User signup (Property Manager & Property Owner)
- User login with JWT
- Password hashing with bcrypt
- Role-Based Access Control (RBAC)
- Admin user creation
- Blocked user prevention
