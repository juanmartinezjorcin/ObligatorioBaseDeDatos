//inicilizacion de firebase admin (cuando el frontend mande token, este archivo da las herramientas para 
// confirmar que ese token es legitimo y no es falsificado

const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const serviceAccount = require('../../firebase-service-account.json');

initializeApp({
  credential: cert(serviceAccount)
});

module.exports = { getAuth };
