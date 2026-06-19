const router = require ('express').Router();
const auth = require('../middleware/auth');
const { listarEventos, obtenerSectoresEvento, registrarEventos, HabilitarSectoresEvento } = require('../controllers/eventosController');

//listar
router.get('/', listarEventos);

//ver sectores de evento
router.get('/:id/sectores', obtenerSectoresEvento);

router.post('/registro', auth, registrarEventos);

router.post('/habilitar-sectores', HabilitarSectoresEvento);


module.exports = router;