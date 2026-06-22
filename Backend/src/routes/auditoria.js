const router = require('express').Router();
const auth = require('../middleware/auth');
const { listarAuditoria, filtrarPorResultado } = require('../controllers/auditoriaController');

router.get('/listar', auth, listarAuditoria);
router.get('/filtrar', auth, filtrarPorResultado);

module.exports = router;