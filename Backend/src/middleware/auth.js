
// Funcion a ejecutar entre la request y el controlador, para verificar que el usuario este autenticado. cada 
// request tiene que pasar por aca antes de llegar al destino.

const { getAuth } = require('../config/firebase');
const pool = require('../config/db');

module.exports = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  const token = header.split('Bearer ')[1];
  try {
    const decoded = await getAuth().verifyIdToken(token);

    const [rows] = await pool.query(
      'SELECT * FROM usuario WHERE id_usuario = ?',
      [decoded.uid]
    );
    if (!rows.length) return res.status(403).json({ error: 'Usuario no registrado' });

    req.user = rows[0];
    next();
  } catch (e) {
    console.error(e);
    return res.status(401).json({ error: 'Token inválido' });
  }
};
