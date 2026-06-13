const router = require('express').Router();

router.get('/', (req, res) => res.json({ message: 'ruta usuarios ok' }));

module.exports = router;