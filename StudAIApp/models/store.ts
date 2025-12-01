import { User, Appointment, Course, Metric, Notification, Ticket } from '../types';

const STORAGE_KEY = 'inclusive_studai_db_v3';

// Initial Seed Data (Default state)
const DEFAULT_DATA = {
  users: [
    {
      id: 'u1',
      name: 'Juan Pérez',
      email: 'juan@estudiante.edu',
      role: 'student',
      preferences: { highContrast: false, fontSize: 'normal', voiceSpeed: 1.0 },
      consents: { dataCollection: true, voiceRecording: false }
    },
    {
      id: 'a1',
      name: 'Admin Sistema',
      email: 'admin@edu.pe',
      role: 'admin',
      preferences: { highContrast: false, fontSize: 'normal', voiceSpeed: 1.0 },
      consents: { dataCollection: true, voiceRecording: true }
    }
  ] as User[],
  appointments: [
    { id: '1', title: 'Tutoría de Matemáticas', date: '2025-05-10 10:00', status: 'confirmed', type: 'academic' },
    { id: '2', title: 'Revisión Médica', date: '2025-05-12 14:00', status: 'pending', type: 'medical' }
  ] as Appointment[],
  courses: [
    { 
      id: 'c1', name: 'Ingeniería de Sistemas', code: 'IS-101', professor: 'Dr. García',
      materials: [
        { id: 'm1', title: 'Introducción a la IA.pdf', type: 'pdf', content: 'La Inteligencia Artificial es el campo de la ciencia que trata de realizar tareas que normalmente requieren inteligencia humana. Abarca desde el aprendizaje automático hasta el procesamiento del lenguaje natural.' },
        { id: 'm2', title: 'Clase Grabada - Semana 1', type: 'audio', content: 'Audio de la clase sobre fundamentos de algoritmos.' }
      ] 
    },
    { 
      id: 'c2', name: 'Accesibilidad Digital', code: 'AD-202', professor: 'Mg. Torres',
      materials: [
        { id: 'm3', title: 'Guía WCAG 2.1', type: 'text', content: 'Las Pautas de Accesibilidad para el Contenido Web (WCAG) 2.1 cubren una amplia gama de recomendaciones para hacer que el contenido web sea más accesible. Estas pautas abordan la accesibilidad del contenido web en computadoras de escritorio, computadoras portátiles, tabletas y dispositivos móviles.' },
        { id: 'm4', title: 'Lectura: Diseño Universal', type: 'pdf', content: 'El diseño universal implica crear productos y entornos que sean utilizables por todas las personas en la mayor medida posible, sin necesidad de adaptación o diseño especializado.' }
      ] 
    }
  ] as Course[],
  notifications: [
    { id: 'n1', title: 'Cambio de Aula', message: 'La clase de Sistemas se moverá al Aula 302.', date: '2025-05-08', read: false, type: 'warning' },
    { id: 'n2', title: 'Notas Publicadas', message: 'Ya están disponibles las notas del parcial.', date: '2025-05-07', read: true, type: 'success' }
  ] as Notification[],
  tickets: [
    { id: 't1', subject: 'Error en lectura de PDF - Curso Matemáticas', user: 'Juan Pérez', date: 'Hace 2 horas', status: 'open' },
    { id: 't2', subject: 'Problema con subtítulos en móvil', user: 'Ana Gómez', date: 'Hace 5 horas', status: 'open' },
    { id: 't3', subject: 'Solicitud de material accesible', user: 'Carlos Ruiz', date: 'Ayer', status: 'resolved' }
  ] as Ticket[],
  metrics: [
    { label: 'Usuarios Activos', value: 1250, change: 12 },
    { label: 'Documentos Procesados (OCR)', value: 8500, change: 5 },
    { label: 'Satisfacción (NPS)', value: 92, change: 2 }
  ] as Metric[]
};

// Simulated Database State with LocalStorage Persistence
class AppStore {
  private users: User[];
  private appointments: Appointment[];
  private courses: Course[];
  private notifications: Notification[];
  private tickets: Ticket[];
  private metrics: Metric[];

  constructor() {
    const loadedData = this.loadFromStorage();
    this.users = loadedData.users || DEFAULT_DATA.users;
    this.appointments = loadedData.appointments || DEFAULT_DATA.appointments;
    this.courses = loadedData.courses || DEFAULT_DATA.courses;
    this.notifications = loadedData.notifications || DEFAULT_DATA.notifications;
    this.tickets = loadedData.tickets || DEFAULT_DATA.tickets;
    this.metrics = loadedData.metrics || DEFAULT_DATA.metrics;
  }

  // --- Persistence Logic ---
  private saveToStorage() {
    const data = {
      users: this.users,
      appointments: this.appointments,
      courses: this.courses,
      notifications: this.notifications,
      tickets: this.tickets,
      metrics: this.metrics
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Error saving to LocalStorage", e);
    }
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Error loading from LocalStorage", e);
    }
    return DEFAULT_DATA;
  }

  // --- Methods to interact with data (Model Logic) ---
  
  getUserByEmail(email: string): User | undefined {
    return this.users.find(u => u.email === email);
  }

  getAppointments(userId: string): Appointment[] {
    return this.appointments;
  }

  getCourses(userId: string): Course[] {
    return this.courses;
  }

  getNotifications(userId: string): Notification[] {
    return this.notifications;
  }

  markNotificationAsRead(id: string) {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      this.notifications[index].read = true;
      this.saveToStorage();
    }
  }

  getMetrics(): Metric[] {
    return this.metrics;
  }

  getTickets(): Ticket[] {
    return this.tickets.filter(t => t.status === 'open');
  }

  resolveTicket(id: string) {
    const index = this.tickets.findIndex(t => t.id === id);
    if (index !== -1) {
        this.tickets[index].status = 'resolved';
        this.saveToStorage();
        return true;
    }
    return false;
  }

  updateUserProfile(userId: string, data: Partial<Pick<User, 'name' | 'email'>>): User | undefined {
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      this.users[userIndex] = { ...this.users[userIndex], ...data };
      this.saveToStorage();
      return this.users[userIndex];
    }
    return undefined;
  }

  updateUserPreferences(userId: string, prefs: Partial<User['preferences']>): User | undefined {
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      this.users[userIndex].preferences = { ...this.users[userIndex].preferences, ...prefs };
      this.saveToStorage();
      return this.users[userIndex];
    }
    return undefined;
  }

  updateUserConsents(userId: string, consents: Partial<User['consents']>): User | undefined {
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      this.users[userIndex].consents = { ...this.users[userIndex].consents, ...consents };
      this.saveToStorage();
      return this.users[userIndex];
    }
    return undefined;
  }

  addAppointment(appointment: Appointment) {
    this.appointments.push(appointment);
    this.saveToStorage();
  }

  updateAppointmentStatus(id: string, status: Appointment['status']) {
    const index = this.appointments.findIndex(a => a.id === id);
    if (index !== -1) {
      this.appointments[index].status = status;
      this.saveToStorage();
      return this.appointments[index];
    }
    return null;
  }
}

export const db = new AppStore();