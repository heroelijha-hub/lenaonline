const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const count = await prisma.product.count({ where: { isDeleted: false } });
  const products = await prisma.product.findMany({
    where: { isDeleted: false },
    select: { id: true, title: true, shortDescription: true }
  });
  console.log('Count:', count);
  console.log(JSON.stringify(products, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
