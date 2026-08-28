const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const orders = await prisma.order.findMany({
    include: { orderItems: true },
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  
  console.log(JSON.stringify(orders.map(o => ({
    id: o.id,
    itemsCount: o.orderItems.length,
    total: o.total
  })), null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
