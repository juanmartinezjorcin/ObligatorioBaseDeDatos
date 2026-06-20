const pool = require('../config/db');
const { getAuth } = require('firebase-admin/auth');

const registrarEventos = async (req, res) => {
    const {
        fecha_y_hora,
        id_estadio,
        id_equipo_local,
        id_equipo_visitante
    } = req.body;

    if (!fecha_y_hora || !id_estadio || !id_equipo_local || !id_equipo_visitante) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    if (id_equipo_local === id_equipo_visitante) {
        return res.status(400).json({
            error: 'El equipo local y visitante no pueden ser el mismo'
        });
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
        const id_administrador = decodedToken.uid;

        if (rolUsuario !== 'administrador') {
            return res.status(403).json({
                error: 'No tiene permisos para realizar esta acción'
            });
        }

        conn = await pool.getConnection();
        await conn.beginTransaction();

        const [estadio] = await conn.query(
            `SELECT id_estadio, pais FROM estadio WHERE id_estadio = ?`,
            [id_estadio]
        );

        if (estadio.length === 0) {
            await conn.rollback();
            return res.status(404).json({ error: 'El estadio no existe' });
        }

        const [equipoLocal] = await conn.query(
            `SELECT id_equipo FROM equipos WHERE id_equipo = ?`,
            [id_equipo_local]
        );

        if (equipoLocal.length === 0) {
            await conn.rollback();
            return res.status(404).json({ error: 'El equipo local no existe' });
        }

        const [equipoVisitante] = await conn.query(
            `SELECT id_equipo FROM equipos WHERE id_equipo = ?`,
            [id_equipo_visitante]
        );

        if (equipoVisitante.length === 0) {
            await conn.rollback();
            return res.status(404).json({ error: 'El equipo visitante no existe' });
        }

        const [administradorReg] = await conn.query(
            `SELECT a.id_usuario, u.direccion_pais
             FROM administrador a
             JOIN usuario u ON a.id_usuario = u.id_usuario
             WHERE a.id_usuario = ?`,
            [id_administrador]
        );

        if (administradorReg.length === 0) {
            await conn.rollback();
            return res.status(404).json({ error: 'Administrador no encontrado' });
        }

        const paisAdmin = administradorReg[0].direccion_pais.trim().toLowerCase();
        const paisEstadio = estadio[0].pais.trim().toLowerCase();

        if (paisAdmin !== paisEstadio) {
            await conn.rollback();
            return res.status(403).json({
                error: 'El administrador no puede registrar eventos en otro país'
            });
        }

        const [eventoExistente] = await conn.query(
            `SELECT id_evento 
             FROM eventos 
             WHERE id_estadio = ? 
             AND DATE(fecha_y_hora) = DATE(?)`,
            [id_estadio, fecha_y_hora]
        );

        if (eventoExistente.length > 0) {
            await conn.rollback();
            return res.status(409).json({
                error: 'Ya existe un evento en este estadio ese día'
            });
        }

        const [resultado] = await conn.query(
            `INSERT INTO eventos (fecha_y_hora, id_estadio, id_administrador)
             VALUES (?, ?, ?)`,
            [fecha_y_hora, id_estadio, id_administrador]
        );

        const id_evento = resultado.insertId;

        await conn.query(
            `INSERT INTO participan (id_evento, id_equipo)
             VALUES (?, ?), (?, ?)`,
            [id_evento, id_equipo_local, id_evento, id_equipo_visitante]
        );

        await conn.commit();

        return res.status(201).json({
            message: 'Evento registrado correctamente',
            id_evento
        });

    } catch (error) {
        if (conn) await conn.rollback();
        console.error(error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'El evento ya existe' });
        }

        return res.status(500).json({
            error: error.message || 'Error interno al registrar el evento'
        });

    } finally {
        if (conn) conn.release();
    }
};

