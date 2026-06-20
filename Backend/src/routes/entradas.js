const router = require ('express').Router();
const auth = require('../middleware/auth');
const { traerEntradas, traerEntradasValidas} = require('../controllers/entradasController');

router.get('/', auth, traerEntradas);

router.get('/validas', auth, traerEntradasValidas);

module.exports = router;