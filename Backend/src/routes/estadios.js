const router = require ('express').Router();
const auth = require('../middleware/auth');
const { registrarEstadio, obtenerEstadio, agregarSectoresAEstadio } = require('../controllers/estadiosController');

router.post('/registro', registrarEstadio);

router.get('/obtener', obtenerEstadio);

router.post('/agregarSectores', agregarSectoresAEstadio);

module.exports = router;