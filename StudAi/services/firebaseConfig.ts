// MVC: Model - Firebase Configuration
// Este archivo centraliza la conexión a Firebase.
// Cuando tengas tu proyecto, reemplaza las credenciales aquí.

// NOTA: Estas importaciones requieren instalar firebase: 'npm install firebase'
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  // Reemplaza con los valores de tu consola: console.firebase.google.com
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "TU_API_KEY_REAL",
  authDomain: "tu-proyecto-ucv.firebaseapp.com",
  projectId: "tu-proyecto-ucv",
  storageBucket: "tu-proyecto-ucv.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456:web:abcdef"
};

// Inicializamos la app solo si estamos en un entorno que lo soporte o tenemos keys
// Para el prototipo, esto no bloqueará la app si fallan las keys.
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
