const pool = require('./db');

async function main() {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Estadios
    await conn.query(`
      INSERT INTO estadio (id_estadio, pais) VALUES
      (1, 'USA'),
      (2, 'Mexico'),
      (3, 'Canada')
    `);

    // Sectores
    await conn.query(`
      INSERT INTO sector (id_estadio, nombre, capacidad) VALUES
      (1, 'A', 10000),
      (1, 'B', 8000),
      (1, 'C', 6000),
      (2, 'A', 9000),
      (2, 'B', 7000),
      (3, 'A', 8000),
      (3, 'B', 6000)
    `);

    // Equipos
    await conn.query(`
      INSERT INTO equipos (id_equipo, nombre) VALUES
      (1, 'Uruguay'),
      (2, 'Argentina'),
      (3, 'Brasil'),
      (4, 'Francia'),
      (5, 'España'),
      (6, 'Alemania')
    `);

    // Eventos
    await conn.query(`
      INSERT INTO eventos (id_evento, fecha_y_hora, id_estadio, id_administrador) VALUES
      (1, '2026-06-15 18:00:00', 1, NULL),
      (2, '2026-06-18 21:00:00', 2, NULL),
      (3, '2026-06-21 15:00:00', 3, NULL)
    `);

    // Participan
    await conn.query(`
      INSERT INTO participan (id_equipo, id_evento) VALUES
      (1, 1), (2, 1),
      (3, 2), (4, 2),
      (5, 3), (6, 3)
    `);

    // Utilizan
    await conn.query(`
      INSERT INTO utilizan (id_evento, id_estadio, nombre_sector) VALUES
      (1, 1, 'A'),
      (1, 1, 'B'),
      (1, 1, 'C'),
      (2, 2, 'A'),
      (2, 2, 'B'),
      (3, 3, 'A'),
      (3, 3, 'B')
    `);

    await conn.commit();
    console.log('Datos de prueba insertados correctamente');
  } catch (e) {
    await conn.rollback();
    console.error(e);
  } finally {
    conn.release();
    process.exit(0);
  }
}

main();