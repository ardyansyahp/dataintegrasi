const bcrypt = require('bcryptjs');
const pool = require('./src/config/db');

async function seed() {
  try {
    const hash = await bcrypt.hash('password123', 10);
    await pool.query('UPDATE users SET password = $1', [hash]);
    console.log('Successfully updated all user passwords with bcrypt hash of password123');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding passwords:', err);
    process.exit(1);
  }
}

seed();
