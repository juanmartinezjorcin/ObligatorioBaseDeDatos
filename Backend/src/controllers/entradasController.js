const pool = require('../config/db');
const { getAuth } = require('firebase-admin/auth');
const QRCode = require("qrcode");
const crypto = require("crypto");

const QR_SECRET = process.env.QR_SECRET;

const traerEntradas = async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token requerido' });
    }

    try {
        const token = authHeader.split(' ')[1];
        const decodedToken = await getAuth().verifyIdToken(token);
        const id_usuario = decodedToken.uid;

        const [entradas] = await pool.query(`
            SELECT *
            FROM entrada
            WHERE id_dueño = ?
        `, [id_usuario]);

        return res.json(entradas);
    } catch (error) {
        console.error('Error al traer entradas:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const traerEntradasValidas = async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token requerido' });
    }

    try {
        const token = authHeader.split(' ')[1];
        const decodedToken = await getAuth().verifyIdToken(token);
        const id_usuario = decodedToken.uid;

        const [entradas] = await pool.query(`
            SELECT e.*
            FROM entrada e
            JOIN eventos ev ON e.id_evento = ev.id_evento
            WHERE e.id_dueño = ?
            AND ev.fecha_y_hora > NOW()
        `, [id_usuario]);

        return res.json(entradas);
    } catch (error) {
        console.error('Error al traer entradas válidas:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const generarQR = async (req, res) => {
    const { id_entrada } = req.query;

    if (!id_entrada) {
        return res.status(400).json({ error: 'Falta id_entrada' });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token requerido' });
    }

    try {
        const token = authHeader.split(' ')[1];
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

        const timestamp = Date.now();

        const qrData = {
            id_entrada: String(id_entrada),
            uid: id_usuario,
            timestamp,
            firma: generarFirmaQR(String(id_entrada), id_usuario, timestamp)
        };

        const qrCode = await QRCode.toDataURL(JSON.stringify(qrData));

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

    let conn;

    let auditoria = {
        id_entrada: qrData.id_entrada || null,
        id_funcionario: null,
        id_dispositivo: null,
        codigo_qr_validado: JSON.stringify(qrData),
        id_evento: null,
        id_estadio: null,
        nombre_sector: null,
        resultado_validacion: 'ERROR'
    };

    try {
        const { id_entrada, uid, timestamp, firma } = qrData;

        if (!id_entrada || !uid || !timestamp || !firma) {
            auditoria.resultado_validacion = 'QR_INCOMPLETO';
            return res.status(400).json({ error: 'QR incompleto' });
        }

        if (timestamp < Date.now() - 30 * 1000) {
            auditoria.resultado_validacion = 'QR_EXPIRADO';
            return res.status(400).json({ error: 'QR expirado' });
        }

        conn = await pool.getConnection();
        await conn.beginTransaction();

        const token = authHeader.split(' ')[1];
        const decodedToken = await getAuth().verifyIdToken(token);

        if (decodedToken.role !== 'funcionario') {
            auditoria.resultado_validacion = 'NO_AUTORIZADO';
            await conn.rollback();
            return res.status(403).json({ error: 'No autorizado' });
        }

        const id_funcionario = decodedToken.uid;
        auditoria.id_funcionario = id_funcionario;

        const [entrada] = await conn.query(`
            SELECT *
            FROM entrada
            WHERE id_entrada = ?
        `, [id_entrada]);

        if (!entrada.length) {
            auditoria.resultado_validacion = 'NO_EXISTE_ENTRADA';
            await conn.rollback();
            return res.status(404).json({ error: 'Entrada no encontrada' });
        }

        auditoria.id_evento = entrada[0].id_evento;
        auditoria.id_estadio = entrada[0].id_estadio;
        auditoria.nombre_sector = entrada[0].nombre_sector;

        const [lugar] = await conn.query(`
            SELECT *
            FROM asignado
            WHERE id_funcionario = ?
            AND id_evento = ?
            AND id_estadio = ?
            AND nombre_sector = ?
        `, [
            id_funcionario,
            entrada[0].id_evento,
            entrada[0].id_estadio,
            entrada[0].nombre_sector
        ]);

        const firmaEsperada = generarFirmaQR(String(id_entrada), uid, timestamp);

        if (firma !== firmaEsperada) {
            auditoria.resultado_validacion = 'FIRMA_INVALIDA';
            await conn.rollback();
            return res.status(403).json({ error: 'QR con firma inválida' });
        }

        if (!lugar.length) {
            auditoria.resultado_validacion = 'SIN_ASIGNACION';
            await conn.rollback();
            return res.status(403).json({ error: 'Funcionario no asignado a este evento/sector' });
        }

        const [dispositivo] = await conn.query(`
            SELECT *
            FROM dispositivo
            WHERE id_funcionario = ?
        `, [id_funcionario]);

        if (!dispositivo.length) {
            auditoria.resultado_validacion = 'DISPOSITIVO_INVALIDO';
            await conn.rollback();
            return res.status(403).json({ error: 'Dispositivo no autorizado' });
        }

        auditoria.id_dispositivo = dispositivo[0].id_dispositivo;

        if (entrada[0].id_dueño !== uid) {
            auditoria.resultado_validacion = 'QR_INVALIDO';
            await conn.rollback();
            return res.status(403).json({ error: 'QR inválido' });
        }

        if (!entrada[0].validez) {
            auditoria.resultado_validacion = 'YA_USADA';
            await conn.rollback();
            return res.status(400).json({ error: 'Entrada no válida' });
        }

        const [update] = await conn.query(`
            UPDATE entrada
            SET validez = FALSE
            WHERE id_entrada = ?
            AND validez = TRUE
        `, [id_entrada]);

        if (update.affectedRows === 0) {
            auditoria.resultado_validacion = 'YA_USADA';
            await conn.rollback();
            return res.status(400).json({ error: 'Entrada ya utilizada' });
        }

        auditoria.resultado_validacion = 'EXITOSO';

        await conn.commit();

        return res.json({ message: 'Entrada validada exitosamente' });

    } catch (error) {
        if (conn) await conn.rollback();
        console.error('Error al validar QR:', error);

        auditoria.resultado_validacion = 'ERROR_INTERNO';

        return res.status(500).json({ error: 'Error interno del servidor' });

    } finally {
        if (conn) conn.release();

        try {
            await pool.query(`
                INSERT INTO auditoria_validaciones (
                    id_entrada,
                    id_funcionario,
                    id_dispositivo,
                    codigo_qr_validado,
                    id_evento,
                    id_estadio,
                    nombre_sector,
                    resultado_validacion
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                auditoria.id_entrada,
                auditoria.id_funcionario,
                auditoria.id_dispositivo,
                auditoria.codigo_qr_validado,
                auditoria.id_evento,
                auditoria.id_estadio,
                auditoria.nombre_sector,
                auditoria.resultado_validacion
            ]);
        } catch (err) {
            console.error('Error al insertar auditoría:', err);
        }
    }
};

const generarFirmaQR = (id_entrada, uid, timestamp) => {
    return crypto
        .createHmac("sha256", QR_SECRET)
        .update(`${id_entrada}:${uid}:${timestamp}`)
        .digest("hex");
};

module.exports = {
    traerEntradas,
    traerEntradasValidas,
    generarQR,
    validarQR
};