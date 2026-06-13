const pool = require('./db');

async function main() {
  await pool.query('ALTER TABLE usuario ADD COLUMN mail VARCHAR(100) NOT NULL UNIQUE');
  console.log('Columna mail agregada');
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });