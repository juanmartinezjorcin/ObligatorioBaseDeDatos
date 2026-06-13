const router = require ('express').Router();

router.get('/', (req, res) => res.json({ message: 'ruta transferencias ok' }));

module.exports = router;