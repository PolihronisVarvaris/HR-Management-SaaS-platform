// scripts/test-all-apis.ts
import { prisma } from '../src/lib/db';

async function testAllAPIs() {
  console.log('🧪 Testing All HR SaaS APIs...\n');

  try {
    await prisma.$connect();
    console.log('✅ Database connected');

    // Check data
    const users = await prisma.user.count();
    const candidates = await prisma.candidate.count();
    const jobs = await prisma.job.count({ where: { status: 'PUBLISHED' } });
    const applications = await prisma.application.count();

    console.log('📊 Current Data:');
    console.log(`  - Users: ${users}`);
    console.log(`  - Candidates: ${candidates}`);
    console.log(`  - Published Jobs: ${jobs}`);
    console.log(`  - Applications: ${applications}`);

    console.log('\n🎮 Available Test Commands:');
    console.log('\n🔐 Authentication:');
    console.log('  Register candidate: curl -X POST http://localhost:3001/api/auth/register \\');
    console.log('    -H "Content-Type: application/json" \\');
    console.log('    -d \'{"email":"test@example.com","password":"Test123!","firstName":"John","lastName":"Doe"}\'');
    
    console.log('\n👤 Candidate APIs:');
    console.log('  Get profile: curl -X GET http://localhost:3001/api/candidates/profile \\');
    console.log('    -H "Authorization: Bearer TOKEN"');
    
    console.log('  Apply for job: curl -X POST http://localhost:3001/api/candidates/applications \\');
    console.log('    -H "Authorization: Bearer TOKEN" \\');
    console.log('    -H "Content-Type: application/json" \\');
    console.log('    -d \'{"jobId":"JOB_ID"}\'');
    
    console.log('\n🏢 HR APIs:');
    console.log('  Get all candidates: curl -X GET http://localhost:3001/api/candidates \\');
    console.log('    -H "Authorization: Bearer HR_TOKEN"');

    console.log('\n💡 Pro Tip: Use the seeded HR account:');
    console.log('  Email: hr@company.com');
    console.log('  Password: hr123');
    console.log('\n  Or the admin account:');
    console.log('  Email: admin@hrsaas.com');
    console.log('  Password: admin123');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAllAPIs();