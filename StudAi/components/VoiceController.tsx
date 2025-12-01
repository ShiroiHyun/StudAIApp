import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { processVoiceCommand } from '../services/aiService';

// MVC: Controller - Este componente actúa como el "Controlador de Voz"
// Conecta la Vista (Input Micrófono) con el Modelo (AI Service) y actualiza la Vista (Navegación/Estado)

export const VoiceController = () => {
    const { speak, updatePreferences, preferences, isListening, setIsListening } = useApp();
    const navigate = useNavigate();
    const location = useLocation();
    
    // Referencia al reconocimiento de voz del navegador
    const [recognition, setRecognition] = useState<any>(null);

    useEffect(() => {
        // Inicializar Web Speech API
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            const rec = new SpeechRecognition();
            rec.continuous = false;
            rec.lang = 'es-PE'; // Español Perú
            rec.interimResults = false;

            rec.onstart = () => {
                console.log("Micrófono activado");
            };

            rec.onend = () => {
                console.log("Micrófono desactivado");
                setIsListening(false);
            };

            rec.onresult = async (event: any) => {
                const transcript = event.results[0][0].transcript;
                console.log("Escuchado:", transcript);
                handleVoiceCommand(transcript);
            };

            rec.onerror = (event: any) => {
                console.error("Error de voz", event.error);
                setIsListening(false);
                speak("No pude escucharte bien.");
            };

            setRecognition(rec);
        } else {
            console.warn("Navegador no soporta Speech Recognition");
        }
    }, []);

    // Efecto para activar/desactivar micrófono basado en estado global
    useEffect(() => {
        if (recognition) {
            if (isListening) {
                try { recognition.start(); } catch (e) { /* Ya iniciado */ }
            } else {
                try { recognition.stop(); } catch (e) { /* Ya detenido */ }
            }
        }
    }, [isListening, recognition]);

    // Lógica Central del Controlador
    const handleVoiceCommand = async (text: string) => {
        speak("Procesando...");
        
        // 1. Llamar al Modelo (AI Service)
        const command = await processVoiceCommand(text);

        // 2. Ejecutar la Acción devuelta por el Modelo
        if (command.feedbackText) {
            speak(command.feedbackText);
        }

        switch (command.action) {
            case 'NAVIGATE':
                if (command.target) {
                    navigate(command.target);
                }
                break;

            case 'TOGGLE_SETTING':
                if (command.target === 'highContrast') {
                    updatePreferences({ highContrast: !preferences.highContrast });
                } else if (command.target === 'fontSize') {
                    updatePreferences({ fontSize: 'extra-large' });
                }
                break;
                
            case 'READ_SCREEN':
                // Lógica para releer la pantalla actual
                break;
        }
    };

    return null; // Este componente no renderiza nada visualmente, es lógico.
};