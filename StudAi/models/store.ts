import { dbFirestore } from '../firebaseConfig';
import { collection, getDocs, doc, setDoc, updateDoc, query, where, addDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { User, Appointment, Course, Metric, Notification, Ticket } from '../types';

// This Store now acts as an abstraction layer over Firebase
class AppStore {
  
  // --- USER ---
  async getUser(email: string): Promise<User | null> {
    try {
      const q = query(collection(dbFirestore, "users"), where("email", "==", email));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const d = querySnapshot.docs[0];
        return { id: d.id, ...d.data() } as User;
      }
      return null;
    } catch (e) {
      console.error("Firebase Error:", e);
      return null;
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    try {
      const ref = doc(dbFirestore, "users", userId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() } as User;
      }
      return null;
    } catch (e) {
      console.error("Firebase Error:", e);
      return null;
    }
  }

  async createUser(user: Omit<User, 'id'>): Promise<User | null> {
    try {
      const docRef = await addDoc(collection(dbFirestore, "users"), user);
      return { id: docRef.id, ...user };
    } catch (e) {
      console.error("Error creating user:", e);
      return null;
    }
  }

  async updateUser(userId: string, data: Partial<User>) {
    try {
      const ref = doc(dbFirestore, "users", userId);
      await updateDoc(ref, data);
      return true;
    } catch (e) {
      return false;
    }
  }

  // --- APPOINTMENTS ---
  async getAppointments(userId: string): Promise<Appointment[]> {
    try {
      const q = query(collection(dbFirestore, "appointments"), where("userId", "==", userId));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Appointment));
    } catch (e) {
      return [];
    }
  }

  async addAppointment(apt: Omit<Appointment, 'id'>): Promise<Appointment> {
    const ref = await addDoc(collection(dbFirestore, "appointments"), apt);
    return { id: ref.id, ...apt };
  }

  async updateAppointmentStatus(id: string, status: string) {
    await updateDoc(doc(dbFirestore, "appointments", id), { status });
  }

  // --- COURSES ---
  async getCourses(userId: string): Promise<Course[]> {
    try {
      const q = query(collection(dbFirestore, "courses"), where("userId", "==", userId));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Course));
    } catch (e) {
      return [];
    }
  }

  async addCourse(course: Omit<Course, 'id'>): Promise<Course> {
    const ref = await addDoc(collection(dbFirestore, "courses"), course);
    return { id: ref.id, ...course };
  }

  // --- NOTIFICATIONS ---
  async getNotifications(userId: string): Promise<Notification[]> {
    try {
      const q = query(collection(dbFirestore, "notifications"), where("userId", "==", userId));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Notification));
    } catch (e) {
      return [];
    }
  }

  async markNotificationRead(id: string) {
    await updateDoc(doc(dbFirestore, "notifications", id), { read: true });
  }

  // --- TICKETS / ADMIN ---
  async getTickets(): Promise<Ticket[]> {
    const snap = await getDocs(collection(dbFirestore, "tickets"));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Ticket));
  }

  async resolveTicket(id: string) {
    await updateDoc(doc(dbFirestore, "tickets", id), { status: 'resolved' });
  }

  async getMetrics(): Promise<Metric[]> {
    // In a real app, these would be aggregated. We'll store them as a doc.
    const snap = await getDocs(collection(dbFirestore, "metrics"));
    return snap.docs.map(d => d.data() as Metric);
  }
}

export const db = new AppStore();