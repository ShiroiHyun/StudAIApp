import React, { useState } from 'react';
import { 
  DocumentTextIcon, 
  PhotoIcon, 
  SpeakerWaveIcon, 
  PauseIcon,
  ClipboardIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline';

const OcrTool: React.FC = () => {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImagePreview(URL.createObjectURL(file));
      setText('');
      setProgress(0);
      processImage(file);
    }
  };

  const processImage = async (file: File) => {
    setIsLoading(true);
    try {
      const Tesseract = window.Tesseract;
      if (!Tesseract) {
        setText("Error: Componente OCR no inicializado.");
        setIsLoading(false);
        return;
      }

      const result = await Tesseract.recognize(
        file,
        'spa', 
        {
          logger: (m: any) => {
            if (m.status === 'recognizing text') {
              setProgress(Math.round(m.progress * 100));
            }
          }
        }
      );

      setText(result.data.text);
    } catch (error) {
      console.error(error);
      setText("No se pudo extraer texto de la imagen.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    alert("Texto copiado al portapapeles");
  };

  return (
    <div className="grid md:grid-cols-2 gap-6 h-full">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
        <h3 className="font-semibold text-slate-800 mb-4">1. Subir Documento</h3>
        
        <div className="flex-1 flex flex-col justify-center">
            <label className="block w-full cursor-pointer bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-100 transition-colors h-64 flex flex-col items-center justify-center">
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            <ArrowUpTrayIcon className="w-12 h-12 text-indigo-500 mb-3" />
            <span className="text-slate-700 font-medium text-lg">Subir imagen o foto</span>
            <span className="block text-slate-400 text-sm mt-1">Formatos: JPG, PNG, BMP</span>
            </label>
        </div>

        {imagePreview && (
            <div className="mt-4 p-2 bg-slate-100 rounded-lg border border-slate-200">
                <img src={imagePreview} alt="Preview" className="h-40 w-full object-contain mx-auto" />
            </div>
        )}
      </div>

      {/* Output Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-slate-800">2. Texto Adaptado</h3>
            <div className="flex gap-2">
                <button 
                    onClick={handleCopy}
                    disabled={!text}
                    className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
                    title="Copiar texto"
                >
                    <ClipboardIcon className="w-5 h-5" />
                </button>
                <button 
                    onClick={handleSpeak}
                    disabled={!text}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                        isSpeaking 
                        ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50'
                    }`}
                >
                    {isSpeaking ? (
                        <><PauseIcon className="w-4 h-4" /> Detener</>
                    ) : (
                        <><SpeakerWaveIcon className="w-4 h-4" /> Escuchar</>
                    )}
                </button>
            </div>
        </div>

        <div className="flex-1 bg-slate-50 rounded-xl border border-slate-200 p-4 relative overflow-hidden flex flex-col">
            {isLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                    <ArrowUpTrayIcon className="w-10 h-10 animate-bounce mb-4 text-indigo-400" />
                    <p className="font-medium">Procesando documento...</p>
                    <p className="text-sm mt-2">{progress}% completado</p>
                </div>
            ) : text ? (
                <textarea 
                    className="flex-1 w-full bg-transparent resize-none focus:outline-none text-slate-800 leading-relaxed p-2 text-lg"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    aria-label="Texto extraído"
                />
            ) : (
                <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
                    El texto extraído aparecerá aquí para lectura.
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default OcrTool;