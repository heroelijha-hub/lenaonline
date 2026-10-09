const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function update() {
  await prisma.setting.upsert({
    where: { key: 'CONTACT_FORM_RECIPIENT' },
    update: { value: 'info@toplenaolline.com' },
    create: { key: 'CONTACT_FORM_RECIPIENT', value: 'info@toplenaolline.com' }
  });
  await prisma.setting.upsert({
    where: { key: 'CONTACT_PHONE_PLACEHOLDER' },
    update: { value: '+34 XXX .....' },
    create: { key: 'CONTACT_PHONE_PLACEHOLDER', value: '+34 XXX .....' }
  });
  console.log('Updated contact defaults in DB');
}

update().then(() => prisma.$disconnect()).catch(console.error);
