const router = require('express').Router();
const auth = require('../middleware/auth');
const { registrarUsuario, obtenerPerfil, registrarAdmin, registrarFuncionario} = require('../controllers/usuariosController');


router.post('/registro', registrarUsuario);

router.get('/perfil', auth, obtenerPerfil);

router.post('/registro_admin', registrarAdmin);

router.post('/registro_funcionario', registrarFuncionario);

router.get('/', (req, res) => res.json({ message: 'ruta usuarios ok' }));

module.exports = router;