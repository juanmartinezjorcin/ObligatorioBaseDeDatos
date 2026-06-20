const router = require('express').Router();
const auth = require('../middleware/auth');
const { registrarUsuario, obtenerPerfil, registrarAdmin} = require('../controllers/usuariosController');


router.post('/registro', registrarUsuario);

router.get('/perfil', auth, obtenerPerfil);

router.post('/registro_admin', auth, registrarAdmin);

router.get('/', (req, res) => res.json({ message: 'ruta usuarios ok' }));

module.exports = router;