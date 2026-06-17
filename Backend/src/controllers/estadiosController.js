const pool = require('../config/db');

/*
// POST crear estadio
const crearEstadio = async (req, res) => {
    const { pais, sectores } = req.body;
    //aca pongo sector como array para que tenga capacidad etc.

    if (!pais || !sectores || sectores.length === 0) {
        return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        const [result] = await conn.query('INSERT INTO estadio (pais) VALUES (?)', [pais]);
        const id_estadio = result.insertId;

        for (const sector of sectores) {
            await conn.query('INSERT INTO sector (id_estadio, nombre, capacidad) VALUES (?, ?, ?)', [id_estadio, sector.nombre, sector.capacidad]);
        }
        await conn.commit();
        res.status(201).json({ message: 'Estadio creado exitosamente', id_estadio });

    } catch (e) {
    await conn.rollback();
    console.error(e);
    res.status(500).json({ error: 'Error interno del servidor :(' });
  } finally {
    conn.release();
  }
};

*/


