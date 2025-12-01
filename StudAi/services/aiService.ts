import { GoogleGenAI } from "@google/genai";
import { AICommandResponse } from '../types';

// MVC: Model Service - Lógica de Inteligencia Artificial

// SEGURIDAD: Leer desde variable de entorno
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || ""; 

/**
 * PROCESADOR DE COMANDOS DE VOZ (NATIVO - SIN PYTHON)
 * Interpreta intenciones usando Reglas y Palabras Clave.
 * Funciona offline y es rápido para APK.
 */
export const processVoiceCommand = async (userSpeech: string): Promise<AICommandResponse> => {
    try {
        if (!userSpeech) return { action: 'UNKNOWN', feedbackText: "No escuché nada." };

        const speech = userSpeech.toLowerCase().trim();
        console.log(`[AI Service] Comando: "${speech}"`);

        // --- 1. LÓGICA DE LOGIN (Relleno de formularios) ---
        
        // Detectar Correo
        if (speech.includes('correo') || speech.includes('email') || speech.includes('usuario')) {
            let cleanEmail = speech
                .replace(/mi correo es|el correo es|correo|email/g, '')
                .trim();
            
            // Reemplazos de seguridad y formato
            cleanEmail = cleanEmail
                .replace(/\s/g, '') // Quitar espacios
                .replace(/arroba/g, '@')
                .replace(/punto/g, '.')
                .toLowerCase();

            return {
                action: 'FILL_FORM',
                target: 'email',
                value: cleanEmail,
                feedbackText: `Entendido. Puse el correo: ${cleanEmail}`
            };
        }

        // Detectar Contraseña
        if (speech.includes('contraseña') || speech.includes('clave') || speech.includes('password')) {
            let cleanPass = speech
                .replace(/mi contraseña es|la contraseña es|contraseña|clave|password/g, '')
                .trim();
            
            // Si parece numérico, quitamos espacios para evitar "1 2 3 4"
            if (!isNaN(Number(cleanPass.replace(/\s/g, '')))) {
                cleanPass = cleanPass.replace(/\s/g, '');
            }

            return {
                action: 'FILL_FORM',
                target: 'password',
                value: cleanPass,
                feedbackText: "Contraseña ingresada."
            };
        }

        // --- 2. LÓGICA DE NAVEGACIÓN ---

        if (speech.includes('horario') || speech.includes('curso') || speech.includes('clase')) {
            return { action: 'NAVIGATE', target: '/courses', feedbackText: "Abriendo tus horarios de clase." };
        }

        if (speech.includes('perfil') || speech.includes('cuenta') || speech.includes('datos')) {
            return { action: 'NAVIGATE', target: '/profile', feedbackText: "Yendo a tu perfil." };
        }

        if (speech.includes('inicio') || speech.includes('principal') || speech.includes('casa')) {
            return { action: 'NAVIGATE', target: '/', feedbackText: "Volviendo al inicio." };
        }
        
        if (speech.includes('navega') || speech.includes('mapa') || speech.includes('ir a') || speech.includes('llevame')) {
            return { action: 'NAVIGATE', target: '/map', feedbackText: "Abriendo navegación del campus." };
        }

        if (speech.includes('leer') || speech.includes('ocr') || speech.includes('escanear') || speech.includes('foto')) {
            return { action: 'NAVIGATE', target: '/ocr', feedbackText: "Abriendo lector inteligente." };
        }

        // --- 3. LÓGICA DE CONFIGURACIÓN ---

        if (speech.includes('contraste') || speech.includes('oscuro')) {
            return { action: 'TOGGLE_SETTING', target: 'highContrast', feedbackText: "Cambiando contraste." };
        }
        
        if (speech.includes('letra') || speech.includes('tamaño') || speech.includes('fuente')) {
            return { action: 'TOGGLE_SETTING', target: 'fontSize', feedbackText: "Aumentando tamaño de letra." };
        }
        
        if (speech.includes('salir') || speech.includes('cerrar')) {
             return { action: 'NAVIGATE', target: '/login', feedbackText: "Cerrando sesión." };
        }

        return {
            action: 'UNKNOWN',
            feedbackText: "No entendí ese comando. Intenta decir: 'Ver mis horarios' o 'Mi correo es...'"
        };

    } catch (error) {
        console.error("Error NLP:", error);
        return { action: 'UNKNOWN', feedbackText: "Error procesando voz." };
    }
};

/**
 * SERVICIO OCR REAL (Usando Google Gemini)
 */
export const performOCR = async (imageFile: File): Promise<string> => {
    if (!GEMINI_API_KEY) {
        return "ERROR DE CONFIGURACIÓN: Falta la API Key de Gemini en el archivo .env o en las variables de entorno.";
    }

    try {
        const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
        
        // Convertir File a Base64
        const base64Data = await fileToGenerativePart(imageFile);
        
        const model = ai.models.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = "Actúa como un sistema OCR. Extrae todo el texto visible en esta imagen tal cual aparece. Solo devuelve el texto plano.";
        
        const result = await model.generateContent([prompt, base64Data]);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error Gemini OCR:", error);
        throw new Error("No se pudo conectar con el servicio de IA.");
    }
};

export const generateAccessibleExplanation = async (text: string): Promise<string> => {
    if (!GEMINI_API_KEY) {
         return "Por favor configura la API Key en las variables de entorno.";
    }

    try {
        const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
        const model = ai.models.getGenerativeModel({ model: "gemini-2.5-flash" });
        
        const prompt = `Eres un asistente de accesibilidad para estudiantes ciegos universitarios. 
        Analiza el siguiente texto y genera una explicación resumida, clara y estructurada.
        Si hay fechas, horarios o lugares, enfatízalos al principio.
        
        Texto: "${text}"`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error Gemini Summary:", error);
        return "Error generando explicación. Verifica tu conexión.";
    }
};

// Helper para convertir imagen a formato Gemini
async function fileToGenerativePart(file: File): Promise<{ inlineData: { data: string; mimeType: string } }> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            // Remover el prefijo "data:image/jpeg;base64,"
            const base64Data = base64String.split(',')[1];
            resolve({
                inlineData: {
                    data: base64Data,
                    mimeType: file.type
                },
            });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}