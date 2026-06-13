const router = require ('express').Router();

router.get('/', (req, res) => res.json({ message: 'ruta estadios ok' }));

module.exports = router;