import { db } from '../models/store';
import { User, Appointment, Course } from '../types';

export class AppController {
  
  // Authentication
  static async login(email: string, password: string): Promise<User | null> {
    // In a real app, use firebase/auth here. 
    // For this demo structure, we query the user collection directly.
    return await db.getUser(email);
  }

  static async register(name: string, email: string, password: string): Promise<User | null> {
    // Check if user exists
    const existing = await db.getUser(email);
    if (existing) return null; // User already exists

    // Create default student profile
    const newUser: Omit<User, 'id'> = {
      name,
      email,
      role: 'student',
      preferences: {
        highContrast: false,
        fontSize: 'normal',
        voiceSpeed: 1.0
      },
      consents: {
        dataCollection: false,
        voiceRecording: false
      }
    };

    return await db.createUser(newUser);
  }

  // --- Voice Navigation Logic (RF-F4 + Navigation) ---
  // Returns an object instructing the UI what to do
  static processVoiceCommand(transcript: string): { action: string; data?: any; speech?: string } {
    const text = transcript.toLowerCase();

    // Navigation
    if (text.includes('inicio') || text.includes('dashboard')) return { action: 'navigate', data: 'dashboard', speech: 'Yendo al inicio' };
    if (text.includes('cursos') || text.includes('materias')) return { action: 'navigate', data: 'courses', speech: 'Abriendo mis cursos' };
    if (text.includes('agenda') || text.includes('calendario') || text.includes('citas')) return { action: 'navigate', data: 'schedule', speech: 'Abriendo agenda' };
    if (text.includes('ajustes') || text.includes('configuración')) return { action: 'navigate', data: 'settings', speech: 'Abriendo configuración' };
    if (text.includes('leer') || text.includes('ocr')) return { action: 'navigate', data: 'ocr', speech: 'Abriendo lector de texto' };
    if (text.includes('subtítulos')) return { action: 'navigate', data: 'stt', speech: 'Iniciando subtítulos' };

    // Actions
    if (text.includes('agregar curso') || text.includes('nuevo curso')) {
        // Simple parsing: "Agregar curso Historia"
        const name = text.replace('agregar curso', '').replace('nuevo curso', '').trim();
        if (name.length > 2) {
            return { action: 'create_course', data: name, speech: `Agregando curso ${name}` };
        }
        return { action: 'none', speech: '¿Qué curso deseas agregar?' };
    }

    if (text.includes('leer pantalla')) {
        return { action: 'read_screen' };
    }

    return { action: 'none', speech: 'No entendí el comando' };
  }

  // --- Data Methods (Async) ---

  static async getCourses(userId: string) {
    return await db.getCourses(userId);
  }

  static async addCourse(userId: string, name: string) {
    const newCourse: Omit<Course, 'id'> = {
        userId,
        name: name.charAt(0).toUpperCase() + name.slice(1),
        code: 'AUTO-' + Math.floor(Math.random()*1000),
        professor: 'Por asignar',
        materials: []
    };
    return await db.addCourse(newCourse);
  }

  static async getAppointments(userId: string) {
    return await db.getAppointments(userId);
  }

  static async addAppointment(userId: string, apt: any) {
    return await db.addAppointment({ ...apt, userId });
  }

  static async updateAppointmentStatus(id: string, status: any) {
    await db.updateAppointmentStatus(id, status);
    return true; 
  }

  static async getNotifications(userId: string) {
    return await db.getNotifications(userId);
  }

  static async markNotificationRead(id: string) {
    await db.markNotificationRead(id);
  }

  static async getAdminData() {
    const m = await db.getMetrics();
    const t = await db.getTickets();
    return { metrics: m, tickets: t };
  }
  
  // Fix for AdminPanel usage
  static async getAdminDashboardData() {
    return await this.getAdminData();
  }

  // Fix for AdminPanel usage
  static generateCSVReport() {
    const rows = [["Tipo", "Fecha", "Detalle"]];
    rows.push(["Reporte", new Date().toLocaleDateString(), "Generado por StudAI"]);
    
    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "reporte_inclusion.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  static async resolveTicket(id: string) {
    await db.resolveTicket(id);
    return true;
  }

  // --- User Settings Methods ---

  static async toggleHighContrast(userId: string, currentVal: boolean): Promise<User | null> {
    const user = await db.getUserById(userId);
    if (!user) return null;
    
    const newPrefs = { ...user.preferences, highContrast: !currentVal };
    await db.updateUser(userId, { preferences: newPrefs });
    return { ...user, preferences: newPrefs };
  }

  static async updatePreferences(userId: string, prefs: Partial<User['preferences']>): Promise<User | null> {
    const user = await db.getUserById(userId);
    if (!user) return null;
    
    const newPrefs = { ...user.preferences, ...prefs };
    await db.updateUser(userId, { preferences: newPrefs });
    return { ...user, preferences: newPrefs };
  }

  static async updateConsents(userId: string, consents: Partial<User['consents']>): Promise<User | null> {
    const user = await db.getUserById(userId);
    if (!user) return null;

    const newConsents = { ...user.consents, ...consents };
    await db.updateUser(userId, { consents: newConsents });
    return { ...user, consents: newConsents };
  }

  static async updateProfile(userId: string, data: Partial<User>): Promise<User | null> {
    await db.updateUser(userId, data);
    return await db.getUserById(userId);
  }

  // --- Helpers ---
  static speak(text: string, speed: number = 1.0) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = speed;
    const voices = window.speechSynthesis.getVoices();
    const esVoice = voices.find(v => v.lang.startsWith('es'));
    if (esVoice) utterance.voice = esVoice;
    window.speechSynthesis.speak(utterance);
  }
}