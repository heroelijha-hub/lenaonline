const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function get() {
  const s = await prisma.setting.findMany();
  console.log(s);
}
get().then(() => prisma.$disconnect()).catch(console.error);
