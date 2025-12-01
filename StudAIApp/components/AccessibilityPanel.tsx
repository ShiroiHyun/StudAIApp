import React, { useState, useEffect } from 'react';
import { SpeakerWaveIcon, PauseCircleIcon, EyeIcon } from '@heroicons/react/24/outline';
import { AppController } from '../controllers/appController';

interface AccessibilityPanelProps {
  contentRef: React.RefObject<HTMLElement>;
  voiceSpeed?: number;
}

const AccessibilityPanel: React.FC<AccessibilityPanelProps> = ({ contentRef, voiceSpeed = 1.0 }) => {
  const [speaking, setSpeaking] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  // Force voice loading for Mobile (Android/iOS specific quirk)
  useEffect(() => {
    const load = () => { window.speechSynthesis.getVoices(); };
    load();
    window.speechSynthesis.onvoiceschanged = load;
  }, []);

  const toggleHighContrast = () => {
    const newVal = !highContrast;
    setHighContrast(newVal);
    // Simple local toggle fallback, but App.tsx handles global preference if logged in
    if (newVal) {
        document.documentElement.classList.add('grayscale', 'contrast-125');
    } else {
        document.documentElement.classList.remove('grayscale', 'contrast-125');
    }
  };

  const handleReadScreen = () => {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    const text = contentRef.current?.innerText || document.body.innerText;
    if (text) {
        // Use Controller's robust speak method
        AppController.speak(text, voiceSpeed);
        setSpeaking(true);
        
        // Simple timeout to reset icon (accurate tracking requires SpeechSynthesisEvent listeners which are flaky on mobile)
        // A better approach in production is using the onend event within the controller if passed back.
    }
  };

  return (
    <div className="fixed bottom-40 right-4 flex flex-col gap-3 z-40 sm:bottom-8 sm:right-8 pointer-events-auto">
        <button 
            onClick={toggleHighContrast}
            className={`p-4 rounded-full shadow-xl transition-all border border-slate-200 ${highContrast ? 'bg-yellow-400 text-black scale-110 ring-4 ring-yellow-200' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
            aria-label="Alto Contraste"
        >
            <EyeIcon className="w-6 h-6" />
        </button>
        <button 
            onClick={handleReadScreen}
            className={`p-4 rounded-full shadow-xl transition-all border border-indigo-200 ${speaking ? 'bg-red-500 text-white animate-pulse' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
            aria-label={speaking ? "Detener lectura" : "Leer pantalla"}
        >
            {speaking ? <PauseCircleIcon className="w-6 h-6" /> : <SpeakerWaveIcon className="w-6 h-6" />}
        </button>
    </div>
  );
};

export default AccessibilityPanel;