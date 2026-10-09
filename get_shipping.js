const { PrismaClient } = require('@prisma/client'); 
const prisma = new PrismaClient(); 
prisma.shippingMethod.findMany().then(res => { 
  console.log('SHIPPING METHODS:', JSON.stringify(res, null, 2)); 
  prisma.$disconnect(); 
}).catch(e => { 
  console.log(e); 
  prisma.$disconnect(); 
});
