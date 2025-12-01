import { GoogleGenAI } from "@google/genai";
import { AICommandResponse } from '../types';

// MVC: Model Service - Lógica de Inteligencia Artificial y Procesamiento de Lenguaje Natural (NLP)

// --- CONFIGURACIÓN DE TU MODELO PROPIO (FLASK/PYTHON) ---
const USE_CUSTOM_MODEL = true; // ¡ACTIVADO!
const CUSTOM_MODEL_URL = "http://127.0.0.1:5000/predict"; 

/**
 * PROCESADOR DE COMANDOS DE VOZ
 * 
 * Input: Texto transcrito (Ej: "Llévame a mis horarios y léelos")
 * Output: Objeto JSON con la acción a ejecutar en la app.
 */
export const processVoiceCommand = async (userSpeech: string): Promise<AICommandResponse> => {
    try {
        console.log(`[AI Service] Analizando comando: "${userSpeech}"`);

        // OPCIÓN A: TU MODELO ENTRENADO (PYTHON)
        if (USE_CUSTOM_MODEL) {
            try {
                const response = await fetch(CUSTOM_MODEL_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ command: userSpeech })
                });

                if (!response.ok) throw new Error("Error conectando con servidor Python");

                const data = await response.json(); 
                // data = { intencion: "consultar_horario", confianza: 0.99 }

                console.log("[AI Service] Respuesta del Modelo Python:", data);

                // MAPEO: Intención Python -> Acción React
                // Tus etiquetas: abrir_material, ayuda_accesibilidad, consultar_horario, crear_recordatorio, leer_anuncios, ver_notas
                
                switch (data.intencion) {
                    case 'consultar_horario':
                        return {
                            action: 'NAVIGATE',
                            target: '/courses',
                            feedbackText: "Entendido. Abriendo tu horario de clases."
                        };
                    
                    case 'ver_notas':
                        return {
                            action: 'NAVIGATE',
                            target: '/profile', // O dashboard si tuvieras notas allí
                            feedbackText: "Accediendo a tu registro académico."
                        };

                    case 'leer_anuncios':
                        return {
                            action: 'NAVIGATE',
                            target: '/',
                            feedbackText: "Buscando comunicados oficiales en el inicio."
                        };

                    case 'ayuda_accesibilidad':
                        return {
                            action: 'TOGGLE_SETTING',
                            target: 'highContrast', // Asumimos que piden ayuda visual
                            feedbackText: "Activando modo de accesibilidad visual."
                        };

                    case 'abrir_material':
                        return {
                            action: 'NAVIGATE',
                            target: '/ocr',
                            feedbackText: "Abriendo el lector de documentos."
                        };

                    case 'crear_recordatorio':
                        return {
                            action: 'NAVIGATE',
                            target: '/courses',
                            feedbackText: "Vamos a la agenda para ver tus pendientes."
                        };

                    default:
                        return {
                            action: 'UNKNOWN',
                            feedbackText: "Entendí la intención " + data.intencion + " pero no tengo una acción configurada."
                        };
                }

            } catch (err) {
                console.warn("Fallo al conectar con modelo local, usando lógica de respaldo JS.", err);
                // Si falla el servidor Python, cae al código de abajo (Opción B)
            }
        }

        // OPCIÓN B: SIMULACIÓN DE TU MODELO (MOCK) - Respaldo si el servidor Python está apagado
        const speech = userSpeech.toLowerCase();

        if (speech.includes('horario') || speech.includes('curso') || speech.includes('clase')) {
            return {
                action: 'NAVIGATE',
                target: '/courses',
                feedbackText: "Entendido. Abriendo tu lista de horarios y cursos."
            };
        }

        if (speech.includes('perfil') || speech.includes('cuenta') || speech.includes('datos')) {
            return {
                action: 'NAVIGATE',
                target: '/profile',
                feedbackText: "Accediendo a tu perfil de estudiante."
            };
        }

        if (speech.includes('inicio') || speech.includes('principal') || speech.includes('dashboard')) {
            return {
                action: 'NAVIGATE',
                target: '/',
                feedbackText: "Volviendo a la pantalla principal."
            };
        }
        
        if (speech.includes('navega') || speech.includes('mapa') || speech.includes('campus')) {
            return {
                action: 'NAVIGATE',
                target: '/map',
                feedbackText: "Abriendo navegación guiada por el campus."
            };
        }

        if (speech.includes('leer') || speech.includes('ocr') || speech.includes('escanear')) {
            return {
                action: 'NAVIGATE',
                target: '/ocr',
                feedbackText: "Abriendo escáner inteligente de documentos."
            };
        }

        if (speech.includes('contraste') || speech.includes('oscuro')) {
            return {
                action: 'TOGGLE_SETTING',
                target: 'highContrast',
                feedbackText: "Cambiando modo de contraste."
            };
        }

        if (speech.includes('letra') || speech.includes('grande')) {
             return {
                action: 'TOGGLE_SETTING',
                target: 'fontSize',
                value: 'large',
                feedbackText: "Aumentando el tamaño de la letra."
            };
        }

        return {
            action: 'UNKNOWN',
            feedbackText: "Lo siento, no entendí ese comando."
        };

    } catch (error) {
        console.error("Error procesando comando:", error);
        return {
            action: 'UNKNOWN',
            feedbackText: "Hubo un error al procesar tu voz."
        };
    }
};

/**
 * Función antigua para OCR (Mantenida por compatibilidad)
 */
export const performOCR = async (imageFile: File): Promise<string> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(`UNIVERSIDAD CÉSAR VALLEJO\nCOMUNICADO OFICIAL\n...`);
        }, 1500);
    });
};

export const generateAccessibleExplanation = async (text: string): Promise<string> => {
    // Si tienes Gemini API Key configurada, úsala aquí. Sino, retorna mock.
    // const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return "Resumen generado por IA: El texto indica fechas de matrícula y requisitos para el ciclo 2025-I.";
};