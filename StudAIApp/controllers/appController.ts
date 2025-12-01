import { db } from '../models/store';
import { User, Appointment } from '../types';

export class AppController {
  // Authentication Logic (RF-F1)
  static async login(email: string, password: string): Promise<User | null> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const user = db.getUserByEmail(email);
    if (user) return user;
    return null;
  }

  // Data Retrieval Logic
  static getStudentDashboardData(userId: string) {
    return {
      appointments: db.getAppointments(userId),
      courses: db.getCourses(userId),
      notifications: db.getNotifications(userId)
    };
  }

  static getAdminDashboardData() {
    return {
      metrics: db.getMetrics(),
      tickets: db.getTickets()
    };
  }

  static getCourses(userId: string) {
    return db.getCourses(userId);
  }

  static getNotifications(userId: string) {
    return db.getNotifications(userId);
  }

  static markNotificationRead(id: string) {
    db.markNotificationAsRead(id);
  }

  // Preference Logic (RF-F2)
  static toggleHighContrast(userId: string, currentVal: boolean) {
    if (!currentVal) {
      document.documentElement.classList.add('grayscale', 'contrast-125');
    } else {
      document.documentElement.classList.remove('grayscale', 'contrast-125');
    }
    return db.updateUserPreferences(userId, { 
      highContrast: !currentVal
    });
  }

  static updatePreferences(userId: string, prefs: Partial<User['preferences']>) {
    return db.updateUserPreferences(userId, prefs);
  }

  static updateProfile(userId: string, data: Partial<Pick<User, 'name' | 'email'>>) {
    return db.updateUserProfile(userId, data);
  }

  // Appointment Logic (RF-F6)
  static addAppointment(userId: string, appointmentData: Omit<Appointment, 'id' | 'status'>) {
    const newAppointment: Appointment = {
      id: Date.now().toString(),
      status: 'pending',
      ...appointmentData
    };
    db.addAppointment(newAppointment);
    return newAppointment;
  }

  static updateAppointmentStatus(id: string, status: Appointment['status']) {
    return db.updateAppointmentStatus(id, status);
  }

  static getAppointments(userId: string) {
    return db.getAppointments(userId);
  }

  // Privacy Logic (RF-F19)
  static updateConsents(userId: string, consents: Partial<User['consents']>) {
    return db.updateUserConsents(userId, consents);
  }

  // Admin Features (RF-F15, RF-F20)
  static resolveTicket(id: string) {
    return db.resolveTicket(id);
  }

  static generateCSVReport() {
    const metrics = db.getMetrics();
    const headers = "Metrica,Valor,Cambio\n";
    const rows = metrics.map(m => `${m.label},${m.value},${m.change}%`).join("\n");
    const csvContent = "data:text/csv;charset=utf-8," + encodeURI(headers + rows);
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", "reporte_impacto_studai.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Robust Mobile TTS Helper
  static speak(text: string, speed: number = 1.0) {
    window.speechSynthesis.cancel(); // Interrupt previous
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES'; // Force Spanish
    utterance.rate = speed;

    // Mobile Fix: explicitly search for an installed Spanish voice
    const voices = window.speechSynthesis.getVoices();
    const esVoice = voices.find(v => v.lang.startsWith('es'));
    if (esVoice) utterance.voice = esVoice;

    window.speechSynthesis.speak(utterance);
  }
}