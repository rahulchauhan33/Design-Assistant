
import { GoogleGenAI } from "@google/genai";
import type { PersonalityData } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getDesignFeedback(
  prompt: string,
  image: { data: string; mimeType: string } | null,
  personalityData: PersonalityData
): Promise<string> {
  
  const model = 'gemini-2.5-flash';
  const parts: ({ text: string } | { inlineData: { mimeType: string; data: string } })[] = [];

  if (image) {
    // Strip the base64 prefix e.g., "data:image/png;base64,"
    const base64Data = image.data.split(',')[1];
    parts.push({
      inlineData: {
        mimeType: image.mimeType,
        data: base64Data,
      },
    });
  }

  // Add the text prompt, ensuring it's not empty.
  // The Gemini API requires a non-empty prompt even with an image.
  const effectivePrompt = prompt || "Please analyze the attached image and provide feedback based on your persona.";
  parts.push({ text: effectivePrompt });
  
  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: parts },
      config: {
        systemInstruction: personalityData.systemInstruction,
      },
    });
    
    return response.text;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        return `Failed to get feedback from AI: ${error.message}`;
    }
    return "An unexpected error occurred while fetching feedback from the AI.";
  }
}
