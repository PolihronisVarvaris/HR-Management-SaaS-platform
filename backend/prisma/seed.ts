import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@hrsaas.com' },
    update: {},
    create: {
      email: 'admin@hrsaas.com',
      password: hashedPassword,
      role: UserRole.RECRUITMENT_ADMIN,
      profile: {
        create: {
          firstName: 'System',
          lastName: 'Admin',
        },
      },
    },
  });

  // Create HR employee
  const hrPassword = await bcrypt.hash('hr123', 12);
  const hrEmployee = await prisma.user.upsert({
    where: { email: 'hr@company.com' },
    update: {},
    create: {
      email: 'hr@company.com',
      password: hrPassword,
      role: UserRole.HR_EMPLOYEE,
      profile: {
        create: {
          firstName: 'Jane',
          lastName: 'Smith',
          phone: '+1234567890',
        },
      },
    },
  });

  // Create sample job
  const job = await prisma.job.create({
    data: {
      title: 'Senior Software Engineer',
      description: 'We are looking for a skilled Senior Software Engineer...',
      department: 'Engineering',
      location: 'Remote',
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  });

  console.log('Seed data created:');
  console.log('- Admin user:', admin.email);
  console.log('- HR employee:', hrEmployee.email);
  console.log('- Sample job:', job.title);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });