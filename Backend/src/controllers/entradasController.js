const pool = require('../config/db');
const { getAuth } = require('firebase-admin/auth');
const QRCode = require("qrcode");

const traerEntradas = async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token requerido' });
    }

    const token = authHeader.split(' ')[1];

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
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token requerido' });
    }

    const token = authHeader.split(' ')[1];

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
            const [data] = await pool.query(`
                SELECT fecha_y_hora
                FROM eventos
                WHERE id_evento = ?
            `, [entrada.id_evento]);

            if (data.length > 0) {
                const fechaEvento = new Date(data[0].fecha_y_hora);
                if (fechaEvento > new Date()) {
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
            id_entrada,
            uid: id_usuario,
            timestamp: Date.now()
        });

        const qrCode = await QRCode.toDataURL(qrData);

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
        id_entrada: null,
        id_funcionario: null,
        id_dispositivo: null,
        codigo_qr_validado: null,
        id_evento: null,
        id_estadio: null,
        nombre_sector: null,
        resultado_validacion: 'ERROR'
    };

    try {
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
        const { id_entrada, uid, timestamp } = qrData;

        auditoria.id_entrada = id_entrada;
        auditoria.id_funcionario = id_funcionario;
        auditoria.codigo_qr_validado = JSON.stringify(qrData);

        const [entrada] = await conn.query(`
            SELECT * FROM entrada WHERE id_entrada = ?
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
        `, [
            id_funcionario,
            entrada[0].id_evento
        ]);

        if (lugar.length === 0) {
            auditoria.resultado_validacion = 'SIN_ASIGNACION';
            await conn.rollback();
            return res.status(403).json({ error: 'Funcionario no asignado' });
        }

        // dispositivo
        const [dispositivo] = await conn.query(`
            SELECT * FROM dispositivo WHERE id_funcionario = ?
        `, [id_funcionario]);

        if (!dispositivo.length) {
            auditoria.resultado_validacion = 'DISPOSITIVO_INVALIDO';
            await conn.rollback();
            return res.status(403).json({ error: 'Dispositivo no autorizado' });
        }

        auditoria.id_dispositivo = dispositivo[0].id_dispositivo;



        // validaciones QR
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

        if (timestamp < Date.now() - 40 * 1000) {
            auditoria.resultado_validacion = 'QR_EXPIRADO';
            await conn.rollback();
            return res.status(400).json({ error: 'QR expirado' });
        }

        await conn.query(`
            UPDATE entrada
            SET validez = FALSE,
            WHERE id_entrada = ?
        `, [
            id_entrada
        ]);

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

module.exports = {
    traerEntradas,
    traerEntradasValidas,
    generarQR,
    validarQR
};