const pool = require('./db');

async function main() {
  const [rows] = await pool.query('SHOW TABLES');
  console.log(rows);
  process.exit(0);
}

main();