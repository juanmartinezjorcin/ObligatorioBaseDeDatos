const pool = require('../config/db');

const listarAuditoria = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT *
            FROM auditoria_validaciones
            ORDER BY id_auditoria DESC
            LIMIT 100
        `);

        res.json(rows);

    } catch (error) {
        console.error('Error al obtener auditoría:', error);
        res.status(500).json({ error: 'Error al obtener auditoría' });
    }
};

const filtrarPorResultado = async (req, res) => {
    try {
        const { resultado } = req.query;

        const [rows] = await pool.query(`
            SELECT *
            FROM auditoria_validaciones
            WHERE resultado_validacion = ?
            ORDER BY id_auditoria DESC
            LIMIT 100
        `, [resultado]);

        res.json(rows);

    } catch (error) {
        console.error('Error filtro auditoría:', error);
        res.status(500).json({ error: 'Error al filtrar auditoría' });
    }
};

module.exports = { listarAuditoria, filtrarPorResultado };