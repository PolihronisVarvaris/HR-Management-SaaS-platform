// scripts/test-candidate.ts
import { prisma } from '../src/lib/db';

async function testCandidateSetup() {
  console.log('🧪 Testing Candidate Management Setup...\n');

  try {
    await prisma.$connect();
    console.log('✅ Database connected');

    // Check for published jobs
    const jobs = await prisma.job.findMany({
      where: { status: 'PUBLISHED' },
      take: 3
    });

    console.log('\n📋 Published Jobs:');
    jobs.forEach(job => {
      console.log(`  - ${job.title} (${job.department}) - ID: ${job.id}`);
    });

    console.log('\n🎮 Test Commands for Candidates:');
    console.log('   Get profile: curl -X GET http://localhost:3001/api/candidates/profile \\');
    console.log('     -H "Authorization: Bearer YOUR_CANDIDATE_TOKEN"');
    
    console.log('\n   Upload CV: curl -X POST http://localhost:3001/api/candidates/cv \\');
    console.log('     -H "Authorization: Bearer YOUR_CANDIDATE_TOKEN" \\');
    console.log('     -F "cv=@/path/to/your/cv.pdf"');
    
    console.log('\n   Apply for job: curl -X POST http://localhost:3001/api/candidates/applications \\');
    console.log('     -H "Authorization: Bearer YOUR_CANDIDATE_TOKEN" \\');
    console.log('     -H "Content-Type: application/json" \\');
    console.log('     -d \'{"jobId":"JOB_ID_HERE"}\'');

    console.log('\n🎮 Test Commands for HR:');
    console.log('   Get all candidates: curl -X GET http://localhost:3001/api/candidates \\');
    console.log('     -H "Authorization: Bearer YOUR_HR_TOKEN"');

  } catch (error) {
    console.error('❌ Candidate test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCandidateSetup();