const pool = require('../config/db');
const { getAuth } = require('../config/firebase');

const registrarUsuario = async (req, res) => {
    const {
        mail,
        password,
        tipo_documento,
        numero_documento,
        pais_documento,
        direccion_pais,
        direccion_localidad,
        direccion_calle,
        direccion_numero,
        direccion_codigo_postal,
        telefonos,
    } = req.body;

    if (!mail || !password || !tipo_documento || !numero_documento || !pais_documento) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const auth = getAuth();
    let firebaseUser;

    try {
        firebaseUser = await auth.createUser({
            email: mail,
            password: password,
        });

        await auth.setCustomUserClaims(firebaseUser.uid, {
            role: 'general'
        });

    } catch (firebaseError) {
        console.error('Error en Firebase Auth:', firebaseError);
        if (firebaseError.code === 'auth/email-already-exists') {
            return res.status(409).json({ error: 'El correo electrónico ya está registrado' });
        }
        if (firebaseError.code === 'auth/invalid-password') {
            return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
        }
        return res.status(500).json({ error: 'Error al registrar en el servicio de autenticación' });
    }

    const id_usuario = firebaseUser.uid;
    let conn;

    try {
        conn = await pool.getConnection();
        await conn.beginTransaction();

        await conn.query(
            `INSERT INTO usuario 
                (id_usuario, mail, tipo_documento, numero_documento, pais_documento,
                direccion_pais, direccion_localidad, direccion_calle, direccion_numero,
                direccion_codigo_postal)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id_usuario, mail, tipo_documento, numero_documento, pais_documento,
                direccion_pais, direccion_localidad, direccion_calle, direccion_numero,
                direccion_codigo_postal
            ]
        );

        await conn.query(
            `INSERT INTO general (id_usuario, fecha_registro)
             VALUES (?, CURDATE())`,
            [id_usuario]
        );

        if (telefonos && telefonos.length > 0) {
            for (const telefono of telefonos) {
                await conn.query(
                    `INSERT INTO usuario_telefono (id_usuario, telefono) VALUES (?, ?)`,
                    [id_usuario, telefono]
                );
            }
        }

        await conn.commit();
        res.status(201).json({ message: 'Usuario registrado correctamente', id_usuario });

    } catch (dbError) {
            if (conn) {
            await conn.rollback();
        }
        console.error('Error en base de datos. Revirtiendo Firebase Auth...', dbError);

        try {
            // decidimos eliminamar el usuario creado en Firebase para evitar inconsistencias
            await auth.deleteUser(id_usuario);
            console.log('Usuario de Firebase eliminado con éxito tras fallo en Base de Datos');
        } catch (cleanupError) {
            console.error('Error crítico: No se pudo limpiar el usuario en Firebase:', cleanupError);
        }

        if (dbError.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'El documento o datos ya están registrados en el sistema' });
        }
        res.status(500).json({ error: 'Error interno al guardar los datos del perfil' });
    } finally {
        if (conn) {
            conn.release();
        }
    }
};

const registrarAdmin = async (req, res) => {
    const {
        mail,
        password,
        tipo_documento,
        numero_documento,
        pais_documento,
        direccion_pais,
        direccion_localidad,
        direccion_calle,
        direccion_numero,
        direccion_codigo_postal,
        telefonos,
    } = req.body;

    if (!mail || !password || !tipo_documento || !numero_documento || !pais_documento) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const auth = getAuth();
    let firebaseUser;

    try {
        firebaseUser = await auth.createUser({
            email: mail,
            password: password,
        });

        await auth.setCustomUserClaims(firebaseUser.uid, {
            role: 'administrador'
        });
        
    } catch (firebaseError) {
        console.error('Error en Firebase Auth:', firebaseError);
        if (firebaseError.code === 'auth/email-already-exists') {
            return res.status(409).json({ error: 'El correo electrónico ya está registrado' });
        }
        if (firebaseError.code === 'auth/invalid-password') {
            return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
        }
        return res.status(500).json({ error: 'Error al registrar en el servicio de autenticación' });
    }

    const id_usuario = firebaseUser.uid;
    let conn;

    try {
        conn = await pool.getConnection();
        await conn.beginTransaction();

        await conn.query(
            `INSERT INTO usuario 
                (id_usuario, mail, tipo_documento, numero_documento, pais_documento,
                direccion_pais, direccion_localidad, direccion_calle, direccion_numero,
                direccion_codigo_postal)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id_usuario, mail, tipo_documento, numero_documento, pais_documento,
                direccion_pais, direccion_localidad, direccion_calle, direccion_numero,
                direccion_codigo_postal
            ]
        );

        await conn.query(
            `INSERT INTO administrador (id_usuario, fecha_asignacion_cargo)
             VALUES (?, CURDATE())`,
            [id_usuario]
        );

        if (telefonos && telefonos.length > 0) {
            for (const telefono of telefonos) {
                await conn.query(
                    `INSERT INTO usuario_telefono (id_usuario, telefono) VALUES (?, ?)`,
                    [id_usuario, telefono]
                );
            }
        }



        await conn.commit();
        res.status(201).json({ message: 'Usuario registrado correctamente', id_usuario });

    } catch (dbError) {
            if (conn) {
            await conn.rollback();
        }
        console.error('Error en base de datos. Revirtiendo Firebase Auth...', dbError);

        try {
            // decidimos eliminamar el usuario creado en Firebase para evitar inconsistencias
            await auth.deleteUser(id_usuario);
            console.log('Usuario de Firebase eliminado con éxito tras fallo en Base de Datos');
        } catch (cleanupError) {
            console.error('Error crítico: No se pudo limpiar el usuario en Firebase:', cleanupError);
        }

        if (dbError.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'El documento o datos ya están registrados en el sistema' });
        }
        res.status(500).json({ error: 'Error interno al guardar los datos del perfil' });
    } finally {
        if (conn) {
            conn.release();
        }
    }
};

