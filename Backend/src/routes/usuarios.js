const router = require('express').Router();
const auth = require('../middleware/auth');
const { registrarUsuario, obtenerPerfil, registrarAdmin, registrarFuncionario} = require('../controllers/usuariosController');


router.post('/registro', registrarUsuario);

router.get('/perfil', auth, obtenerPerfil);

router.post('/registro_admin', registrarAdmin);

router.post('/registro_funcionario', registrarFuncionario);

module.exports = router;