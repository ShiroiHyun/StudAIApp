import { User, Course } from '../types';
import { db, auth } from './firebaseConfig'; 
import { collection, getDocs, query, where } from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';

// MVC: Model Service - Data Repository
// Este archivo actúa como intermediario. 
// Cambia USE_FIREBASE a 'true' cuando tengas tu backend listo.

const USE_FIREBASE = false;

// --- MOCK DATA ---
const MOCK_USER: User = {
    id: 'ucv-001',
    name: 'Juan Christian Alfaro',
    email: 'estudiante@ucvvirtual.edu.pe',
    role: 'student',
    career: 'Ingeniería de Sistemas',
    cycle: 'VIII',
    photoUrl: 'https://picsum.photos/200'
};

const MOCK_COURSES: Course[] = [
    { id: '1', name: 'Inteligencia Artificial', schedule: 'Lun 08:00 - 12:00', professor: 'Dr. Guevara' },
    { id: '2', name: 'Tesis II', schedule: 'Mar 14:00 - 18:00', professor: 'Mg. Perez' },
    { id: '3', name: 'Gestión de Proyectos', schedule: 'Jue 18:00 - 22:00', professor: 'Ing. Sanchez' }
];

// --- SERVICE METHODS ---

export const loginUser = async (email: string, password?: string): Promise<User> => {
    if (USE_FIREBASE) {
        // Implementación Real con Firebase Auth
        try {
            if (!password) throw new Error("Password requerido para Firebase");
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            // Aquí deberías buscar datos extra del usuario en Firestore si es necesario
            return {
                ...MOCK_USER,
                id: userCredential.user.uid,
                email: userCredential.user.email || '',
                name: userCredential.user.displayName || 'Estudiante UCV'
            };
        } catch (error) {
            console.error("Firebase Login Error", error);
            throw error;
        }
    } else {
        // Implementación Mock
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ ...MOCK_USER, email });
            }, 1000);
        });
    }
};

export const getStudentCourses = async (studentId: string): Promise<Course[]> => {
    if (USE_FIREBASE) {
        // Implementación Real con Firestore
        try {
            const q = query(collection(db, "courses"), where("studentId", "==", studentId));
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
        } catch (error) {
            console.error("Firestore Error", error);
            return [];
        }
    } else {
        // Implementación Mock
        return Promise.resolve(MOCK_COURSES);
    }
};