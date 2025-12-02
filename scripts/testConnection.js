const path = require('path');
const dotenv = require('dotenv');

// Force load from specific path and override existing env vars
const envPath = path.resolve(__dirname, '..', '.env');
console.log('Loading .env from:', envPath);
const result = dotenv.config({ path: envPath, override: true });

if (result.error) {
  console.error('Error loading .env:', result.error);
} else {
  console.log('.env loaded successfully!');
  console.log('Parsed DATABASE_URL:', result.parsed?.DATABASE_URL?.substring(0, 50) || 'NOT IN PARSED');
  console.log('Process.env DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 50));
}

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('\n🔍 Testing database connection...\n');
    console.log('Database URL:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@') || 'NOT SET');
    console.log('');

    // Test basic connection
    await prisma.$connect();
    console.log('✅ Successfully connected to database!');

    // Test query
    const result = await prisma.$queryRaw`SELECT version()`;
    console.log('✅ Database query successful!');
    console.log('   PostgreSQL Version:', result[0].version.split(' ')[0] + ' ' + result[0].version.split(' ')[1]);

    // Count tables
    const tables = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `;
    console.log(`✅ Found ${tables.length} tables in database`);

    if (tables.length > 0) {
      console.log('\nTables:');
      tables.forEach((table, index) => {
        console.log(`   ${index + 1}. ${table.table_name}`);
      });
    } else {
      console.log('\n⚠️  No tables found. Run migrations to create tables:');
      console.log('   npm run prisma:migrate');
    }

    console.log('\n🎉 Database connection test completed successfully!');
  } catch (error) {
    console.error('\n❌ Database connection failed!');
    console.error('Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check your DATABASE_URL in .env file');
    console.error('2. Verify your Supabase credentials are correct');
    console.error('3. Make sure your password is properly URL encoded');
    console.error('4. Check if your Supabase project is running');
    console.error('\nSee SUPABASE_SETUP.md for detailed setup instructions.');
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
