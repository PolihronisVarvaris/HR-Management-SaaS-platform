// scripts/test-auth.ts
import { prisma } from '../src/lib/db';

async function testAuth() {
  console.log('🧪 Testing Authentication System...\n');

  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected');

    // Test existing users
    const users = await prisma.user.findMany({
      include: { profile: true },
      take: 3
    });

    console.log('\n📋 Existing Users:');
    users.forEach(user => {
      console.log(`  - ${user.email} (${user.role})`);
    });

    console.log('\n🎮 Test Commands:');
    console.log('   Register: curl -X POST http://localhost:3001/api/auth/register \\');
    console.log('     -H "Content-Type: application/json" \\');
    console.log('     -d \'{"email":"test@example.com","password":"Test123!","firstName":"John","lastName":"Doe"}\'');
    
    console.log('\n   Login: curl -X POST http://localhost:3001/api/auth/login \\');
    console.log('     -H "Content-Type: application/json" \\');
    console.log('     -d \'{"email":"test@example.com","password":"Test123!"}\'');

  } catch (error) {
    console.error('❌ Auth test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAuth();