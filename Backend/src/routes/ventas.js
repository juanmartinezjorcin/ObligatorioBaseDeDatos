const router = require ('express').Router();
const auth = require('../middleware/auth');
const { comprarEntradas, confirmarEntradas} = require('../controllers/ventasController');

router.post('/comprar', auth, comprarEntradas);

router.post('/confirmar', auth, confirmarEntradas);

module.exports = router;