const obtenerPerfil = async (req, res) => {
    const id_usuario = req.user.id_usuario;
    try {
        const [telefonos] = await pool.query(
            `SELECT telefono FROM usuario_telefono WHERE id_usuario = ?`,
            [id_usuario]
        );
        
        res.json({
            ...req.user,
            telefonos: telefonos.map(t => t.telefono)
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Error interno del servidor :(' });
    }
};

const registrarFuncionario = async (req, res) => {
    const {
        mail,
        password,
        tipo_documento,
        numero_documento,
        pais_documento,
        direccion_pais,
        direccion_localidad,
        direccion_calle,
        direccion_numero,
        direccion_codigo_postal,
        telefonos,
        eventos,// nombre del sector eh id del evento
    } = req.body;

    if (!mail || !password || !tipo_documento || !numero_documento || !pais_documento) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const auth = getAuth();
    let firebaseUser;

    try {
        firebaseUser = await auth.createUser({
            email: mail,
            password: password,
        });

        await auth.setCustomUserClaims(firebaseUser.uid, {
            role: 'funcionario'
        });
        
    } catch (firebaseError) {
        console.error('Error en Firebase Auth:', firebaseError);
        if (firebaseError.code === 'auth/email-already-exists') {
            return res.status(409).json({ error: 'El correo electrónico ya está registrado' });
        }
        if (firebaseError.code === 'auth/invalid-password') {
            return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
        }
        return res.status(500).json({ error: 'Error al registrar en el servicio de autenticación' });
    }

    const id_usuario = firebaseUser.uid;
    let conn;

    try {
        conn = await pool.getConnection();
        await conn.beginTransaction();

        await conn.query(
            `INSERT INTO usuario 
                (id_usuario, mail, tipo_documento, numero_documento, pais_documento,
                direccion_pais, direccion_localidad, direccion_calle, direccion_numero,
                direccion_codigo_postal)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id_usuario, mail, tipo_documento, numero_documento, pais_documento,
                direccion_pais, direccion_localidad, direccion_calle, direccion_numero,
                direccion_codigo_postal
            ]
        );

        await conn.query(
            `INSERT INTO funcionario_de_validacion (id_usuario)
             VALUES (?)`,
            [id_usuario]
        );

        if (telefonos && telefonos.length > 0) {
            for (const telefono of telefonos) {
                await conn.query(
                    `INSERT INTO usuario_telefono (id_usuario, telefono) VALUES (?, ?)`,
                    [id_usuario, telefono]
                );
            }
        }

        if (eventos && eventos.length > 0) {
            for (const evento of eventos) {
                const [asignacion] = await conn.query(
                    `SELECT * FROM utilizan WHERE id_evento = ? and nombre_sector = ?`,
                    [evento.id_evento, evento.nombre_sector]
                );
                if (asignacion.length === 0) {
                    await conn.rollback();
                    return res.status(400).json({ error: `El evento ${evento.id_evento} con sector ${evento.nombre_sector} no existe` });
                }
                await conn.query(
                    `INSERT INTO  asignado(id_funcionario, id_evento, nombre_sector, id_estadio) VALUES (?, ?, ?, ?)`,
                    [id_usuario, asignacion[0].id_evento, asignacion[0].nombre_sector, asignacion[0].id_estadio]
                );
            }
        }

        await conn.commit();
        res.status(201).json({ message: 'Usuario registrado correctamente', id_usuario });

    } catch (dbError) {
            if (conn) {
            await conn.rollback();
        }
        console.error('Error en base de datos. Revirtiendo Firebase Auth...', dbError);

        try {
            await auth.deleteUser(id_usuario);
            console.log('Usuario de Firebase eliminado con éxito tras fallo en Base de Datos');
        } catch (cleanupError) {
            console.error('Error crítico: No se pudo limpiar el usuario en Firebase:', cleanupError);
        }

        if (dbError.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'El documento o datos ya están registrados en el sistema' });
        }
        res.status(500).json({ error: 'Error interno al guardar los datos del perfil' });
    } finally {
        if (conn) {
            conn.release();
        }
    }
};

module.exports = {
    registrarUsuario,
    obtenerPerfil,
    registrarAdmin,
    registrarFuncionario
};