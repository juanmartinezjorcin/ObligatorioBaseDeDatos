const router = require ('express').Router();
const auth = require('../middleware/auth');
const { traerEntradas, traerEntradasValidas} = require('../controllers/entradasController');

router.get('/', auth, traerEntradas);

router.get('/validas', auth, traerEntradasValidas);

router.get('/', (req, res) => res.json({ message: 'ruta entradas ok' }));

module.exports = router;