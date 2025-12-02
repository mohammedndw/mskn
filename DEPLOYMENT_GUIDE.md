# Deployment Guide - Property Management System

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Application Deployment](#application-deployment)
5. [Production Checklist](#production-checklist)
6. [Monitoring and Maintenance](#monitoring-and-maintenance)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- **Node.js**: v16.x or higher
- **PostgreSQL**: v12.x or higher
- **npm** or **yarn**: Latest version
- **Git**: For version control

### Production Server Requirements
- **RAM**: Minimum 2GB (4GB recommended)
- **CPU**: 2 cores minimum (4 cores recommended)
- **Storage**: 20GB minimum (SSD recommended)
- **OS**: Ubuntu 20.04 LTS or higher (CentOS 7+ also supported)

---

## Environment Setup

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd mskn1
```

### 2. Install Dependencies

```bash
npm install --production
```

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```env
# Server Configuration
NODE_ENV=production
PORT=5000

# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/property_management?schema=public"

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Security
BCRYPT_ROUNDS=10

# CORS Configuration
CORS_ORIGIN=https://yourdomain.com

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**IMPORTANT SECURITY NOTES:**
- Generate a strong JWT_SECRET using: `openssl rand -base64 64`
- Never commit `.env` file to version control
- Use different secrets for development and production
- Restrict CORS_ORIGIN to your frontend domain only

---

## Database Setup

### 1. Install PostgreSQL

#### Ubuntu/Debian:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

#### CentOS/RHEL:
```bash
sudo yum install postgresql-server postgresql-contrib
sudo postgresql-setup initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Create Database and User

```bash
# Login to PostgreSQL
sudo -u postgres psql

# Create database user
CREATE USER property_admin WITH PASSWORD 'your-secure-password';

# Create database
CREATE DATABASE property_management OWNER property_admin;

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE property_management TO property_admin;

# Exit
\q
```

### 3. Run Migrations

```bash
# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Initialize default settings (optional)
# Run this via API after first deployment: POST /api/settings/initialize
```

### 4. Verify Database Connection

```bash
npm run prisma:studio
# Opens Prisma Studio on http://localhost:5555
```

---

## Application Deployment

### Option 1: PM2 Process Manager (Recommended)

#### Install PM2
```bash
npm install -g pm2
```

#### Create PM2 Ecosystem File

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'property-management-api',
    script: './src/server.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G',
    watch: false
  }]
};
```

#### Start Application
```bash
# Create logs directory
mkdir -p logs

# Start application
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

# Setup PM2 to start on system boot
pm2 startup
```

#### PM2 Commands
```bash
# Status
pm2 status

# Logs
pm2 logs property-management-api

# Restart
pm2 restart property-management-api

# Stop
pm2 stop property-management-api

# Delete
pm2 delete property-management-api

# Monitor
pm2 monit
```

### Option 2: Systemd Service

Create `/etc/systemd/system/property-management.service`:

```ini
[Unit]
Description=Property Management API
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/property-management
Environment=NODE_ENV=production
ExecStart=/usr/bin/node src/server.js
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=property-management

[Install]
WantedBy=multi-user.target
```

#### Start Service
```bash
sudo systemctl daemon-reload
sudo systemctl start property-management
sudo systemctl enable property-management
sudo systemctl status property-management
```

### Option 3: Docker Deployment

#### Create Dockerfile

```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .

RUN npx prisma generate

EXPOSE 5000

CMD ["node", "src/server.js"]
```

#### Create docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_USER: property_admin
      POSTGRES_PASSWORD: your-secure-password
      POSTGRES_DB: property_management
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  api:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://property_admin:your-secure-password@postgres:5432/property_management
      - JWT_SECRET=your-jwt-secret
    depends_on:
      - postgres
    volumes:
      - ./uploads:/app/uploads

volumes:
  postgres_data:
```

#### Deploy with Docker
```bash
docker-compose up -d
docker-compose logs -f api
```

---

## Nginx Reverse Proxy Setup

### 1. Install Nginx

```bash
sudo apt install nginx
```

### 2. Create Nginx Configuration

Create `/etc/nginx/sites-available/property-management`:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    # SSL Configuration (after obtaining SSL certificate)
    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Logging
    access_log /var/log/nginx/property-management-access.log;
    error_log /var/log/nginx/property-management-error.log;

    # Request size limit
    client_max_body_size 10M;

    # Proxy to Node.js application
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Serve uploaded files
    location /uploads {
        alias /var/www/property-management/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

### 3. Enable Site and Restart Nginx

```bash
sudo ln -s /etc/nginx/sites-available/property-management /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4. Obtain SSL Certificate (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

---

## Production Checklist

### Security
- [ ] Change default JWT_SECRET to a strong random value
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS for specific domains only
- [ ] Set up firewall (UFW/iptables)
- [ ] Disable unnecessary database ports from public access
- [ ] Enable rate limiting
- [ ] Set strong database passwords
- [ ] Keep Node.js and dependencies updated

### Performance
- [ ] Enable Gzip compression in Nginx
- [ ] Set up caching headers for static files
- [ ] Use PM2 cluster mode for multiple instances
- [ ] Configure database connection pooling
- [ ] Set up CDN for uploaded files (optional)
- [ ] Enable database query optimization

### Monitoring
- [ ] Set up application logging
- [ ] Configure error tracking (Sentry, Rollbar, etc.)
- [ ] Set up uptime monitoring
- [ ] Configure database backups
- [ ] Set up PM2 monitoring (if using PM2)
- [ ] Enable Nginx access/error logs

### Backups
- [ ] Set up automated database backups
- [ ] Configure file upload backups
- [ ] Test backup restoration process
- [ ] Document backup retention policy

---

## Database Backup and Restore

### Automated Daily Backups

Create `/etc/cron.daily/backup-property-db`:

```bash
#!/bin/bash

BACKUP_DIR="/var/backups/property-management"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="property_management"
DB_USER="property_admin"

mkdir -p $BACKUP_DIR

# Backup database
pg_dump -U $DB_USER $DB_NAME | gzip > $BACKUP_DIR/db_backup_$DATE.sql.gz

# Keep only last 30 days of backups
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +30 -delete

# Backup uploads directory
tar -czf $BACKUP_DIR/uploads_backup_$DATE.tar.gz /var/www/property-management/uploads
find $BACKUP_DIR -name "uploads_backup_*.tar.gz" -mtime +30 -delete
```

Make it executable:
```bash
sudo chmod +x /etc/cron.daily/backup-property-db
```

### Manual Backup

```bash
# Database backup
pg_dump -U property_admin property_management > backup.sql

# With compression
pg_dump -U property_admin property_management | gzip > backup.sql.gz
```

### Restore from Backup

```bash
# Restore database
psql -U property_admin property_management < backup.sql

# From compressed backup
gunzip < backup.sql.gz | psql -U property_admin property_management
```

---

## Monitoring and Maintenance

### Application Health Check

```bash
# Check if API is responding
curl http://localhost:5000/api/health

# Expected response:
# {"success":true,"message":"Server is running","data":{...}}
```

### Log Management

#### PM2 Logs
```bash
# View logs
pm2 logs property-management-api

# Clear logs
pm2 flush
```

#### System Logs
```bash
# Application logs (if using systemd)
sudo journalctl -u property-management -f

# Nginx logs
sudo tail -f /var/log/nginx/property-management-access.log
sudo tail -f /var/log/nginx/property-management-error.log
```

### Database Maintenance

```bash
# Connect to database
psql -U property_admin property_management

# Check database size
SELECT pg_size_pretty(pg_database_size('property_management'));

# Vacuum and analyze
VACUUM ANALYZE;

# Check active connections
SELECT count(*) FROM pg_stat_activity;
```

### Audit Log Cleanup

Set up a cron job to clean old audit logs:

```bash
# Create cleanup script
cat > /var/www/property-management/scripts/cleanup-audit-logs.sh << 'EOF'
#!/bin/bash
curl -X DELETE http://localhost:5000/api/audit-logs/cleanup \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"daysToKeep": 90}'
EOF

chmod +x /var/www/property-management/scripts/cleanup-audit-logs.sh

# Add to crontab (runs monthly)
0 0 1 * * /var/www/property-management/scripts/cleanup-audit-logs.sh
```

---

## Troubleshooting

### Application Won't Start

**Check logs:**
```bash
pm2 logs property-management-api
# or
sudo journalctl -u property-management -n 100
```

**Common issues:**
- Database connection: Verify DATABASE_URL in .env
- Port already in use: `sudo lsof -i :5000`
- Permissions: Check file ownership and permissions

### Database Connection Errors

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Test connection
psql -U property_admin -d property_management -h localhost

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

### High Memory Usage

```bash
# Check memory usage
pm2 monit

# Restart application
pm2 restart property-management-api

# Check for memory leaks in logs
pm2 logs property-management-api | grep "memory"
```

### Slow Performance

- Check database indexes are created (migrations should handle this)
- Monitor database query performance using Prisma Studio
- Check Node.js event loop lag
- Verify adequate server resources (RAM, CPU)
- Review Nginx access logs for unusual traffic patterns

---

## Updating the Application

### Rolling Update (Zero Downtime)

```bash
# Pull latest code
git pull origin main

# Install dependencies
npm install --production

# Run database migrations
npm run prisma:migrate

# Reload application
pm2 reload property-management-api
```

### Full Restart Update

```bash
# Stop application
pm2 stop property-management-api

# Pull latest code
git pull origin main

# Install dependencies
npm install --production

# Run migrations
npm run prisma:migrate

# Regenerate Prisma Client
npm run prisma:generate

# Start application
pm2 start property-management-api
```

---

## Security Best Practices

1. **Keep dependencies updated:**
   ```bash
   npm audit
   npm audit fix
   ```

2. **Use environment variables for sensitive data**
   - Never hardcode credentials
   - Use different values per environment

3. **Enable firewall:**
   ```bash
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```

4. **Regular security updates:**
   ```bash
   sudo apt update
   sudo apt upgrade
   ```

5. **Monitor failed login attempts:**
   - Review audit logs regularly
   - Set up alerts for suspicious activity

6. **Database security:**
   - Use strong passwords
   - Limit database access to localhost only
   - Regular backups with encryption

---

## Support and Maintenance

### Regular Maintenance Schedule

**Daily:**
- Check application health
- Review error logs
- Monitor disk space

**Weekly:**
- Review audit logs
- Check database performance
- Update dependencies (if needed)

**Monthly:**
- Clean up old audit logs
- Review backup integrity
- Security audit
- Performance optimization

**Quarterly:**
- Major dependency updates
- Security penetration testing
- Disaster recovery drill

---

## Additional Resources

- **Prisma Documentation:** https://www.prisma.io/docs
- **Node.js Best Practices:** https://github.com/goldbergyoni/nodebestpractices
- **PM2 Documentation:** https://pm2.keymetrics.io/docs
- **PostgreSQL Documentation:** https://www.postgresql.org/docs
- **Let's Encrypt:** https://letsencrypt.org/getting-started

---

## Conclusion

This deployment guide covers the essential steps for deploying the Property Management System in a production environment. Always test deployment procedures in a staging environment first before applying to production.

For any issues or questions, refer to the troubleshooting section or consult the application logs.
