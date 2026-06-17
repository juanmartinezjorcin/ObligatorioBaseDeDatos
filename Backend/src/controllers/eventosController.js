const pool = require('../config/db');

const registrarEventos = async (req, res) => {
    const {
        fecha_y_hora,
        id_estadio,
        id_equipo_local,
        id_equipo_visitante,
        id_administrador
    } = req.body;

    if (
        !fecha_y_hora ||
        !id_estadio ||
        !id_equipo_local ||
        !id_equipo_visitante ||
        !id_administrador
    ) {
        return res.status(400).json({
            error: 'Faltan campos obligatorios'
        });
    }

    if (id_equipo_local === id_equipo_visitante) {
        return res.status(400).json({
            error: 'El equipo local y visitante no pueden ser el mismo'
        });
    }

// AUTENTICACIÓN FIREBASE (DESCOMENTAR CUANDO LA USES)

    // const authHeader = req.headers.authorization;

    // if (!authHeader || !authHeader.startsWith('Bearer ')) {
    //     return res.status(401).json({
    //         error: 'Token requerido'
    //     });
    // }

    // const token = authHeader.split(' ')[1];

    // const decodedToken = await admin.auth().verifyIdToken(token);

    // Verificar permisos de administrador

    // const [usuarios] = await conn.query(
    //     'SELECT rol FROM usuario WHERE uid_firebase = ?',
    //     [decodedToken.uid]
    // );

    // if (
    //     usuarios.length === 0 ||
    //     usuarios[0].rol !== 'administrador'
    // ) {
    //     return res.status(403).json({
    //         error: 'No tiene permisos para realizar esta acción'
    //     });
    // }


    let conn;

    try {
        conn = await pool.getConnection();
        await conn.beginTransaction();

        const [estadio] = await conn.query(
            `SELECT id_estadio, pais
             FROM estadio
             WHERE id_estadio = ?`,
            [id_estadio]
        );

        if (estadio.length === 0) {
            return res.status(404).json({
                error: 'El estadio no existe'
            });
        }

        const [equipoLocal] = await conn.query(
            `SELECT id_equipo
             FROM equipos
             WHERE id_equipo = ?`,
            [id_equipo_local]
        );

        if (equipoLocal.length === 0) {
            return res.status(404).json({
                error: 'El equipo local no existe'
            });
        }

        const [equipoVisitante] = await conn.query(
            `SELECT id_equipo
             FROM equipos
             WHERE id_equipo = ?`,
            [id_equipo_visitante]
        );

        if (equipoVisitante.length === 0) {
            return res.status(404).json({
                error: 'El equipo visitante no existe'
            });
        }

        const [admin] = await conn.query(
            `SELECT a.id_usuario, u.direccion_pais
             FROM administrador a
             JOIN usuario u ON a.id_usuario = u.id_usuario
             WHERE a.id_usuario = ?`,
            [id_administrador]
        );

        if (admin.length === 0) {
            return res.status(404).json({
                error: 'Administrador no encontrado'
            });
        }

        if (admin[0].direccion_pais !== estadio[0].pais) {
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
            return res.status(409).json({
                error: 'Ya existe un evento en este estadio ese día'
            });
        }

        const [resultado] = await conn.query(
            `INSERT INTO eventos (
                fecha_y_hora,
                id_estadio,
                id_administrador
            ) VALUES (?, ?, ?)`,
            [
                fecha_y_hora,
                id_estadio,
                id_administrador
            ]
        );

        const id_evento = resultado.insertId;

        await conn.query(
            `INSERT INTO participan (
                id_evento,
                id_equipo
            ) VALUES (?, ?), (?, ?)`,
            [
                id_evento,
                id_equipo_local,
                id_evento,
                id_equipo_visitante
            ]
        );

        await conn.commit();

        return res.status(201).json({
            message: 'Evento registrado correctamente',
            id_evento
        });

    } catch (error) {
        if (conn) {
            await conn.rollback();
        }

        console.error(error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                error: 'El evento ya existe'
            });
        }

        return res.status(500).json({
            error: error.message || 'Error interno al registrar el evento'
        });

    } finally {
        if (conn) {
            conn.release();
        }
    }
};

