const pool = require('../config/db');
const { getAuth } = require('firebase-admin/auth');
const QRCode = require("qrcode");

const traerEntradas = async (req, res) => {
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

const traerEntradasValidas = async (req, res) => {
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
                SELECT fecha_y_hora
                FROM eventos
                WHERE id_evento = ?
            `, [entrada.id_evento]);
            if (Data.length > 0) {
                const fechaEvento = new Date(Data[0].fecha_y_hora);
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

// http://localhost:3000/api/entradas/qr?id_entrada=11 ejemplo de uso, se debe enviar id
const generarQR = async (req, res) => {
    const { id_entrada } = req.query;

    if (!id_entrada) {
        return res.status(400).json({ error: 'Falta id_entrada' });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token requerido' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decodedToken = await getAuth().verifyIdToken(token);
        const id_usuario = decodedToken.uid;

        const [entrada] = await pool.query(`
            SELECT *
            FROM entrada
            WHERE id_entrada = ?
        `, [id_entrada]);

        if (!entrada.length) {
            return res.status(404).json({ error: 'Entrada no encontrada' });
        }

        if (entrada[0].id_dueño !== id_usuario) {
            return res.status(403).json({ error: 'No autorizado para esta entrada' });
        }

        const qrData = JSON.stringify({
            id_entrada: id_entrada,
            uid: id_usuario,
            timestamp: Date.now()
        });

        const qrCode = await QRCode.toDataURL(qrData);

        console.log(qrData);

        return res.json({
            id_entrada: entrada[0].id_entrada,
            qrCode
        });

    } catch (error) {
        console.error('Error al generar QR:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = { traerEntradas, traerEntradasValidas, generarQR };