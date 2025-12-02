require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('Creating admin user...');

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@propmanage.com' }
    });

    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email:', existingAdmin.email);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: 'admin@propmanage.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        phone: '1234567890',
        nationalId: 'ADMIN001',
        role: 'ADMIN',
        isBlocked: false
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true
      }
    });

    console.log('\n✅ Admin user created successfully!');
    console.log('\nAdmin Credentials:');
    console.log('Email:', admin.email);
    console.log('Password: Admin@123');
    console.log('\n⚠️  IMPORTANT: Change the password after first login!');
    console.log('\nAdmin Details:');
    console.log(JSON.stringify(admin, null, 2));
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
