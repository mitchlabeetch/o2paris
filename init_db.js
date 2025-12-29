require('dotenv').config();
const { initDatabase } = require('./lib/db');

async function run() {
  try {
    await initDatabase();
    console.log("DB Init complete");
  } catch (e) {
    console.error(e);
  }
}

run();
