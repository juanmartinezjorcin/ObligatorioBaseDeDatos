const pool = require('../config/db');
const { getAuth } = require('firebase-admin/auth');

const crearTransferencia = async (req, res) => {
    const { pais_documento_destinatario, documento_destinatario, entradas } = req.body;

    if (!pais_documento_destinatario || !documento_destinatario || !entradas) {
        return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token requerido' });
    }

    const token = authHeader.split(' ')[1];

    let conn;

    try {
        const decodedToken = await getAuth().verifyIdToken(token);
        const rolUsuario = decodedToken.role;
        const id_usuario = decodedToken.uid;

        if (rolUsuario !== 'general') {
            return res.status(403).json({
                error: 'No autorizado'
            });
        }

        conn = await pool.getConnection();
        await conn.beginTransaction();

        const [destinatario] = await conn.query(`
            SELECT id_usuario
            FROM usuario
            WHERE pais_documento = ? AND numero_documento = ?
        `, [pais_documento_destinatario, documento_destinatario]);

        if (destinatario.length === 0) {
            await conn.rollback();
            return res.status(404).json({ error: 'Destinatario no encontrado' });
        }

        const [result] = await conn.query(`
            INSERT INTO transferencia (id_ofertante, id_destinatario, fecha_transferencia, estado_transferencia)
            VALUES (?, ?, NOW(),"pendiente")
        `, [id_usuario, destinatario[0].id_usuario]);

        const entradasData = [];

        for (const entrada of entradas) {
            if (!entrada.id_entrada) {
                await conn.rollback();
                return res.status(400).json({ error: 'Faltan datos requeridos para una entrada' });
            }
            const [Data] = await conn.query(`
                SELECT id_entrada, validez, numero_transferencias, id_dueño
                FROM entrada
                WHERE id_entrada = ?
            `, [entrada.id_entrada]);
            entradasData.push(Data[0]);

        }

        if (entradasData.length < entradas.length) {
            await conn.rollback();
            return res.status(400).json({ error: 'Algunas entradas no se encontraron' });
        }

        for (const entrada of entradasData) {
            if (!entrada.validez) {
                await conn.rollback();
                return res.status(400).json({ error: `La entrada ${entrada.id_entrada} no es válida` });
            }
            if (entrada.numero_transferencias >= 3) {
                await conn.rollback();
                return res.status(400).json({ error: `La entrada ${entrada.id_entrada} ha alcanzado el límite de transferencias` });
            }
            if (entrada.id_dueño !== id_usuario) {
                await conn.rollback();
                return res.status(403).json({ error: `La entrada ${entrada.id_entrada} no pertenece al usuario` });
            }
            await conn.query(`
                INSERT INTO transferencia_entrada (id_transferencia, id_entrada)
                VALUES (?, ?)
            `, [result.insertId, entrada.id_entrada]);
        }

        await conn.commit();

        return res.status(201).json({
            message: 'Transferencia creada correctamente. Pendiente de aceptación por el destinatario.',
            id_transferencia: result.insertId
        });

    } catch (error) {
        if (conn) await conn.rollback();
        console.error(error);
        return res.status(500).json({
            error: error.message || 'Error interno'
        });
    } finally {
        if (conn) conn.release();
    }
};

const confirmarTransferencia = async (req, res) => {
    const { id_transferencia } = req.body;

    if (!id_transferencia) {
        return res.status(400).json({
            error: 'Faltan datos requeridos'
        });
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            error: 'Token requerido'
        });
    }

    const token = authHeader.split(' ')[1];

    let conn;

    try {
        const decodedToken = await getAuth().verifyIdToken(token);
        const rolUsuario = decodedToken.role;
        const id_usuario = decodedToken.uid;

        if (rolUsuario !== 'general') {
            return res.status(403).json({
                error: 'No autorizado'
            });
        }

        conn = await pool.getConnection();
        await conn.beginTransaction();

        const [transferencia] = await conn.query(`
            SELECT *
            FROM transferencia
            WHERE id_transferencia = ?
              AND id_destinatario = ?
        `, [id_transferencia, id_usuario]);

        if (transferencia.length === 0) {
            await conn.rollback();
            return res.status(404).json({
                error: 'Transferencia no encontrada'
            });
        }

        if (transferencia[0].estado_transferencia !== 'pendiente') {
            await conn.rollback();
            return res.status(400).json({
                error: 'La transferencia no está pendiente'
            });
        }

        const [entradas] = await conn.query(`
            SELECT e.id_entrada, e.numero_transferencias
            FROM entrada e
            JOIN transferencia_entrada te
                ON e.id_entrada = te.id_entrada
            WHERE te.id_transferencia = ?
        `, [id_transferencia]);

        if (entradas.length === 0) {
            await conn.rollback();
            return res.status(404).json({
                error: 'No hay entradas asociadas a la transferencia'
            });
        }

        for (const entrada of entradas) {
            if (entrada.numero_transferencias >= 3) {
                await conn.rollback();
                return res.status(400).json({
                    error: `La entrada ${entrada.id_entrada} alcanzó el límite de transferencias`
                });
            }
            await conn.query(`
                UPDATE entrada
                SET numero_transferencias = numero_transferencias + 1,
                    id_dueño = ?
                WHERE id_entrada = ?
            `, [id_usuario, entrada.id_entrada]);
            await conn.query(`
                UPDATE transferencia t
                JOIN transferencia_entrada te
                    ON t.id_transferencia = te.id_transferencia
                SET t.estado_transferencia = 'rechazada'
                WHERE te.id_entrada = ?
                AND t.estado_transferencia = 'pendiente'
                AND t.id_transferencia <> ?
            `, [entrada.id_entrada, id_transferencia]);
        }

        await conn.query(`
            UPDATE transferencia
            SET estado_transferencia = 'aceptada'
            WHERE id_transferencia = ?
        `, [id_transferencia]);

        await conn.commit();

        return res.status(200).json({
            message: 'Transferencia confirmada correctamente',
            id_transferencia
        });

    } catch (error) {
        if (conn) await conn.rollback();

        console.error(error);

        return res.status(500).json({
            error: error.message || 'Error interno'
        });

    } finally {
        if (conn) conn.release();
    }
};

module.exports = { crearTransferencia, confirmarTransferencia };