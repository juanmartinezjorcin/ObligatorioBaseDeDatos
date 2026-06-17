const router = require ('express').Router();
const auth = require('../middleware/auth');
const { registrarEstadio } = require('../controllers/estadiosController');

router.post('/registro', registrarEstadio);

router.get('/', (req, res) => res.json({ message: 'ruta estadios ok' }));

module.exports = router;