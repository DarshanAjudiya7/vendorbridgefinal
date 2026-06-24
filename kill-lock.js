const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function killLocks() {
  try {
    const result = await prisma.$executeRawUnsafe(`
      SELECT pg_terminate_backend(pid) 
      FROM pg_stat_activity 
      WHERE pid <> pg_backend_pid() 
      AND (state = 'idle in transaction' OR query ILIKE '%pg_advisory_lock%');
    `);
    console.log("Terminated blocking connections:", result);
  } catch (error) {
    console.error("Error terminating connections:", error);
  } finally {
    await prisma.$disconnect();
  }
}

killLocks();
