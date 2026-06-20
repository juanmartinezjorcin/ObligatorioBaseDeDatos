// el app va a hacer 3 cosas
// 1. crear el express y configurar el middleware de autenticacion para que el frontend hable con la API (json como request)
// 2. registrar todas las rutas de la API 
// 3. arranca el server por el .env

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// aca estan las rutas
app.use('/api/usuarios',       require('./routes/usuarios'));
app.use('/api/eventos',        require('./routes/eventos'));
app.use('/api/estadios',       require('./routes/estadios'));
app.use('/api/entradas',       require('./routes/entradas'));
app.use('/api/ventas',         require('./routes/ventas'));
app.use('/api/transferencias', require('./routes/transferencias'));
app.use('/api/equipos',        require('./routes/equipos'));

//esto lo puse solo para saber si esta vivo el server
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.listen(process.env.PORT, () => {
  console.log(`API corriendo en puerto ${process.env.PORT}`);
});

