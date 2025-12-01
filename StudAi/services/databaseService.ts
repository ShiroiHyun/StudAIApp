import { User, Course, CampusLocation } from '../types';
import { db, auth, isFirebaseConfigured } from './firebaseConfig'; 
import { collection, getDocs, query, where, doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

// MVC: Model Service - Data Repository

// Detectar automáticamente si podemos usar Firebase o debemos usar Mock
const USE_FIREBASE = isFirebaseConfigured;

// --- MOCK DATA (Fallback de seguridad) ---
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

const MOCK_LOCATIONS: CampusLocation[] = [
    { 
        id: '1', 
        name: 'Biblioteca Central', 
        description: 'Edificio B, Primer Piso. Puertas de vidrio automáticas.', 
        category: 'servicios',
        stepsFromEntrance: [
            "Desde la entrada principal, camina 50 pasos de frente.",
            "Gira a la derecha en la fuente de agua.",
            "Camina 20 pasos hasta sentir el cambio de piso a losetas lisas.",
            "La entrada está a tu izquierda."
        ]
    },
    { 
        id: '2', 
        name: 'Laboratorio de Cómputo 4', 
        description: 'Pabellón C, Segundo Piso, Aula 204.', 
        category: 'aulas',
        stepsFromEntrance: [
            "Desde la entrada, gira a la izquierda hacia el Pabellón C.",
            "Sube las escaleras o usa la rampa a tu derecha.",
            "En el segundo piso, avanza por el pasillo principal 30 metros.",
            "Es la segunda puerta a la derecha."
        ]
    },
    { 
        id: '3', 
        name: 'Bienestar Universitario', 
        description: 'Oficina de atención al estudiante.', 
        category: 'administrativo',
        stepsFromEntrance: [
            "Camina recto pasando la cafetería.",
            "Gira a la izquierda antes del auditorio.",
            "La oficina tiene una ventanilla de atención táctil a media altura."
        ]
    }
];

// --- SERVICE METHODS ---

export const loginUser = async (email: string, password?: string): Promise<User> => {
    // Validación de entrada
    if (!email || !email.includes('@')) throw new Error("Email inválido");
    
    if (USE_FIREBASE) {
        try {
            if (!password) throw new Error("Password requerido");
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const uid = userCredential.user.uid;

            const userDocRef = doc(db, "users", uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const userData = userDoc.data();
                return {
                    id: uid,
                    email: userCredential.user.email || '',
                    name: userData.name || userCredential.user.displayName || 'Estudiante',
                    role: 'student',
                    career: userData.career || 'Sin Carrera',
                    cycle: userData.cycle || 'I',
                    photoUrl: userData.photoUrl || 'https://picsum.photos/200'
                };
            } else {
                return {
                    ...MOCK_USER,
                    id: uid,
                    email: userCredential.user.email || ''
                };
            }
        } catch (error) {
            console.error("Firebase Login Error", error);
            throw error;
        }
    } else {
        return new Promise((resolve) => {
            setTimeout(() => resolve({ ...MOCK_USER, email }), 1000);
        });
    }
};

export const registerUser = async (email: string, password: string, userData: { name: string, career: string, cycle: string }): Promise<User> => {
    // Sanitización básica
    if (!userData.name.trim() || !userData.career.trim()) throw new Error("Datos incompletos");

    if (USE_FIREBASE) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const uid = userCredential.user.uid;

            const newUser: User = {
                id: uid,
                email: email,
                role: 'student',
                name: userData.name.trim(),
                career: userData.career.trim(),
                cycle: userData.cycle.trim(),
                photoUrl: 'https://picsum.photos/200'
            };

            await setDoc(doc(db, "users", uid), newUser);
            return newUser;

        } catch (error) {
            console.error("Firebase Register Error", error);
            throw error;
        }
    } else {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    id: 'new-user-' + Date.now(),
                    email,
                    role: 'student',
                    ...userData,
                    photoUrl: 'https://picsum.photos/200'
                });
            }, 1000);
        });
    }
};

export const updateUserProfile = async (userId: string, data: Partial<User>): Promise<void> => {
    if (!userId) throw new Error("ID de usuario requerido");
    
    if (USE_FIREBASE) {
        try {
            const userRef = doc(db, "users", userId);
            // Solo actualizamos campos definidos
            const cleanData = JSON.parse(JSON.stringify(data)); 
            await updateDoc(userRef, cleanData);
        } catch (error) {
            console.error("Firebase Update Error", error);
            throw error;
        }
    } else {
        return new Promise((resolve) => {
            setTimeout(() => resolve(), 500);
        });
    }
};

export const getStudentCourses = async (studentId: string): Promise<Course[]> => {
    if (USE_FIREBASE) {
        try {
            const q = query(collection(db, "courses"), where("studentId", "==", studentId));
            const querySnapshot = await getDocs(q);
            
            if (querySnapshot.empty) {
                // Si la DB está vacía, devolvemos Mock para que la demo no se vea rota.
                return MOCK_COURSES; 
            }

            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
        } catch (error) {
            console.error("Firestore Error", error);
            return MOCK_COURSES;
        }
    } else {
        return Promise.resolve(MOCK_COURSES);
    }
};

export const getCampusLocations = async (): Promise<CampusLocation[]> => {
    if (USE_FIREBASE) {
        try {
            const querySnapshot = await getDocs(collection(db, "locations"));
            if (querySnapshot.empty) return MOCK_LOCATIONS;
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CampusLocation));
        } catch (error) {
            console.error(error);
            return MOCK_LOCATIONS;
        }
    } else {
        return Promise.resolve(MOCK_LOCATIONS);
    }
};