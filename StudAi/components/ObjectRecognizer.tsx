
import React, { useRef, useState, useEffect } from 'react';
import { CameraIcon, ArrowPathIcon, SpeakerWaveIcon } from '@heroicons/react/24/outline';
import { AppController } from '../controllers/appController';

const ObjectRecognizer: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [model, setModel] = useState<any>(null);
  const [prediction, setPrediction] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadModel = async () => {
      try {
        setLoading(true);
        
        // Wait for global libraries to load if not yet available
        if (!window.mobilenet || !window.tf) {
            // Simple retry mechanism
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Por defecto usamos MobileNet (pre-entrenado) para que la demo funcione
        if (window.mobilenet) {
            const loadedModel = await window.mobilenet.load();
            setModel(loadedModel);
        } else {
            setError("Librería IA no disponible. Verifique su conexión.");
        }
      } catch (err) {
        console.error(err);
        setError("Error cargando el modelo IA.");
      } finally {
        setLoading(false);
      }
    };

    loadModel();
    startCamera();

    return () => {
        // Cleanup camera
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    };
  }, []);

  const startCamera = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' } 
        });
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    } catch (err) {
        setError("No se pudo acceder a la cámara.");
    }
  };

  const identifyObject = async () => {
    if (!model || !videoRef.current) return;

    try {
        // Clasificar imagen del video
        const predictions = await model.classify(videoRef.current);

        if (predictions && predictions.length > 0) {
            const result = predictions[0].className;
            const probability = Math.round(predictions[0].probability * 100);
            
            // Basic translation simulation for demo (since mobilenet is English)
            const text = `Veo: ${result} (${probability}%)`;
            setPrediction(text);
            AppController.speak(text);
        } else {
            setPrediction("No reconozco el objeto.");
        }
    } catch (e) {
        console.error(e);
        setPrediction("Error al identificar.");
    }
  };

  return (
    <div className="flex flex-col h-full bg-black rounded-2xl overflow-hidden relative">
        <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="flex-1 object-cover w-full h-full opacity-80"
        />
        
        {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                <div className="text-white font-bold animate-pulse">Cargando IA...</div>
            </div>
        )}

        {error && (
            <div className="absolute top-4 left-4 right-4 bg-red-500 text-white p-3 rounded-lg text-sm">
                {error}
            </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 bg-white p-6 rounded-t-3xl flex flex-col items-center gap-4 animate-slideUp">
            {prediction && (
                <div className="text-center mb-2">
                    <p className="text-xl font-bold text-slate-800 capitalize">{prediction}</p>
                    <button onClick={() => AppController.speak(prediction)} className="text-indigo-600 text-sm font-bold flex items-center justify-center gap-1 mt-1">
                        <SpeakerWaveIcon className="w-4 h-4" /> Repetir
                    </button>
                </div>
            )}

            <button 
                onClick={identifyObject}
                disabled={loading || !!error}
                className="w-20 h-20 rounded-full bg-indigo-600 border-4 border-indigo-200 flex items-center justify-center shadow-xl active:scale-95 transition-transform"
                aria-label="Identificar objeto"
            >
                {loading ? <ArrowPathIcon className="w-8 h-8 text-white animate-spin" /> : <CameraIcon className="w-10 h-10 text-white" />}
            </button>
            <p className="text-slate-400 text-xs">Apunta y presiona para identificar</p>
        </div>
    </div>
  );
};

export default ObjectRecognizer;
