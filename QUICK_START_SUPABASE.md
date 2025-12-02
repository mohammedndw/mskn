# Quick Start: Setting Up Supabase Database

Follow these steps to get your Property Management System running with Supabase.

---

## Step 1: Create Supabase Project (5 minutes)

1. Go to [https://supabase.com](https://supabase.com) and sign up/login
2. Click **"New Project"**
3. Fill in:
   - **Project Name**: `property-management`
   - **Database Password**: Create a strong password (SAVE THIS!)
   - **Region**: Choose closest to you (e.g., Middle East/Asia)
4. Click **"Create new project"** and wait for setup

---

## Step 2: Get Your Database URL (2 minutes)

1. In your Supabase dashboard, go to **Settings** → **Database**
2. Scroll to **Connection string** section
3. Click **"Connection pooling"** tab
4. Select **"Transaction"** mode
5. Copy the connection string (looks like):
   ```
   postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-xx.pooler.supabase.com:6543/postgres
   ```

---

## Step 3: Update .env File (1 minute)

1. Open `.env` file in your project root
2. Replace the `DATABASE_URL` with your Supabase connection string:

```env
DATABASE_URL="postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-xx.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

**Important:** Replace `[YOUR-PASSWORD]` with your actual database password!

---

## Step 4: Test Database Connection (1 minute)

Run the test script to verify your connection:

```bash
npm run test:db
```

Expected output:
```
✅ Successfully connected to database!
✅ Database query successful!
✅ Found 0 tables in database
```

If you see errors, check:
- Your DATABASE_URL is correct
- Password doesn't have special characters (or URL encode them)
- Your Supabase project is active

---

## Step 5: Generate Prisma Client (1 minute)

```bash
npm run prisma:generate
```

This generates the Prisma Client based on your schema.

---

## Step 6: Run Database Migrations (2 minutes)

Create all database tables:

```bash
npm run prisma:migrate
```

When prompted for migration name, type: `init`

This creates all tables:
- User
- SubscriptionPlan
- UserSubscription
- Estate
- Property
- Tenant
- Contract
- MaintenanceRequest
- AuditLog
- Settings

---

## Step 7: Create Admin User (1 minute)

```bash
npm run seed:admin
```

This creates an admin account:
- **Email**: admin@propmanage.com
- **Password**: Admin@123

---

## Step 8: Verify in Supabase Dashboard (1 minute)

1. Go to your Supabase project
2. Click **"Table Editor"** in sidebar
3. You should see all 10 tables
4. Click on **"User"** table to see your admin user

---

## Step 9: Start Your Server (1 minute)

```bash
npm run dev
```

Server starts at: `http://localhost:5000`

---

## Step 10: Test the API (1 minute)

### Test Health Endpoint

Open a new terminal and run:

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "data": {
    "status": "ok"
  }
}
```

### Test Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"admin@propmanage.com\", \"password\": \"Admin@123\"}"
```

Expected response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "...",
      "email": "admin@propmanage.com",
      "role": "ADMIN",
      ...
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## 🎉 You're Done!

Your Property Management System is now running with Supabase!

---

## Useful Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run test:db` | Test database connection |
| `npm run prisma:studio` | Open visual database editor |
| `npm run seed:admin` | Create admin user |
| `npm run prisma:generate` | Generate Prisma Client |
| `npm run prisma:migrate` | Run database migrations |

---

## Next Steps

1. **Start Frontend**: Go to `frontend/` directory and start the React app
2. **Login**: Use admin credentials to login
3. **Create Users**: Add Property Managers and Property Owners
4. **Add Data**: Create estates, properties, tenants, and contracts

---

## Troubleshooting

### "Can't reach database server"
- Check DATABASE_URL in `.env`
- Verify password is correct
- Make sure Supabase project is active

### "Table doesn't exist"
- Run migrations: `npm run prisma:migrate`

### "Admin already exists"
- That's okay! Use existing credentials to login

### View Detailed Logs
- Check Supabase dashboard → **Logs**
- Look at server console output

---

## Need More Help?

📖 See detailed guide: `SUPABASE_SETUP.md`

🚀 Deployment guide: `DEPLOYMENT_GUIDE.md`

📝 Testing guides: `PHASE_*_TESTING.md`

---

## What You Have Now

✅ Cloud PostgreSQL database (Supabase)
✅ All 10 database tables created
✅ Admin user account
✅ Backend server running
✅ JWT authentication working
✅ All API endpoints ready

**Total Setup Time: ~15 minutes**
