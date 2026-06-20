const router = require ('express').Router();
const auth = require('../middleware/auth');
const { crearTransferencia, confirmarTransferencia } = require('../controllers/transferenciasController');

router.post('/crear', auth, crearTransferencia);

router.post('/confirmar', auth, confirmarTransferencia);

router.get('/', (req, res) => res.json({ message: 'ruta transferencias ok' }));

module.exports = router;