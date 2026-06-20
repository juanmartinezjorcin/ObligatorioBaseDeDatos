const router = require ('express').Router();
const auth = require('../middleware/auth');
const { traerEntradas, traerEntradasValidas, generarQR} = require('../controllers/entradasController');

router.get('/', auth, traerEntradas);

router.get('/validas', auth, traerEntradasValidas);
    
router.get('/qr', auth, generarQR);

module.exports = router;