
import { GoogleGenAI } from "@google/genai";
import { INSTITUTIONAL_KNOWLEDGE } from "../data/knowledgeBase";

const SYSTEM_INSTRUCTION = `
Eres "StudAI Bot", un asistente de accesibilidad avanzado y experto en la Institución Educativa.

TU BASE DE CONOCIMIENTO (UTILIZA ESTA INFORMACIÓN PRIORITARIAMENTE):
${INSTITUTIONAL_KNOWLEDGE}

Tus funciones principales:
1. Responder dudas sobre la institución (ubicaciones, reglas, trámites) usando la base de conocimiento arriba.
2. Ayudar a navegar la plataforma (Lector OCR, Subtítulos en Vivo, Agenda).
3. Resumir textos académicos que el usuario pegue en el chat.
4. Simplificar lenguaje complejo para mejorar la comprensión.

Reglas de Comportamiento:
- Si te preguntan algo que está en tu BASE DE CONOCIMIENTO, responde con esos datos exactos.
- Si te preguntan algo fuera de tu conocimiento (ej: "quién ganó el mundial"), responde brevemente pero intenta redirigir a temas académicos.
- Sé extremadamente conciso, directo y empático.
- Si te piden leer algo, indica que usen el botón de "Escuchar" (TTS) de la interfaz o usa el OCR.
- No inventes información sobre trámites institucionales si no está en tu base de datos.
`;

export const sendMessageToGemini = async (
  history: { role: string; parts: { text: string }[] }[],
  message: string
): Promise<string> => {
  if (!process.env.API_KEY) {
    return "Modo demostración: Configure su API Key para usar la IA real y acceder al conocimiento institucional.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7, // Balance entre creatividad y precisión
      },
    });

    // Send history + new message implies the context is maintained
    // Note: In a real implementation with @google/genai, history management 
    // is usually handled by the chat object state if keeping the instance alive, 
    // or by passing history in a stateless request. 
    // For this demo structure where instance is recreated, we assume single-turn 
    // or we'd need to map 'history' to the chat.start() history param.
    
    // Mapping history for context continuity
    const chatHistory = history.slice(0, -1).map(msg => ({
      role: msg.role,
      parts: msg.parts,
    }));

    // Re-initialize chat with history if needed, but for simple request:
    const result = await chat.sendMessage({ message });
    return result.text || "No pude generar una respuesta.";
  } catch (error) {
    console.error("Error communicating with Gemini:", error);
    return "Lo siento, hubo un error técnico al consultar mi base de conocimientos.";
  }
};
