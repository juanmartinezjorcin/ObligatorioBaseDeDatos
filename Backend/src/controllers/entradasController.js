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

const validarQR = async (req, res) => {
    const { qrData } = req.body;

    if (!qrData) {
        return res.status(400).json({ error: 'Falta qrData' });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token requerido' });
    }

    const token = authHeader.split(' ')[1];



    let conn;

try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    const decodedToken = await getAuth().verifyIdToken(token);

    if (decodedToken.role !== 'funcionario') {
        return res.status(403).json({
            error: 'No autorizado'
        });
    }

    const id_funcionario = decodedToken.uid;

    const { id_entrada, uid, timestamp } = qrData;

    const [entrada] = await conn.query(`
        SELECT *
        FROM entrada
        WHERE id_entrada = ?
    `, [id_entrada]);

    if (!entrada.length) {
        await conn.rollback();
        return res.status(404).json({
            error: 'Entrada no encontrada'
        });
    }

    if (entrada[0].id_dueño !== uid) {
        await conn.rollback();
        return res.status(403).json({
            error: 'No autorizado para esta entrada'
        });
    }

    if (!entrada[0].validez) {
        await conn.rollback();
        return res.status(400).json({
            error: 'La entrada no es válida'
        });
    }

    if (timestamp < Date.now() - 40 * 1000) {
        await conn.rollback();
        return res.status(400).json({
            error: 'QR expirado'
        });
    }

    await conn.query(`
        UPDATE entrada
        SET validez = false
        WHERE id_entrada = ?
    `, [id_entrada]);

    await conn.commit();

    return res.json({
        message: 'Entrada validada exitosamente'
    });
    } catch (error) {
        if (conn) {
            await conn.rollback();
        }
        console.error('Error al validar QR:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = { traerEntradas, traerEntradasValidas, generarQR , validarQR};

