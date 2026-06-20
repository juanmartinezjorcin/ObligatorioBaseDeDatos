const router = require ('express').Router();
const auth = require('../middleware/auth');
const { comprarEntradas, confirmarEntradas} = require('../controllers/ventasController');

router.post('/comprar', auth, comprarEntradas);

router.post('/confirmar', auth, confirmarEntradas);

router.get('/', (req, res) => res.json({ message: 'ruta ventas ok' }));

module.exports = router;