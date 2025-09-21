import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";
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
        // Fix: `safetySettings` must be nested inside the `config` object.
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          }
        ]
      },
    });

    if (response.promptFeedback?.blockReason) {
      throw new Error("The uploaded image could not be processed due to content safety policies. Please upload a different image.");
    }
    
    return response.text;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        // Re-throw the specific error message to be caught by the UI
        throw error;
    }
    throw new Error("An unexpected error occurred while fetching feedback from the AI.");
  }
}
