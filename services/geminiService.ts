import { GoogleGenAI, Modality } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY is not defined in environment variables.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
const model = 'gemini-2.5-flash-image-preview';

export const editImageWithNanoBanana = async (
  baseImageBase64: string,
  baseImageMimeType: string,
  poseImageBase64: string,
  textPrompt: string
): Promise<string | null> => {
  try {
    const fullPrompt = `Using the character from the first image, change its pose to match the stick figure in the second image. Also, consider the following instruction: "${textPrompt || 'No additional instructions.'}"`;
    
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            text: fullPrompt,
          },
          {
            inlineData: {
              data: baseImageBase64,
              mimeType: baseImageMimeType,
            },
          },
          {
            inlineData: {
              data: poseImageBase64,
              mimeType: 'image/png',
            },
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    if (response && response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
          return part.inlineData.data; // Return the base64 string of the generated image
        }
      }
    }
    return null; // No image part found
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    if (error instanceof Error) {
        throw new Error(`Gemini API Error: ${error.message}`);
    }
    throw new Error('An unknown error occurred while calling the Gemini API.');
  }
};
