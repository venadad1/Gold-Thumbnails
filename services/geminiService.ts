import { GoogleGenAI } from "@google/genai";
import { GenerationConfig, ThumbnailQuality } from '../types';

// Initialize the API client dynamically to ensure we pick up the key after selection
const getAiClient = () => {
  // The API key is injected into process.env.API_KEY after the user selects it via window.aistudio
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found. Please select an API key.");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateThumbnail = async (config: GenerationConfig): Promise<string> => {
  const ai = getAiClient();
  
  // Select model based on quality
  // Standard (Free): gemini-2.5-flash-image
  // Pro (Paid Key): gemini-3-pro-image-preview
  const isPro = config.quality === ThumbnailQuality.PRO;
  const model = isPro ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';

  // Construct a powerful prompt optimized for YouTube thumbnails
  const basePrompt = `
    Create a high-quality YouTube thumbnail (16:9 aspect ratio).
    Style: ${config.style}.
    
    Subject Description: ${config.prompt}
    
    Visual Requirements:
    - High contrast and saturation.
    - Eye-catching composition.
    - Clear focal point.
    - Professional lighting (rim lighting, dramatic shadows where appropriate).
    - Textures should be detailed and sharp.
    - If a character is described or provided, ensure their expression is emotive and engaging.
    - No text overlay unless explicitly asked for, focus on the visual art.
  `;

  const parts: any[] = [];

  // If there is a character image, we add it to the parts
  if (config.characterImage) {
    // Extract base64 data (remove data:image/xyz;base64, prefix)
    const base64Data = config.characterImage.split(',')[1];
    const mimeType = config.characterImage.substring(config.characterImage.indexOf(':') + 1, config.characterImage.indexOf(';'));

    parts.push({
      inlineData: {
        mimeType: mimeType,
        data: base64Data
      }
    });
    
    parts.push({
      text: `${basePrompt} \n\n IMPORTANT: Use the character in the provided image as the main subject of this thumbnail. Adapt them into the ${config.style} style while keeping their recognizable features.`
    });
  } else {
    parts.push({
      text: basePrompt
    });
  }

  try {
    const generationConfig: any = {
        imageConfig: {
          aspectRatio: "16:9",
        }
    };

    // Only add imageSize for Pro model as Flash doesn't support it
    if (isPro) {
        generationConfig.imageConfig.imageSize = "2K";
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: parts
      },
      config: generationConfig
    });

    // Extract image from response
    // The response for images might be in candidates[0].content.parts
    // We need to find the part with inlineData or similar
    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
        const content = candidates[0].content;
        const imagePart = content.parts.find((p: any) => p.inlineData);
        
        if (imagePart && imagePart.inlineData) {
            return `data:image/png;base64,${imagePart.inlineData.data}`;
        }
    }
    
    throw new Error("No image generated. The model might have refused the request.");

  } catch (error) {
    console.error("Thumbnail Generation Error:", error);
    throw error;
  }
};

export const checkApiKey = async (): Promise<boolean> => {
  if (window.aistudio && window.aistudio.hasSelectedApiKey) {
    return await window.aistudio.hasSelectedApiKey();
  }
  return false;
};

export const openApiKeySelector = async (): Promise<void> => {
  if (window.aistudio && window.aistudio.openSelectKey) {
    await window.aistudio.openSelectKey();
  }
};