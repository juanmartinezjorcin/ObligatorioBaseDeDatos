const pool = require('../config/db');

// GET /api/equipos — listar todos los equipos
const listarEquipos = async (req, res) => {
  try {
    const [equipos] = await pool.query('SELECT * FROM equipos ORDER BY nombre');
    res.json(equipos);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = { listarEquipos };