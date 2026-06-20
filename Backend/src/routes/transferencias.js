const router = require ('express').Router();
const auth = require('../middleware/auth');
const { crearTransferencia, confirmarTransferencia , listaTransferencias} = require('../controllers/transferenciasController');

router.post('/crear', auth, crearTransferencia);

router.post('/confirmar', auth, confirmarTransferencia);

router.get('/listar', auth, listaTransferencias);

module.exports = router;