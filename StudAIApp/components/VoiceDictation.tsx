import React, { useState, useEffect, useRef } from 'react';
import { MicrophoneIcon, StopIcon, TrashIcon } from '@heroicons/react/24/solid';

const VoiceDictation: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState<any>(null);
  const [notSupported, setNotSupported] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.continuous = true;
      recog.interimResults = true;
      recog.lang = 'es-PE';

      recog.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
             setTranscript(prev => prev + ' ' + finalTranscript);
        }
        // Could handle interim results for smoother live view if needed
      };

      recog.onend = () => {
         if (isListening) {
             try {
                recog.start();
             } catch (e) {
                setIsListening(false);
             }
         }
      };
      
      recog.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        if (event.error === 'not-allowed') {
            setIsListening(false);
        }
      };

      setRecognition(recog);
    } else {
      setNotSupported(true);
    }
  }, [isListening]);

  // Auto-scroll
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  const toggleListening = () => {
    if (notSupported) return;
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  const clearTranscript = () => setTranscript('');

  if (notSupported) return (
    <div className="p-4 bg-red-50 text-red-800 rounded-lg">
        Tu navegador no soporta reconocimiento de voz nativo.
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[600px]">
      {/* Control Bar */}
      <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-4">
            <button
            onClick={toggleListening}
            className={`flex items-center gap-2 px-8 py-3 rounded-full font-bold text-lg transition-all shadow-md ${
                isListening 
                ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse' 
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
            >
            {isListening ? (
                <>
                <StopIcon className="w-6 h-6" />
                DETENER
                </>
            ) : (
                <>
                <MicrophoneIcon className="w-6 h-6" />
                INICIAR SUBTÍTULOS
                </>
            )}
            </button>
            {isListening && (
                <span className="flex items-center gap-2 text-red-600 font-medium animate-pulse">
                    <span className="w-3 h-3 bg-red-600 rounded-full"></span>
                    Escuchando...
                </span>
            )}
        </div>
        <button 
            onClick={clearTranscript}
            className="text-slate-400 hover:text-red-500 transition-colors p-2"
            title="Borrar todo"
        >
            <TrashIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Display Area - Optimized for readability */}
      <div className="flex-1 bg-slate-900 p-8 overflow-y-auto relative">
        {transcript ? (
             <p className="text-yellow-400 text-3xl md:text-4xl leading-relaxed font-semibold font-mono tracking-wide">
                {transcript}
             </p>
        ) : (
            <div className="h-full flex items-center justify-center opacity-30">
                <p className="text-white text-2xl text-center">
                    Presiona "Iniciar Subtítulos" y el texto aparecerá aquí en tiempo real.
                </p>
            </div>
        )}
        <div ref={endRef} />
      </div>
      
      <div className="bg-slate-800 px-6 py-2 text-slate-400 text-xs flex justify-between">
         <span>Modo: Accesibilidad Auditiva (Alto Contraste)</span>
         <span>Idioma: Español (Perú)</span>
      </div>
    </div>
  );
};

export default VoiceDictation;