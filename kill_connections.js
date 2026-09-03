const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function killConnections() {
  try {
    const result = await prisma.$executeRawUnsafe(`SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE pid <> pg_backend_pid() AND datname = 'postgres' AND usename = current_user`);
    console.log("Killed connections:", result);
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

killConnections();
