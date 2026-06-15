// Inicializacion de Firebase Admin usando variables de entorno.
// Si falta algun dato de la cuenta de servicio, el backend debe fallar con un error claro.

const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const serviceAccount = require('../../firebase-service-account.json');

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

module.exports = { getAuth };