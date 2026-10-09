const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function check() {
  const order = await prisma.order.findFirst({ orderBy: { createdAt: 'desc' }, include: { user: true } });
  console.log('Last order email:', order.user.email);
}
check().then(() => prisma.$disconnect()).catch(console.error);
