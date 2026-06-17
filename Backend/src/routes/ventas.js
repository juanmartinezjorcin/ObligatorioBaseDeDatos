const router = require ('express').Router();



router.get('/', (req, res) => res.json({ message: 'ruta ventas ok' }));

module.exports = router;