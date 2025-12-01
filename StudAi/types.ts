// Definición de Modelos de Datos

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  career?: string;
  cycle?: string;
  photoUrl?: string;
}

export interface AccessibilityPreferences {
  highContrast: boolean;
  fontSize: 'normal' | 'large' | 'extra-large';
  ttsSpeed: number; // 0.5 to 2.0
  screenReaderEnabled: boolean;
}

export interface Course {
  id: string;
  name: string;
  schedule: string;
  professor: string;
}

export interface DocumentData {
  id: string;
  title: string;
  originalText: string;
  accessibleSummary: string; // Generado por tu Modelo IA
  date: string;
}

export interface CampusLocation {
    id: string;
    name: string;
    description: string;
    category: 'aulas' | 'servicios' | 'administrativo';
    stepsFromEntrance: string[]; // Pasos guiados
}

// Estados globales para los Controladores
export interface AppState {
  user: User | null;
  preferences: AccessibilityPreferences;
  isLoading: boolean;
}

// --- NUEVO: Estructura de respuesta de tu Modelo IA ---
// NAVIGATE: Ir a una página
// READ_SCREEN: Leer contenido
// TOGGLE_SETTING: Cambiar ajustes
// FILL_FORM: Rellenar inputs (Login)
export type AIActionType = 'NAVIGATE' | 'READ_SCREEN' | 'TOGGLE_SETTING' | 'FILL_FORM' | 'UNKNOWN';

export interface AICommandResponse {
    action: AIActionType;
    target?: string; // Ej: '/courses', 'email', 'password'
    value?: any;     // Ej: 'juan@gmail.com'
    feedbackText: string; // Lo que la app responderá por voz
}