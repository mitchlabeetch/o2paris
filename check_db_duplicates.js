const { neon } = require('@neondatabase/serverless');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL not found in environment");
  process.exit(1);
}

const sql = neon(connectionString);

async function check() {
  try {
    console.log("Fetching tiles...");
    const tiles = await sql`SELECT id, title, image_url FROM tiles`;
    console.log(`Total tiles: ${tiles.length}`);

    const urlCounts = {};
    let duplicates = 0;

    tiles.forEach(t => {
      const url = t.image_url;
      if (urlCounts[url]) {
        urlCounts[url].push(t.id);
        duplicates++;
      } else {
        urlCounts[url] = [t.id];
      }
    });

    console.log(`Tiles sharing image_url: ${duplicates}`);

    for (const [url, ids] of Object.entries(urlCounts)) {
      if (ids.length > 1) {
        console.log(`Image URL ${url} used by IDs: ${ids.join(', ')}`);
      }
    }

  } catch (err) {
    console.error('Check failed:', err);
    process.exit(1);
  }
}

check();
