
import { GoogleGenAI, Type } from "@google/genai";

// Use process.env.API_KEY directly for initialization as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateLore = async (prompt: string, context: string = "") => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a world-building assistant. Given the following context: ${context}. Help me with: ${prompt}. Keep the tone consistent with a dark fantasy or epic sci-fi codex.`,
      config: {
        temperature: 0.8,
        topP: 0.95,
      },
    });
    // Access response.text as a property
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The stars are silent. (Failed to generate lore)";
  }
};

export const generateEntitySuggestion = async (type: string, worldContext: string) => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Create a new ${type} for a world with the following setting: ${worldContext}. Provide a name and a detailed 2-paragraph description.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        description: { type: Type.STRING },
                        additionalFields: {
                            type: Type.OBJECT,
                            properties: {
                                race: { type: Type.STRING },
                                age: { type: Type.STRING },
                                type: { type: Type.STRING }
                            }
                        }
                    },
                    required: ["name", "description"]
                }
            }
        });
        // Access response.text as a property and parse JSON
        return JSON.parse(response.text || "{}");
    } catch (error) {
        console.error("Gemini Suggestion Error:", error);
        return null;
    }
}
