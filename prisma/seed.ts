import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log(' Stratégie de peuplement (Seeding) en cours...');

  // 1. Création du Magasin Central (Dépôt)
  const depotCentral = await (prisma as any).magasin.upsert({
    where: { nom: 'Dépôt Central' },
    update: {},
    create: {
      nom: 'Dépôt Central',
      adresse: 'Siège Social, Lomé',
    },
  });
  console.log(` Magasin créé : ${depotCentral.nom} (${depotCentral.idMagasin})`);

  // 2. Création de l'Administrateur
  const adminEmail = 'admin@essikokoe.com';
  const hashedPassword = await bcrypt.hash('P@ssw0rd', 8);

  const admin = await prisma.utilisateur.upsert({
    where: { email: adminEmail },
    update: {
      motDePasse: hashedPassword,
      role: 'SUPERADMIN' as any,
    },
    create: {
      email: adminEmail,
      nom: 'Super Admin',
      motDePasse: hashedPassword,
      role: 'SUPERADMIN' as any,
      magasinId: depotCentral.idMagasin,
    },
  });

  console.log(' Utilisateur Admin créé/vérifié');
  console.log(`   Email: ${admin.email}`);
  console.log(`   Password: P@ssw0rd`);
  console.log('Seeding terminé avec succès !');
}

main()
  .catch((e) => {
    console.error(' Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
