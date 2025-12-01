
import React from 'react';

// --- MVC: Models Interfaces ---

export type UserRole = 'student' | 'admin' | 'guest';

export interface User {
  id: string; // Firebase Auth UID
  name: string;
  email: string;
  role: UserRole;
  preferences: {
    highContrast: boolean;
    fontSize: 'normal' | 'large' | 'xl';
    voiceSpeed: number;
  };
  consents: {
    dataCollection: boolean;
    voiceRecording: boolean;
  };
}

export interface Appointment {
  id: string;
  userId: string; // FK to User
  title: string;
  date: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  type: 'academic' | 'medical' | 'administrative';
}

export interface Material {
  id: string;
  title: string;
  type: 'pdf' | 'audio' | 'text';
  content?: string; 
}

export interface Course {
  id: string;
  userId: string; // FK to User
  name: string;
  code: string;
  professor: string;
  materials: Material[];
}

export interface Notification {
  id: string;
  userId: string; // FK
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'info' | 'warning' | 'success';
}

export interface Metric {
  id?: string;
  label: string;
  value: string | number;
  change: number; 
}

export interface Ticket {
  id: string;
  subject: string;
  user: string;
  date: string;
  status: 'open' | 'resolved';
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

declare global {
  interface Window {
    Tesseract: any;
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
    mobilenet: any;
    tf: any;
  }
}
