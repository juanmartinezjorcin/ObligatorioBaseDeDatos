//inicilizacion de firebase admin (cuando el frontend mande token, este archivo da las herramientas para 
// confirmar que ese token es legitimo y no es falsificado

const admin = require('firebase-admin');

if (!admin.apps || !admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

module.exports = admin;
