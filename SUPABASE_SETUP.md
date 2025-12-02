# Supabase Database Setup Guide

This guide will help you set up Supabase as your PostgreSQL database for the Property Management System.

---

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click **"New Project"**
4. Fill in the project details:
   - **Project Name**: `property-management` (or your preferred name)
   - **Database Password**: Create a strong password (SAVE THIS!)
   - **Region**: Choose the closest region to your users (e.g., Middle East/Asia)
   - **Pricing Plan**: Free tier is sufficient for development
5. Click **"Create new project"** and wait 1-2 minutes for setup

---

## Step 2: Get Your Database Connection String

### Option A: Using Connection Pooler (Recommended for Production)

1. In your Supabase project dashboard, go to **Settings** → **Database**
2. Scroll down to **Connection string** section
3. Select **"Connection pooling"** tab
4. Choose **"Transaction"** mode
5. Copy the connection string that looks like:
   ```
   postgresql://postgres.xxxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
   ```

### Option B: Direct Connection (Good for Development)

1. In **Settings** → **Database**
2. Select **"Connection string"** tab
3. Choose **"URI"**
4. Copy the connection string that looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
   ```

**Important:** Replace `[YOUR-PASSWORD]` with the actual database password you created in Step 1.

---

## Step 3: Update Your .env File

Open your `.env` file and update the `DATABASE_URL`:

```env
# Database (Supabase)
DATABASE_URL="postgresql://postgres.xxxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# For Direct Connection (alternative)
# DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Server Configuration
PORT=5000
NODE_ENV="development"

# CORS Configuration
CORS_ORIGIN="http://localhost:5173"

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR="./uploads"
```

**Connection Pooler vs Direct Connection:**
- **Connection Pooler** (`pgbouncer=true`): Better for production, handles many connections efficiently
- **Direct Connection**: Simpler for development, no pooler overhead

---

## Step 4: Install Dependencies (if not already done)

```bash
npm install
```

---

## Step 5: Generate Prisma Client

```bash
npm run prisma:generate
```

This will generate the Prisma Client based on your schema.

---

## Step 6: Run Database Migrations

Now create all the tables in your Supabase database:

```bash
npm run prisma:migrate dev
```

You'll be prompted to name the migration. You can use: `init` or `initial_setup`

This command will:
- Create all database tables (User, Estate, Property, Tenant, Contract, etc.)
- Set up all relationships
- Create all indexes
- Apply all constraints

---

## Step 7: Verify Database Setup

### Option A: Check in Supabase Dashboard

1. Go to your Supabase project
2. Click on **"Table Editor"** in the left sidebar
3. You should see all your tables:
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

### Option B: Use Prisma Studio (Visual Database Editor)

```bash
npx prisma studio
```

This will open a browser window at `http://localhost:5555` where you can view and edit your database.

---

## Step 8: Seed the Database (Optional)

Create an admin user and default settings:

### Create Admin User Script

Create a file `scripts/seed-admin.js`:

```javascript
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('Admin@123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@property.com' },
    update: {},
    create: {
      email: 'admin@property.com',
      password: hashedPassword,
      firstName: 'System',
      lastName: 'Administrator',
      phone: '0500000000',
      nationalId: '1000000000',
      role: 'ADMIN',
      isBlocked: false,
    },
  });

  console.log('✅ Admin user created:', admin.email);
  console.log('   Email: admin@property.com');
  console.log('   Password: Admin@123');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Run the seed script:

```bash
node scripts/seed-admin.js
```

---

## Step 9: Start Your Server

```bash
npm run dev
```

Your server should start successfully and connect to Supabase!

---

## Step 10: Test the Connection

Test the health endpoint:

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "data": {
    "status": "ok",
    "timestamp": "2024-11-24T..."
  }
}
```

Test login with admin credentials:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@property.com",
    "password": "Admin@123"
  }'
```

---

## Troubleshooting

### Error: "Can't reach database server"

**Solution:**
1. Check your DATABASE_URL is correct
2. Verify your password doesn't have special characters that need URL encoding
3. Make sure your IP is allowed (Supabase allows all IPs by default)
4. Try switching between pooler and direct connection

### Error: "SSL connection required"

**Solution:** Add `?sslmode=require` to your DATABASE_URL:
```
DATABASE_URL="postgresql://...?sslmode=require"
```

### Error: "Prepared statement already exists"

**Solution:** This happens with connection pooler. Add `?pgbouncer=true` to your DATABASE_URL:
```
DATABASE_URL="postgresql://...?pgbouncer=true"
```

### Migration Errors

**Solution:** If migrations fail, you can reset the database:
```bash
npx prisma migrate reset
```
⚠️ Warning: This will delete all data!

---

## Supabase Best Practices

### 1. Connection Pooling
For production, always use the connection pooler to handle multiple connections efficiently.

### 2. Database Backups
Supabase automatically backs up your database daily. You can restore from backups in the dashboard.

### 3. Database Password
Store your database password securely. Never commit `.env` to version control.

### 4. Monitor Usage
Check your Supabase dashboard regularly to monitor:
- Database size
- API requests
- Active connections

### 5. Row Level Security (Optional)
Supabase supports Row Level Security (RLS). Since you're using Prisma with your own API, RLS is optional but can add an extra security layer.

---

## Additional Supabase Features You Can Use

### 1. Database Functions
Create custom PostgreSQL functions in Supabase dashboard under **Database** → **Functions**

### 2. Realtime Subscriptions (Optional)
Enable realtime for tables to get live updates in your frontend

### 3. Database Webhooks
Set up webhooks to trigger actions when data changes

### 4. Point-in-Time Recovery (Paid Plans)
Available on Pro plan for database recovery to any point in time

---

## Production Deployment Checklist

Before deploying to production:

- [ ] Use connection pooler
- [ ] Change JWT_SECRET to a strong random value
- [ ] Update CORS_ORIGIN to your production frontend URL
- [ ] Set NODE_ENV to "production"
- [ ] Enable database backups
- [ ] Set up monitoring and alerts
- [ ] Review and optimize database indexes
- [ ] Test all API endpoints
- [ ] Run security audit

---

## Need Help?

- **Supabase Documentation**: https://supabase.com/docs
- **Prisma + Supabase Guide**: https://supabase.com/docs/guides/integrations/prisma
- **Community Support**: https://github.com/supabase/supabase/discussions

---

## Summary

You're now using Supabase as your PostgreSQL database! Your Property Management System is connected to a cloud database that's:
- ✅ Fully managed
- ✅ Automatically backed up
- ✅ Scalable
- ✅ Secure
- ✅ Free tier available

Next steps: Start your server and begin testing your application!
