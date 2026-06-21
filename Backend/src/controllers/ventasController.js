const pool = require('../config/db');
const { getAuth } = require('firebase-admin/auth');

const comprarEntradas = async (req, res) => {
    const { nombre_sector, id_evento, cantidad_entradas } = req.body;

    if (!nombre_sector || !id_evento || !cantidad_entradas) {
        return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    if (cantidad_entradas <= 0) {
        return res.status(400).json({ error: 'La cantidad debe ser mayor a cero' });
    }

    if (cantidad_entradas > 5) {
        return res.status(400).json({ error: 'Máximo 5 entradas por compra' });
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

        await liberarReservasVencidas(conn);

        const [compradas] = await conn.query(`
            SELECT COUNT(*) AS total_entradas
            FROM entrada e
            JOIN venta v ON e.id_venta = v.id_venta
            JOIN (
                SELECT id_venta, MAX(fechahora) AS ultima_fecha
                FROM venta_estado
                GROUP BY id_venta
            ) ult ON v.id_venta = ult.id_venta
            JOIN venta_estado ve 
                ON ve.id_venta = ult.id_venta
                AND ve.fechahora = ult.ultima_fecha
            WHERE v.id_comprador = ?
            AND e.id_evento = ?
            AND ve.id_estado IN (1, 2)
        `, [id_usuario, id_evento]);

        if (compradas[0].total_entradas + cantidad_entradas > 5) {
            await conn.rollback();
            return res.status(400).json({
                error: `Ya compraste ${compradas[0].total_entradas} entradas para este evento. El máximo es 5.`
            });
        }

        const [evento] = await conn.query(`
            SELECT id_evento, id_estadio
            FROM eventos
            WHERE id_evento = ?
        `, [id_evento]);

        if (evento.length === 0) {
            await conn.rollback();
            return res.status(404).json({ error: 'Evento no encontrado' });
        }

        const [sectorEvento] = await conn.query(`
            SELECT cantidad_entradas_vendidas, precio
            FROM utilizan
            WHERE id_evento = ? AND nombre_sector = ?
        `, [id_evento, nombre_sector]);

        if (sectorEvento.length === 0) {
            await conn.rollback();
            return res.status(404).json({ error: 'Sector no habilitado para el evento' });
        }

        const [sector] = await conn.query(`
            SELECT capacidad
            FROM sector
            WHERE id_estadio = ? AND nombre = ?
        `, [evento[0].id_estadio, nombre_sector]);

        if (sector.length === 0) {
            await conn.rollback();
            return res.status(404).json({ error: 'Sector no encontrado' });
        }

        const disponibles = sector[0].capacidad - sectorEvento[0].cantidad_entradas_vendidas;

        if (cantidad_entradas > disponibles) {
            await conn.rollback();
            return res.status(400).json({
                error: 'No hay suficientes entradas disponibles'
            });
        }

        await conn.query(`
            UPDATE utilizan
            SET cantidad_entradas_vendidas = cantidad_entradas_vendidas + ?
            WHERE id_evento = ? AND nombre_sector = ?
        `, [cantidad_entradas, id_evento, nombre_sector]);

        const monto_total = cantidad_entradas * sectorEvento[0].precio;
        const comision = 5;

        const [result] = await conn.query(`
            INSERT INTO venta (fecha, monto_total, id_comprador,
                comision)
            VALUES (NOW(), ?, ?, ?)
        `, [
            monto_total,
            id_usuario,
            comision
        ]);

        await conn.query(`
        INSERT INTO venta_estado (id_venta, id_estado, fechahora)
        VALUES (?, 1, NOW())
        `, [result.insertId]);

        for (let i = 0; i < cantidad_entradas; i++) {
            await conn.query(`
            INSERT INTO entrada (numero_transferencias, validez, id_evento, id_estadio, nombre_sector, id_venta, id_dueño)
            VALUES (0, FALSE, ?, ?, ?, ?, ?)
        ;`, [
                id_evento,
                evento[0].id_estadio,
                nombre_sector,
                result.insertId,
                id_usuario
            ]);
        }

        await conn.commit();

        return res.status(201).json({
            message: 'Reserva creada correctamente. Tiene 3 minutos para pagar.',
            id_venta: result.insertId
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

const liberarReservasVencidas = async (conn) => {
    const [ventasVencidas] = await conn.query(`
        SELECT ve.id_venta
        FROM venta_estado ve
        INNER JOIN (
            SELECT id_venta, MAX(fechahora) AS ultima_fecha
            FROM venta_estado
            GROUP BY id_venta
        ) ult
            ON ve.id_venta = ult.id_venta
            AND ve.fechahora = ult.ultima_fecha
        WHERE ve.id_estado = 1
        AND ve.fechahora < DATE_SUB(NOW(), INTERVAL 3 MINUTE)
    `);

    for (const venta of ventasVencidas) {

        const [datosEntrada] = await conn.query(`
            SELECT 
                COUNT(*) AS cantidad,
                id_evento,
                nombre_sector
            FROM entrada
            WHERE id_venta = ?
            GROUP BY id_evento, nombre_sector
        `, [venta.id_venta]);

        if (datosEntrada.length > 0) {
            const cantidad = datosEntrada[0].cantidad;
            const id_evento = datosEntrada[0].id_evento;
            const nombre_sector = datosEntrada[0].nombre_sector;

            await conn.query(`
                UPDATE utilizan
                SET cantidad_entradas_vendidas = cantidad_entradas_vendidas - ?
                WHERE id_evento = ? AND nombre_sector = ?
            `, [
                cantidad,
                id_evento,
                nombre_sector
            ]);
        }

        await conn.query(`
            DELETE FROM entrada
            WHERE id_venta = ?
        `, [venta.id_venta]);

        await conn.query(`
            INSERT INTO venta_estado (
                id_venta,
                id_estado,
                fechahora
            )
            VALUES (?, 3, NOW())
        `, [venta.id_venta]);
    }
};

const confirmarEntradas = async (req, res) => {
    const { id_venta } = req.body;

    if (!id_venta) {
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

        const [estadoActual] = await conn.query(`
            SELECT id_estado
            FROM venta_estado
            WHERE id_venta = ?
            ORDER BY fechahora DESC
            LIMIT 1
        `, [id_venta]);

        if (estadoActual.length === 0) {
            await conn.rollback();
            return res.status(404).json({ error: 'Venta no encontrada' });
        }

        const [estado] = await conn.query(`
            SELECT tipo
            FROM estado
            WHERE id_estado = ?
        `, [estadoActual[0].id_estado]);

        if (estado[0].tipo !== 'pendiente') {
            await conn.rollback();
            return res.status(404).json({ error: 'Esta venta ya fue rechasada o completada' });
        }

        const [entradas] = await conn.query(`
            SELECT id_entrada
            FROM entrada
            WHERE id_venta = ?
        `, [id_venta]);

        if (entradas.length === 0) {
            await conn.rollback();
            return res.status(404).json({ error: 'No se encontraron entradas para esta venta' });
        }

        for (const entrada of entradas) {
            await conn.query(`
                UPDATE entrada  
                SET validez = TRUE
                WHERE id_entrada = ?
            `, [entrada.id_entrada]);
        }

        await conn.query(`
            INSERT INTO venta_estado (
                id_venta,
                id_estado,
                fechahora
            )
            VALUES (?, 2, NOW())
        `, [id_venta]);

        await conn.commit();

        return res.status(201).json({
            message: 'Compra confirmada correctamente',
            id_venta: id_venta
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

module.exports = { comprarEntradas, confirmarEntradas };