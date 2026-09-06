const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    where: { 
      isDeleted: false,
      metaTitle: { equals: null }
    },
    select: { id: true, title: true, shortDescription: true }
  });
  console.log(`Remaining products to optimize: ${products.length}`);
  console.log(JSON.stringify(products, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
