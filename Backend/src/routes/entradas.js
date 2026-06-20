const router = require ('express').Router();
const auth = require('../middleware/auth');
const { traerEntradas, traerEntradasValidas, generarQR, validarQR} = require('../controllers/entradasController');

router.get('/', auth, traerEntradas);

router.get('/validas', auth, traerEntradasValidas);
    
router.get('/qr', auth, generarQR);

router.post('/validar', auth, validarQR);

module.exports = router;