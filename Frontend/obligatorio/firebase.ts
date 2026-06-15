import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

//inicializacion de firebase y export de auth para el login y registro


const firebaseConfig = {
  apiKey: "AIzaSyDzJwQITBCryYf-YrT7Gi17y25OWdemvyI",
  authDomain: "obligatorio-base-de-dato-92923.firebaseapp.com",
  projectId: "obligatorio-base-de-dato-92923",
  storageBucket: "obligatorio-base-de-dato-92923.firebasestorage.app",
  messagingSenderId: "795391978103",
  appId: "1:795391978103:web:084b2a609157313a603472"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

