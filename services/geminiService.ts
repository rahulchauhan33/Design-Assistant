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

    // Check for blocking due to safety or other reasons.
    if (!response.candidates || response.candidates.length === 0) {
      const blockReason = response.promptFeedback?.blockReason;
      if (blockReason) {
        throw new Error(`Your request was blocked due to: ${blockReason}. Please modify your prompt or image.`);
      }
      throw new Error("The AI did not generate a response. This may be due to the content of your prompt or image. Please try again.");
    }
    
    const text = response.text;

    if (!text) {
        const finishReason = response.candidates[0].finishReason;
        if (finishReason === 'SAFETY') {
            throw new Error("The generated response was blocked due to safety policies. Please adjust your request.");
        }
        // Handle cases where the model legitimately returns an empty string.
        throw new Error("The AI returned an empty response. Please try rephrasing your request.");
    }
    
    return text;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        // Re-throw the specific error message to be caught by the UI
        throw error;
    }
    throw new Error("An unexpected error occurred while fetching feedback from the AI.");
  }
}


export async function generateImage(prompt: string): Promise<string> {
  if (!prompt) {
    throw new Error("A text prompt is required to generate an image.");
  }
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/png',
        aspectRatio: '1:1',
      },
    });

    if (!response.generatedImages || response.generatedImages.length === 0) {
      throw new Error("Image generation failed to produce an image. This could be due to a content policy violation or an empty response.");
    }

    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
    return base64ImageBytes;

  } catch (error) {
    console.error("Error calling Gemini Image API:", error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error("An unexpected error occurred while generating the image.");
  }
}