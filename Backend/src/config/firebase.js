// Inicializacion de Firebase Admin usando variables de entorno.
// Si falta algun dato de la cuenta de servicio, el backend debe fallar con un error claro.

const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKeyId: process.env.private_key_id,
  privateKey: process.env.private_key?.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL || process.env.client_email,
};

const missingFields = Object.entries(serviceAccount)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingFields.length > 0) {
  throw new Error(
    `Faltan variables de entorno para Firebase Admin: ${missingFields.join(', ')}`
  );
}

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

module.exports = { getAuth };
