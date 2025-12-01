
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBGI_Ghv-w97zaBrc7VIcpBFDm9vW-KFtw",
  authDomain: "studai-25f62.firebaseapp.com",
  projectId: "studai-25f62",
  storageBucket: "studai-25f62.firebasestorage.app",
  messagingSenderId: "614252956834",
  appId: "1:614252956834:web:5520c2fa215745babd1bfb",
  measurementId: "G-3H5XZTYE4D"
};

const app = initializeApp(firebaseConfig);
export const dbFirestore = getFirestore(app);
