const router = require ('express').Router();

router.get('/', (req, res) => res.json({ message: 'ruta entradas ok' }));

module.exports = router;