const HabilitarSectoresEvento = async (req, res) => {
    const { id_evento, nombre_sectores } = req.body;
    if (!id_evento || !nombre_sectores || !Array.isArray(nombre_sectores)) {
        return res.status(400).json({
            error: 'Faltan campos obligatorios o sectores no es un array'
        });
    }
    try {
        
        // AUTENTICACIÓN FIREBASE (DESCOMENTAR CUANDO LA USES)

        // const authHeader = req.headers.authorization;

        // if (!authHeader || !authHeader.startsWith('Bearer ')) {
        //     return res.status(401).json({
        //         error: 'Token requerido'
        //     });
        // }

        // const token = authHeader.split(' ')[1];

        // const decodedToken = await admin.auth().verifyIdToken(token);

        // Verificar permisos de administrador

        // const [usuarios] = await conn.query(
        //     'SELECT rol FROM usuario WHERE uid_firebase = ?',
        //     [decodedToken.uid]
        // );

        // if (
        //     usuarios.length === 0 ||
        //     usuarios[0].rol !== 'administrador'
        // ) {
        //     return res.status(403).json({
        //         error: 'No tiene permisos para realizar esta acción'
        //     });
        // }

        conn = await pool.getConnection();
        await conn.beginTransaction();

        const [evento] = await conn.query(
            `SELECT id_evento, id_estadio
             FROM eventos
             WHERE id_evento = ?`,
            [id_evento]
        );

        if (evento.length === 0) {
            return res.status(404).json({
                error: 'Evento no encontrado'
            });
        }

        const id_estadio = evento[0].id_estadio;
        for (const nombre_sector of nombre_sectores) {

            const [sector] = await conn.query(
                `SELECT nombre
                 FROM sector
                 WHERE id_estadio = ? and nombre = ?`,
                [id_estadio, nombre_sector]
            );

            if (sector.length === 0) {
                await conn.rollback();
                return res.status(404).json({
                    error: `El sector ${nombre_sector} no existe en el estadio`
                });
            }

            await conn.query(
                `INSERT INTO utilizan (id_evento, id_estadio, nombre_sector)
                 VALUES (?, ?, ?)`,
                [id_evento, id_estadio, nombre_sector]
            );
        }

        await conn.commit();

        return res.json({
            message: 'Sectores habilitados para el evento correctamente'
        });
    } catch (error) {
        if (conn) {
            await conn.rollback();
        }

        console.error(error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                error: 'El sector ya estába habilitado para este evento'
            });
        }

        return res.status(500).json({
            error: error.message || 'Error interno al habilitar sectores para el evento'
        });

    } finally {
        if (conn) {
            conn.release();
        }
    }
};

    



// GET para listar todos los eventos disponibles
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

// GET para ver sectores disponibles de un evento
const obtenerSectoresEvento = async (req, res) => {
  const { id } = req.params;
  try {
    // Verificar que el evento existe
    const [eventos] = await pool.query(
      'SELECT * FROM eventos WHERE id_evento = ?',
      [id]
    );
    if (!eventos.length) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    // Obtener sectores habilitados para este evento con capacidad disponible
    const [sectores] = await pool.query(`
      SELECT 
        s.nombre,
        s.capacidad,
        s.capacidad - COUNT(en.id_entrada) AS disponibles
      FROM utilizan u
      JOIN sector s ON u.id_estadio = s.id_estadio AND u.nombre_sector = s.nombre
      LEFT JOIN entrada en ON en.id_evento = ? AND en.nombre_sector = s.nombre AND en.validez = 1
      WHERE u.id_evento = ?
      GROUP BY s.nombre, s.capacidad
    `, [id, id]);

    res.json({ id_evento: id, sectores });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = { listarEventos, obtenerSectoresEvento, registrarEventos, HabilitarSectoresEvento };
