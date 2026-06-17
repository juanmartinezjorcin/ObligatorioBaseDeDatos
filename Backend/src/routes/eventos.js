const router = require ('express').Router();
const auth = require('../middleware/auth');
const { listarEventos, obtenerSectoresEvento, registrarEventos } = require('../controllers/eventosController');

//listar
router.get('/', listarEventos);

//ver sectores de evento
router.get('/:id/sectores', obtenerSectoresEvento);

router.post('/registro', registrarEventos);

module.exports = router;