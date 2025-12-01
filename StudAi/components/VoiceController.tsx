import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { processVoiceCommand } from '../services/aiService';

// MVC: Controller - Controlador de Voz

export const VoiceController = () => {
    const { speak, updatePreferences, preferences, isListening, setIsListening, setVoiceInput } = useApp();
    const navigate = useNavigate();
    const location = useLocation();
    
    const [recognition, setRecognition] = useState<any>(null);

    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            const rec = new SpeechRecognition();
            rec.continuous = false;
            rec.lang = 'es-PE';
            rec.interimResults = false;

            rec.onstart = () => console.log("Micrófono ON");
            rec.onend = () => {
                console.log("Micrófono OFF");
                setIsListening(false);
            };

            rec.onresult = async (event: any) => {
                const transcript = event.results[0][0].transcript;
                console.log("Comando:", transcript);
                handleVoiceCommand(transcript);
            };

            rec.onerror = (e: any) => {
                console.error("Error voz", e);
                setIsListening(false);
                speak("No entendí, intenta de nuevo.");
            };

            setRecognition(rec);
        }
    }, []);

    useEffect(() => {
        if (recognition) {
            if (isListening) recognition.start();
            else recognition.stop();
        }
    }, [isListening, recognition]);

    const handleVoiceCommand = async (text: string) => {
        // Feedback auditivo inmediato
        // speak("Procesando..."); // Opcional, a veces es mejor que sea rápido y silencioso hasta el resultado

        const command = await processVoiceCommand(text);

        if (command.feedbackText) {
            speak(command.feedbackText);
        }

        switch (command.action) {
            case 'NAVIGATE':
                if (command.target) navigate(command.target);
                break;

            case 'TOGGLE_SETTING':
                if (command.target === 'highContrast') updatePreferences({ highContrast: !preferences.highContrast });
                if (command.target === 'fontSize') updatePreferences({ fontSize: 'extra-large' });
                break;

            case 'FILL_FORM':
                // Enviar datos al contexto para que LoginView los consuma
                if (command.target && command.value) {
                    setVoiceInput({ field: command.target, value: command.value });
                }
                break;
        }
    };

    return null;
};