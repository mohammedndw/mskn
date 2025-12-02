require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createPropertyOwner() {
  try {
    console.log('Creating property owner user...');

    // Check if property owner already exists
    const existingOwner = await prisma.user.findUnique({
      where: { email: 'owner@propmanage.com' }
    });

    if (existingOwner) {
      console.log('Property Owner user already exists!');
      console.log('Email:', existingOwner.email);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('Owner@123', 10);

    // Create property owner user
    const owner = await prisma.user.create({
      data: {
        email: 'owner@propmanage.com',
        password: hashedPassword,
        firstName: 'Property',
        lastName: 'Owner',
        phone: '0501234567',
        nationalId: '1234567890',
        role: 'PROPERTY_OWNER',
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

    console.log('\n✅ Property Owner user created successfully!');
    console.log('\nProperty Owner Credentials:');
    console.log('Email:', owner.email);
    console.log('Password: Owner@123');
    console.log('\nProperty Owner Details:');
    console.log(JSON.stringify(owner, null, 2));

    // Check if there are any properties and assign one to this owner
    const availableProperty = await prisma.property.findFirst({
      where: { ownerId: null }
    });

    if (availableProperty) {
      await prisma.property.update({
        where: { id: availableProperty.id },
        data: { ownerId: owner.id }
      });
      console.log('\n✅ Assigned property to owner:', availableProperty.name);
    } else {
      console.log('\n⚠️  No unassigned properties found. You may need to assign a property to this owner manually.');
    }

  } catch (error) {
    console.error('❌ Error creating property owner:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createPropertyOwner();
