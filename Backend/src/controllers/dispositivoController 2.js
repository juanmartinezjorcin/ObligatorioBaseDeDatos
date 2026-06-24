const pool = require('../config/db');
const { getAuth } = require('firebase-admin/auth');

const asociarDispositivo = async (req, res) => {
    const { id_dispositivo } = req.body;

    if (!id_dispositivo) {
        return res.status(400).json({
            error: 'Falta id_dispositivo'
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

        if (decodedToken.role !== 'funcionario') {
            return res.status(403).json({
                error: 'No autorizado'
            });
        }

        const id_funcionario = decodedToken.uid;

        conn = await pool.getConnection();

        const [funcionario] = await conn.query(`
            SELECT *
            FROM funcionario_de_validacion
            WHERE id_usuario = ?
        `, [id_funcionario]);

        if (funcionario.length === 0) {
            return res.status(404).json({
                error: 'Funcionario no encontrado'
            });
        }

        const [dispositivo] = await conn.query(`
            SELECT *
            FROM dispositivo
            WHERE id_dispositivo = ?
        `, [id_dispositivo]);

        if (dispositivo.length === 0) {
            return res.status(404).json({
                error: 'Dispositivo no encontrado'
            });
        }

        if (dispositivo[0].id_funcionario) {
            return res.status(400).json({
                error: 'El dispositivo ya está asociado a otro funcionario'
            });
        }

        const [yaTiene] = await conn.query(`
            SELECT *
            FROM dispositivo
            WHERE id_funcionario = ?
        `, [id_funcionario]);

        if (yaTiene.length > 0) {
            return res.status(400).json({
                error: 'Este funcionario ya tiene un dispositivo asociado'
            });
        }

        await conn.query(`
            UPDATE dispositivo
            SET id_funcionario = ?
            WHERE id_dispositivo = ?
        `, [id_funcionario, id_dispositivo]);

        return res.status(200).json({
            message: 'Dispositivo asociado correctamente'
        });

    } catch (error) {
        console.error('Error al asociar dispositivo:', error);
        return res.status(500).json({
            error: error.message || 'Error interno del servidor'
        });
    } finally {
        if (conn) conn.release();
    }
};

module.exports = { asociarDispositivo };