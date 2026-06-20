const router = require ('express').Router();
const auth = require('../middleware/auth');
const { asociarDispositivo } = require('../controllers/dispositivoController');

router.post('/asociar', auth, asociarDispositivo);

module.exports = router;