const pool = require('../config/db');

const registrarEstadio = async (req, res) => {
    const {
        pais,
        sectores // EJ formato :[{"nombre": "B","capacidad": 18000},{"nombre": "A","capacidad": 12000}]
    } = req.body;

    if (!pais) {
        return res.status(400).json({
            error: 'Faltan campos obligatorios'
        });
    }

    let conn;

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

        await conn.query(
            `INSERT INTO estadio (
                pais
            ) VALUES (?)`,
            [
                pais
            ]
        );

        id_estadio = (await conn.query('SELECT LAST_INSERT_ID() AS id_estadio'))[0][0].id_estadio;

        if (Array.isArray(sectores) && sectores.length > 0) {

            for (const sector of sectores) {

                if (!sector.nombre || !sector.capacidad) {
                    throw new Error(
                        'Todos los sectores deben tener nombre y capacidad'
                    );
                }

                await conn.query(
                    `INSERT INTO sector (
                        id_estadio,
                        nombre,
                        capacidad
                    ) VALUES (?, ?, ?)`,
                    [
                        id_estadio,
                        sector.nombre,
                        sector.capacidad
                    ]
                );
            }
        }

        await conn.commit();

        return res.status(201).json({
            message: 'Estadio registrado correctamente',
            id_estadio
        });

    } catch (error) {

        if (conn) {
            await conn.rollback();
        }

        console.error(error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                error: 'El estadio o alguno de sus sectores ya existe'
            });
        }

        return res.status(500).json({
            error: error.message || 'Error interno al guardar el estadio'
        });

    } finally {

        if (conn) {
            conn.release();
        }

    }
};

const agregarSectoresAEstadio = async (req, res) => {
    const { id_estadio, sectores } = req.body;

    if (!id_estadio || !sectores || !Array.isArray(sectores)) {
        return res.status(400).json({
            error: 'Faltan campos obligatorios o sectores no es un array'
        });
    }

    try {
        conn = await pool.getConnection();
        await conn.beginTransaction();

        for (const sector of sectores) {

            if (!sector.nombre || !sector.capacidad) {
                throw new Error(
                    'Todos los sectores deben tener nombre y capacidad'
                );
            }

            const [estadio] = await conn.query(
                `SELECT id_estadio
                 FROM estadio
                 WHERE id_estadio = ?`,
                [id_estadio]
            );

            if (estadio.length === 0) {
                throw new Error('Estadio no encontrado');
             }

            await conn.query(
                `INSERT INTO sector (
                    id_estadio,
                    nombre,
                    capacidad
                ) VALUES (?, ?, ?)`,
                [
                    id_estadio,
                    sector.nombre,
                    sector.capacidad
                ]
            );
        }

        await conn.commit();

        return res.status(201).json({
            message: 'Sectores agregados correctamente al estadio',
            id_estadio
        });

    } catch (error) {
        if (conn) {
            await conn.rollback();
        }

        console.error(error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                error: 'El sector ya existe en el estadio'
            });
        }

        return res.status(500).json({
            error: error.message || 'Error interno al agregar sectores al estadio'
        });

    } finally {
        if (conn) {
            conn.release();
        }
    }
};

const obtenerEstadio = async (req, res) => {
    const { id_estadio } = req.body;

    if (!id_estadio) {
        return res.status(400).json({
            error: 'Debe proporcionar el id_estadio'
        });
    }

    try {

        const [estadios] = await pool.query(
            `SELECT *
             FROM estadio
             WHERE id_estadio = ?`,
            [id_estadio]
        );

        if (estadios.length === 0) {
            return res.status(404).json({
                error: 'Estadio no encontrado'
            });
        }

        const [sectores] = await pool.query(
            `SELECT nombre, capacidad
             FROM estadio_sector
             WHERE id_estadio = ?`,
            [id_estadio]
        );

        return res.json({
            ...estadios[0],
            sectores
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
};




module.exports = {
    registrarEstadio,
    obtenerEstadio,
    agregarSectoresAEstadio
};