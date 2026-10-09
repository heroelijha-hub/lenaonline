const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function update() {
  await prisma.shippingMethod.updateMany({
    where: { type: 'Livraison Gratuite' },
    data: { type: 'Envío gratis' }
  });
  await prisma.shippingMethod.updateMany({
    where: { type: 'Livraison standard' },
    data: { type: 'Envío estándar' }
  });
  await prisma.shippingMethod.updateMany({
    where: { type: 'Livraison expresse' },
    data: { type: 'Envío exprés' }
  });
  console.log('Successfully translated shipping methods in DB.');
}

update().then(() => prisma.$disconnect()).catch(console.error);
