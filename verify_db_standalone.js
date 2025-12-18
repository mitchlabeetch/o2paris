const { neon } = require('@neondatabase/serverless');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL not found in environment");
  process.exit(1);
}

const sql = neon(connectionString);

async function check() {
  try {
    const result = await sql`SELECT 1 as result`;
    console.log('Database connection successful:', result);

    // Also check if tables exist
    const tables = await sql`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
    `;
    console.log('Tables found:', tables.map(t => t.table_name));

  } catch (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }
}

check();
