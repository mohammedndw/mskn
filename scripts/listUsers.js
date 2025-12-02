const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        nationalId: true,
        isBlocked: true
      }
    });

    console.log('\n=== All Users ===\n');
    users.forEach(user => {
      console.log(`Role: ${user.role}`);
      console.log(`Email: ${user.email}`);
      console.log(`Name: ${user.firstName} ${user.lastName}`);
      console.log(`National ID: ${user.nationalId}`);
      console.log(`Blocked: ${user.isBlocked}`);
      console.log('---');
    });

    if (users.length === 0) {
      console.log('No users found in database.');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

listUsers();
