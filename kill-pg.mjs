import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pg;
const client = new Client({ connectionString: process.env.DATABASE_URL });

async function kill() {
  try {
    await client.connect();
    const res = await client.query(`SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE pid <> pg_backend_pid();`);
    console.log("Connections terminated", res.rows);
  } catch (e) {
    console.error(e);
  } finally {
    await client.end();
  }
}
kill();
