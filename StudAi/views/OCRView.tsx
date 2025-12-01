import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/Button';
import { performOCR, generateAccessibleExplanation } from '../services/aiService';

export const OCRView = () => {
    const { speak, preferences } = useApp();
    const [image, setImage] = useState<File | null>(null);
    const [extractedText, setExtractedText] = useState('');
    const [aiSummary, setAiSummary] = useState('');
    const [status, setStatus] = useState<'idle' | 'processing_ocr' | 'ready_for_ai' | 'processing_ai' | 'done'>('idle');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImage(file);
            setStatus('processing_ocr');
            speak("Imagen capturada. Procesando texto con OCR...");
            
            try {
                // 1. Ejecutar OCR (Simulado)
                const text = await performOCR(file);
                setExtractedText(text);
                setStatus('ready_for_ai');
                speak("Texto detectado. Pulsa el botón 'Explicar' para usar el modelo inteligente.");
            } catch (error) {
                setStatus('idle');
                speak("Error al leer la imagen. Intenta de nuevo.");
            }
        }
    };

    const handleExplainWithAI = async () => {
        if (!extractedText) return;
        setStatus('processing_ai');
        speak("Procesando con Modelo de Inteligencia Artificial...");

        // 2. Llamar al servicio de IA (Usa tu modelo Custom o Gemini según config en aiService)
        const summary = await generateAccessibleExplanation(extractedText);
        setAiSummary(summary);
        setStatus('done');
        speak("Análisis completado. " + summary);
    };

    const containerClass = preferences.highContrast 
        ? "border-2 border-yellow-300 bg-black text-yellow-300" 
        : "bg-white shadow-md border border-gray-200";

    return (
        <div className="space-y-6 pb-20">
            <header>
                <h2 className="text-2xl font-bold">Lector Inteligente (IA)</h2>
                <p className="opacity-80">Digitaliza documentos físicos y obtén explicaciones accesibles.</p>
            </header>

            {/* Input de cámara/archivo */}
            <input 
                type="file" 
                accept="image/*" 
                capture="environment" // Fuerza cámara trasera en móviles
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
            />

            <Button 
                label={image ? "Tomar otra foto" : "Escanear Documento"} 
                icon="fa-camera" 
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-6 text-xl"
            />

            {/* Estado: Procesando OCR */}
            {status === 'processing_ocr' && (
                <div className="p-8 text-center animate-pulse border-2 border-dashed rounded-xl">
                    <i className="fas fa-cog fa-spin text-4xl mb-4 text-ucv-blue"></i>
                    <p className="font-bold">Analizando caracteres...</p>
                </div>
            )}

            {/* Resultado OCR */}
            {extractedText && status !== 'processing_ocr' && (
                <div className={`p-4 rounded-lg ${containerClass}`}>
                    <h3 className="font-bold mb-2 flex justify-between">
                        <span>Texto Original (OCR)</span>
                        <i className="fas fa-file-alt"></i>
                    </h3>
                    <div className="max-h-32 overflow-y-auto text-sm opacity-80 whitespace-pre-line border-t pt-2 border-gray-300">
                        {extractedText}
                    </div>
                </div>
            )}

            {/* Acción: Llamar a TU MODELO */}
            {(status === 'ready_for_ai' || status === 'done') && (
                <div className="space-y-4">
                    <Button 
                        label="Generar Explicación Accesible" 
                        variant="primary"
                        icon="fa-brain"
                        onClick={handleExplainWithAI}
                        disabled={status === 'processing_ai'}
                        className={`w-full py-4 ${status === 'ready_for_ai' ? 'animate-bounce shadow-xl' : ''}`}
                    />
                    {status === 'ready_for_ai' && (
                        <p className="text-sm text-center italic">
                            Usa el modelo entrenado para resumir y explicar el contenido complejo.
                        </p>
                    )}
                </div>
            )}

            {/* Estado: Procesando IA */}
            {status === 'processing_ai' && (
                <div className="p-6 text-center">
                    <i className="fas fa-network-wired fa-pulse text-3xl mb-2 text-ucv-blue"></i>
                    <p>Consultando modelo inteligente...</p>
                </div>
            )}

            {/* Resultado Final (Explicación) */}
            {aiSummary && (
                <div className={`p-6 rounded-xl border-l-8 transition-all duration-500 ease-in-out ${preferences.highContrast ? 'border-yellow-500 bg-gray-900' : 'border-ucv-blue bg-blue-50 shadow-lg'}`}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-ucv-blue text-white p-2 rounded-full w-10 h-10 flex items-center justify-center">
                            <i className="fas fa-universal-access"></i>
                        </div>
                        <h3 className="font-bold text-xl">Explicación Accesible</h3>
                    </div>
                    
                    <p className="text-lg leading-relaxed font-medium mb-6">
                        {aiSummary}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <Button label="Escuchar" icon="fa-volume-up" onClick={() => speak(aiSummary)} />
                        <Button label="Copiar" icon="fa-copy" variant="secondary" onClick={() => {
                            navigator.clipboard.writeText(aiSummary);
                            speak("Texto copiado");
                        }} />
                    </div>
                </div>
            )}
        </div>
    );
};
