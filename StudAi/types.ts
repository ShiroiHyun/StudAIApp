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
export type AIActionType = 'NAVIGATE' | 'READ_SCREEN' | 'TOGGLE_SETTING' | 'UNKNOWN';

export interface AICommandResponse {
    action: AIActionType;
    target?: string; // Ej: '/courses', 'highContrast'
    value?: any;     // Ej: true, 'large'
    feedbackText: string; // Lo que la app responderá por voz (Ej: "Abriendo horarios")
}