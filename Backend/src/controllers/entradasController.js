const pool = require('../config/db');

traerEntradas = async (req, res) => {
    const { } = req.query;

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token requerido' });
    }

    const token = authHeader.split(' ')[1];
    let conn;

    try {
        const decodedToken = await getAuth().verifyIdToken(token);
        const id_usuario = decodedToken.uid;
        const [entradas] = await pool.query(`
            SELECT *
            FROM entrada
            WHERE id_dueño = ?
        `, [id_usuario]);

        res.json(entradas);
    } catch (error) {
        console.error('Error al traer entradas:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

traerEntradasValidas = async (req, res) => {
    const { } = req.query;

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token requerido' });
    }

    const token = authHeader.split(' ')[1];
    let conn;

    try {
        const decodedToken = await getAuth().verifyIdToken(token);
        const id_usuario = decodedToken.uid;
        const [entradas] = await pool.query(`
            SELECT *
            FROM entrada
            WHERE id_dueño = ?
        `, [id_usuario]);

        const entradasValidas = [];

        for (const entrada of entradas) {
            const [Data] = await pool.query(`
                SELECT fecha_hora
                FROM eventos
                WHERE id_evento = ?
            `, [entrada.id_evento]);
            if (Data.length > 0) {
                const fechaEvento = new Date(Data[0].fecha_hora);
                const fechaActual = new Date();
                if (fechaEvento > fechaActual) {
                    entradasValidas.push(entrada);
                }
            }
        }
        res.json(entradasValidas);
    } catch (error) {
        console.error('Error al traer entradas:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = {traerEntradas, traerEntradasValidas};