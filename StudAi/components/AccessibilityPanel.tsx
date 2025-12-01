import React, { useState, useEffect } from 'react';
import { SpeakerWaveIcon, PauseCircleIcon, MicrophoneIcon } from '@heroicons/react/24/solid';
import { AppController } from '../controllers/appController';

interface AccessibilityPanelProps {
  contentRef: React.RefObject<HTMLElement>;
  voiceSpeed?: number;
  onCommand?: (action: string, data?: any) => void;
}

const AccessibilityPanel: React.FC<AccessibilityPanelProps> = ({ contentRef, voiceSpeed = 1.0, onCommand }) => {
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);

  useEffect(() => {
    const load = () => { window.speechSynthesis.getVoices(); };
    load();
    window.speechSynthesis.onvoiceschanged = load;
  }, []);

  const handleReadScreen = () => {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const text = contentRef.current?.innerText || document.body.innerText;
    if (text) {
        AppController.speak(text, voiceSpeed);
        setSpeaking(true);
        // Reset state after approx time or manually
        setTimeout(() => setSpeaking(false), 5000); 
    }
  };

  const toggleListening = () => {
    if (listening) {
        setListening(false);
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("Tu navegador no soporta comandos de voz.");
        return;
    }

    const recog = new SpeechRecognition();
    recog.lang = 'es-ES';
    recog.interimResults = false;
    recog.maxAlternatives = 1;

    setListening(true);
    recog.start();

    recog.onresult = (event: any) => {
        const command = event.results[0][0].transcript;
        console.log("Comando recibido:", command);
        const result = AppController.processVoiceCommand(command);
        
        if (result.speech) AppController.speak(result.speech, voiceSpeed);
        
        if (result.action === 'read_screen') {
            handleReadScreen();
        } else if (onCommand && result.action !== 'none') {
            onCommand(result.action, result.data);
        }
        setListening(false);
    };

    recog.onerror = () => {
        setListening(false);
        AppController.speak("No te entendí", voiceSpeed);
    };
    
    recog.onend = () => setListening(false);
  };

  return (
    <div className="fixed bottom-40 right-4 flex flex-col gap-4 z-40 sm:bottom-8 sm:right-8 pointer-events-auto">
        <button 
            onClick={toggleListening}
            className={`p-4 rounded-full shadow-xl transition-all border-2 ${listening ? 'bg-red-500 text-white border-red-300 animate-pulse scale-110' : 'bg-slate-800 text-white border-slate-600 hover:bg-slate-700'}`}
            aria-label="Comandos de Voz"
        >
            <MicrophoneIcon className="w-7 h-7" />
        </button>
        <button 
            onClick={handleReadScreen}
            className={`p-4 rounded-full shadow-xl transition-all border border-indigo-200 ${speaking ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-indigo-600 hover:bg-indigo-50'}`}
            aria-label={speaking ? "Detener lectura" : "Leer pantalla"}
        >
            {speaking ? <PauseCircleIcon className="w-7 h-7" /> : <SpeakerWaveIcon className="w-7 h-7" />}
        </button>
    </div>
  );
};

export default AccessibilityPanel;