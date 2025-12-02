const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function createPropertyManager() {
  try {
    const hashedPassword = await bcrypt.hash('manager123', 10);

    const manager = await prisma.user.upsert({
      where: { email: 'manager@propmanage.com' },
      update: {},
      create: {
        email: 'manager@propmanage.com',
        password: hashedPassword,
        firstName: 'Property',
        lastName: 'Manager',
        phone: '0501234567',
        nationalId: '1234567891',
        role: 'PROPERTY_MANAGER',
        isBlocked: false
      }
    });

    console.log('Property Manager created successfully!');
    console.log('Email:', manager.email);
    console.log('Password: manager123');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createPropertyManager();
