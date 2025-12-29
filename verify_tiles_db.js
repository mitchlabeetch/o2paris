const { neon } = require('@neondatabase/serverless');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL not found in environment");
  process.exit(1);
}

const sql = neon(connectionString);

async function check() {
  try {
    const tiles = await sql`SELECT count(*) FROM tiles`;
    console.log('Tiles count:', tiles[0].count);
    const images = await sql`SELECT count(*) FROM images`;
    console.log('Images count:', images[0].count);
  } catch (err) {
    console.error('Check failed:', err);
    process.exit(1);
  }
}

check();
