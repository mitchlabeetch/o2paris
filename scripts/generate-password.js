#!/usr/bin/env node

/**
 * Script to generate a bcrypt hash for admin password
 * Usage: node scripts/generate-password.js yourpassword
 */

const bcrypt = require('bcryptjs');

const password = process.argv[2];

if (!password) {
  console.error('Please provide a password as an argument');
  console.log('Usage: node scripts/generate-password.js yourpassword');
  process.exit(1);
}

async function generateHash() {
  const hash = await bcrypt.hash(password, 10);
  console.log('\nYour password hash:');
  console.log(hash);
  console.log('\nAdd this to your .env file as:');
  console.log(`ADMIN_PASSWORD_HASH=${hash}`);
}

generateHash();
