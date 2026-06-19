const pool = require('../config/db');

const comprarEntradas = async (req, res) => {
    const { id_usuario, id_evento, cantidad_entradas } = req.body;
    if (!id_usuario || !id_evento || !cantidad_entradas) {
        return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    if (cantidad_entradas <= 0) {
        return res.status(400).json({ error: 'La cantidad de entradas debe ser mayor a cero' });
    }

    if (cantidad_entradas > 5) {
        return res.status(400).json({ error: 'No se pueden comprar más de 5 entradas por persona' });
    }
    
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        const [evento] = await conn.query(
            `SELECT id_evento, id_estadio
             FROM eventos
             WHERE id_evento = ?`,
            [id_evento]
        );

        if (!evento) {
            await conn.rollback();
            return res.status(404).json({ error: 'Evento no encontrado' });
        }

        const [result] = await conn.query( 
    

module.exports = { comprarEntradas };