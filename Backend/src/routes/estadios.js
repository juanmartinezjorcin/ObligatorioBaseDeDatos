const router = require('express').Router();
const auth = require('../middleware/auth');
const { registrarEstadio, obtenerEstadio, agregarSectoresAEstadio, listarEstadios } = require('../controllers/estadiosController');

router.post('/registro', auth, registrarEstadio);
router.get('/obtener', obtenerEstadio);
router.get('/listar', listarEstadios);
router.post('/agregarSectores', auth, agregarSectoresAEstadio);

module.exports = router;