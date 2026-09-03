const { PrismaClient } = require('@prisma/client'); 
const prisma = new PrismaClient(); 
async function main() { 
  const s = await prisma.setting.findMany({ where: { key: 'HEADER_MENU_LINKS' } }); 
  console.log('HEADER_MENU_LINKS:', s); 
} 
main().finally(() => prisma.$disconnect());
