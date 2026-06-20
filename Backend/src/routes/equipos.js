const router = require('express').Router();
const { listarEquipos } = require('../controllers/equiposController');

router.get('/', listarEquipos);

module.exports = router;