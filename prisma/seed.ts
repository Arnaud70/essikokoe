import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Check if admin already exists
  const adminExists = await prisma.utilisateur.findUnique({
    where: { email: 'admin@esikokoe.com' },
  });

  if (adminExists) {
    console.log('Admin user already exists');
    return;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash('AdminPassword123!', 10);

  // Create admin user
  const admin = await prisma.utilisateur.create({
    data: {
      nom: 'Admin',
      email: 'admin@esikokoe.com',
      motDePasse: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin user created successfully');
  console.log(`Email: ${admin.email}`);
  console.log(`Password: AdminPassword123!`);
  console.log(`⚠️  Please change this password after first login!`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
