const pool = require('../config/db');

// GET para listar todos los eventos disponibles
const listarEventos = async (req, res) => {
  try {
    const [eventos] = await pool.query(`
      SELECT 
        e.id_evento,
        e.fecha_y_hora,
        est.pais AS estadio_pais,
        est.id_estadio,
        GROUP_CONCAT(eq.nombre ORDER BY eq.nombre SEPARATOR ' vs ') AS equipos
      FROM eventos e
      JOIN estadio est ON e.id_estadio = est.id_estadio
      JOIN participan p ON e.id_evento = p.id_evento
      JOIN equipos eq ON p.id_equipo = eq.id_equipo
      GROUP BY e.id_evento, e.fecha_y_hora, est.pais, est.id_estadio
      ORDER BY e.fecha_y_hora ASC
    `);

    res.json(eventos);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// GET para ver sectores disponibles de un evento
const obtenerSectoresEvento = async (req, res) => {
  const { id } = req.params;
  try {
    // Verificar que el evento existe
    const [eventos] = await pool.query(
      'SELECT * FROM eventos WHERE id_evento = ?',
      [id]
    );
    if (!eventos.length) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    // Obtener sectores habilitados para este evento con capacidad disponible
    const [sectores] = await pool.query(`
      SELECT 
        s.nombre,
        s.capacidad,
        s.capacidad - COUNT(en.id_entrada) AS disponibles
      FROM utilizan u
      JOIN sector s ON u.id_estadio = s.id_estadio AND u.nombre_sector = s.nombre
      LEFT JOIN entrada en ON en.id_evento = ? AND en.nombre_sector = s.nombre AND en.validez = 1
      WHERE u.id_evento = ?
      GROUP BY s.nombre, s.capacidad
    `, [id, id]);

    res.json({ id_evento: id, sectores });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = { listarEventos, obtenerSectoresEvento };