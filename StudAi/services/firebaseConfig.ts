import { initializeApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

// MVC: Model - Firebase Configuration

const apiKey = process.env.REACT_APP_FIREBASE_API_KEY;

// Validar si existen las credenciales para evitar crash
export const isFirebaseConfigured = !!apiKey;

let app;
let db: Firestore;
let auth: Auth;

if (isFirebaseConfigured) {
    const firebaseConfig = {
        apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
        authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
        storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.REACT_APP_FIREBASE_APP_ID
    };

    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
} else {
    console.warn("⚠️ Firebase Config: No se encontraron API Keys. La aplicación funcionará en Modo Mock (Simulado).");
    // Exportar objetos vacíos para evitar errores de importación, pero no se usarán gracias al flag isFirebaseConfigured
    db = {} as Firestore;
    auth = {} as Auth;
}

export { db, auth };