const HabilitarSectoresEvento = async (req, res) => {
    const { id_evento, nombre_sectores , precio} = req.body;

    if (!id_evento || !nombre_sectores || !Array.isArray(nombre_sectores) || !precio) {
        return res.status(400).json({
            error: 'Faltan campos obligatorios o sectores no es un array'
        });
    }

    if (nombre_sectores.length === 0) {
        return res.status(400).json({
            error: 'Debe proporcionar al menos un sector para habilitar'
        });
    }

    if (precio <= 0) {
        return res.status(400).json({
            error: 'El precio debe ser un número positivo'
        });
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

        if (rolUsuario !== 'administrador') {
            return res.status(403).json({
                error: 'No tiene permisos para realizar esta acción'
            });
        }

        conn = await pool.getConnection();
        await conn.beginTransaction();

        const [evento] = await conn.query(
            `SELECT id_evento, id_estadio
             FROM eventos
             WHERE id_evento = ?`,
            [id_evento]
        );

        if (evento.length === 0) {
            await conn.rollback();
            return res.status(404).json({ error: 'Evento no encontrado' });
        }

        const id_estadio = evento[0].id_estadio;

        for (const nombre_sector of nombre_sectores) {
            const [sector] = await conn.query(
                `SELECT nombre
                 FROM sector
                 WHERE id_estadio = ? AND nombre = ?`,
                [id_estadio, nombre_sector]
            );

            if (sector.length === 0) {
                await conn.rollback();
                return res.status(404).json({
                    error: `El sector ${nombre_sector} no existe en el estadio`
                });
            }

            await conn.query(
                `INSERT INTO utilizan (id_evento, id_estadio, nombre_sector, precio)
                 VALUES (?, ?, ?, ?)`,
                [id_evento, id_estadio, nombre_sector, precio]
            );
        }

        await conn.commit();

        return res.json({
            message: 'Sectores habilitados para el evento correctamente'
        });

    } catch (error) {
        if (conn) await conn.rollback();
        console.error(error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                error: 'El sector ya estaba habilitado para este evento'
            });
        }

        return res.status(500).json({
            error: error.message || 'Error interno al habilitar sectores'
        });

    } finally {
        if (conn) conn.release();
    }
};

const listarEventos = async (req, res) => {
    try {
        const [eventos] = await pool.query(`
            SELECT 
                e.id_evento,
                e.fecha_y_hora,
                est.pais AS estadio_pais,
                est.id_estadio,
                GROUP_CONCAT(eq.nombre ORDER BY eq.nombre SEPARATOR ' vs ') AS equipos
            FROM eventos e
            JOIN estadio est ON e.id_estadio = est.id_estadio
            JOIN participan p ON e.id_evento = p.id_evento
            JOIN equipos eq ON p.id_equipo = eq.id_equipo
            GROUP BY e.id_evento, e.fecha_y_hora, est.pais, est.id_estadio
            ORDER BY e.fecha_y_hora ASC
        `);

        res.json(eventos);

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const obtenerSectoresEvento = async (req, res) => {
    const { id } = req.params;

    try {
        const [eventos] = await pool.query(
            `SELECT * FROM eventos WHERE id_evento = ?`,
            [id]
        );

        if (!eventos.length) {
            return res.status(404).json({ error: 'Evento no encontrado' });
        }

        const [sectores] = await pool.query(`
            SELECT 
                s.nombre,
                s.capacidad,
                s.capacidad - COUNT(en.id_entrada) AS disponibles
            FROM utilizan u
            JOIN sector s 
                ON u.id_estadio = s.id_estadio 
                AND u.nombre_sector = s.nombre
            LEFT JOIN entrada en 
                ON en.id_evento = ?
                AND en.nombre_sector = s.nombre
                AND en.validez = 1
            WHERE u.id_evento = ?
            GROUP BY s.nombre, s.capacidad
        `, [id, id]);

        res.json({ id_evento: id, sectores });

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = {
    listarEventos,
    obtenerSectoresEvento,
    registrarEventos,
    HabilitarSectoresEvento
};