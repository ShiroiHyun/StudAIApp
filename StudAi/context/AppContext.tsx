import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, AccessibilityPreferences } from '../types';

// MVC: Controller - Gestión de Estado Global y Preferencias

interface AppContextProps {
    user: User | null;
    setUser: (user: User | null) => void;
    preferences: AccessibilityPreferences;
    updatePreferences: (prefs: Partial<AccessibilityPreferences>) => void;
    speak: (text: string) => void;
    stopSpeak: () => void;
    isListening: boolean;
    setIsListening: (listening: boolean) => void;
}

const defaultPreferences: AccessibilityPreferences = {
    highContrast: false,
    fontSize: 'normal',
    ttsSpeed: 1.0,
    screenReaderEnabled: true,
};

const AppContext = createContext<AppContextProps | undefined>(undefined);

interface AppProviderProps {
    children?: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [preferences, setPreferences] = useState<AccessibilityPreferences>(defaultPreferences);
    const [isListening, setIsListening] = useState(false); // Estado del micrófono

    const updatePreferences = (newPrefs: Partial<AccessibilityPreferences>) => {
        setPreferences(prev => ({ ...prev, ...newPrefs }));
    };

    // Simple TTS wrapper
    const speak = (text: string) => {
        if (!preferences.screenReaderEnabled) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = preferences.ttsSpeed;
        utterance.lang = 'es-PE'; // Acento peruano si está disponible
        window.speechSynthesis.speak(utterance);
    };

    const stopSpeak = () => {
        window.speechSynthesis.cancel();
    };

    // Aplicar estilos globales de alto contraste
    useEffect(() => {
        if (preferences.highContrast) {
            document.body.classList.add('bg-black');
            document.body.classList.remove('bg-gray-50');
        } else {
            document.body.classList.remove('bg-black');
            document.body.classList.add('bg-gray-50');
        }
    }, [preferences.highContrast]);

    return (
        <AppContext.Provider value={{ 
            user, setUser, 
            preferences, updatePreferences, 
            speak, stopSpeak,
            isListening, setIsListening 
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error("useApp must be used within AppProvider");
    return context;
};