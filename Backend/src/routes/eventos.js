const router = require ('express').Router();
const auth = require('../middleware/auth');
const { listarEventos, obtenerSectoresEvento } = require('../controllers/eventosController');

//listar
router.get('/', listarEventos);

//ver sectores de evento
router.get('/:id/sectores', obtenerSectoresEvento);

module.exports = router;