import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `
Eres "StudAI Bot", un asistente de accesibilidad avanzado integrado en una plataforma educativa SaaS.

Tus funciones principales:
1. Ayudar a navegar la plataforma (Lector OCR, Subtítulos en Vivo, Agenda de Citas, Configuración de Perfil).
2. Resumir textos académicos que el usuario pegue en el chat.
3. Simplificar lenguaje complejo para mejorar la comprensión.
4. Responder dudas sobre cómo reservar citas o ajustar el alto contraste en la configuración.

Reglas:
- Sé extremadamente conciso y directo.
- Si te piden leer algo, indica que usen el botón de "Escuchar" (TTS) de la interfaz.
- Actúa como un soporte técnico amigable y eficiente.
- No menciones que eres parte de un proyecto universitario o tesis. Eres un producto de software.
`;

export const sendMessageToGemini = async (
  history: { role: string; parts: { text: string }[] }[],
  message: string
): Promise<string> => {
  if (!process.env.API_KEY) {
    return "Modo demostración: Configure su API Key para usar la IA real. (Respuesta simulada)";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    const result = await chat.sendMessage({ message });
    return result.text || "No pude generar una respuesta.";
  } catch (error) {
    console.error("Error communicating with Gemini:", error);
    return "Lo siento, hubo un error técnico. Por favor intente más tarde.";
  }
};