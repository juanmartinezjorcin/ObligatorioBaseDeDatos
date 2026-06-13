
const pool = require('../config/db');

const registrarUsuario = async (req, res) => {
    const {
        id_usuario,
        mail,
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

 if (!id_usuario || !mail || !tipo_documento || !numero_documento || !pais_documento) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

const conn = await pool.getConnection();

try {
    await conn.beginTransaction();

    //insercion del usuario
     const [result] = await conn.query(
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

//insercion en usuario general

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
    res.status(201).json({ message: 'Usuario registrado correctamente' });
} catch (e) {
    await conn.rollback();
    if (e.code === 'ER_DUP_ENTRY') {
        res.status(409).json({ error: 'El usuario ya existe' });
    }
    console.error(e);
    res.status(500).json({ error: 'Error interno del servidor :(' });
} finally {
    conn.release();
}
};

//GET USUARIOS/perfil para ver los datos de tu usuario. (tambien usado para el login).

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

module.exports = {
    registrarUsuario,
    obtenerPerfil
};