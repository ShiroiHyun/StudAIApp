import React, { useState } from 'react';
import { DocumentTextIcon, SpeakerWaveIcon, PauseIcon, ClipboardIcon, ArrowUpTrayIcon, ShareIcon } from '@heroicons/react/24/outline';

const OcrTool: React.FC = () => {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const processImage = async (file: File) => {
    setIsLoading(true);
    try {
      const Tesseract = window.Tesseract;
      const result = await Tesseract.recognize(file, 'spa');
      setText(result.data.text);
    } catch (error) {
      setText("Error al procesar imagen.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeak = () => {
    if (isSpeaking) { window.speechSynthesis.cancel(); setIsSpeaking(false); return; }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'es-ES';
    u.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(u);
    setIsSpeaking(true);
  };

  const handleShare = async () => {
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Texto OCR - Inclusive StudAI',
                text: text,
            });
        } catch (err) { console.log('Error sharing', err); }
    } else {
        alert("Compartir no soportado en este navegador.");
    }
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
        <label className="block w-full cursor-pointer p-8 border-2 border-dashed rounded-xl hover:bg-slate-50">
            <input type="file" accept="image/*" onChange={(e) => e.target.files && processImage(e.target.files[0])} className="hidden" />
            <ArrowUpTrayIcon className="w-10 h-10 mx-auto text-indigo-500 mb-2" />
            <span className="font-bold text-slate-700">Tomar Foto / Subir</span>
        </label>
      </div>

      <div className="flex-1 bg-white p-4 rounded-2xl border border-slate-200 flex flex-col relative">
        {isLoading ? (
            <div className="flex-1 flex items-center justify-center text-slate-400 animate-pulse">Procesando...</div>
        ) : (
            <textarea className="flex-1 w-full resize-none outline-none text-lg p-2" value={text} onChange={(e) => setText(e.target.value)} placeholder="El texto aparecerá aquí..." />
        )}
        
        <div className="flex justify-end gap-2 mt-2 pt-2 border-t">
            <button onClick={handleShare} disabled={!text} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"><ShareIcon className="w-6 h-6" /></button>
            <button onClick={() => navigator.clipboard.writeText(text)} disabled={!text} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"><ClipboardIcon className="w-6 h-6" /></button>
            <button onClick={handleSpeak} disabled={!text} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold flex gap-2">
                {isSpeaking ? <PauseIcon className="w-5 h-5"/> : <SpeakerWaveIcon className="w-5 h-5"/>} {isSpeaking ? 'Parar' : 'Leer'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default OcrTool;