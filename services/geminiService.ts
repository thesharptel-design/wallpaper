import { GoogleGenAI } from "@google/genai";

// Validate API Key by making a lightweight call
export const validateApiKey = async (apiKey: string): Promise<boolean> => {
  try {
    const ai = new GoogleGenAI({ apiKey });
    // Use a lightweight text model for validation to save tokens/latency
    await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'ping',
    });
    return true;
  } catch (error) {
    console.error("API Key validation failed:", error);
    return false;
  }
};

export const generateWallpapers = async (
  apiKey: string,
  prompt: string
): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey });
  
  // We want 4 versions. Since generateContent typically returns one generation per request 
  // (or requires specific model support for 'candidate_count' which varies),
  // we will run parallel requests to ensure distinct seeds and results.
  
  const requests = Array.from({ length: 4 }).map(async () => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [{ text: `High quality mobile wallpaper, 9:16 aspect ratio, aesthetic, detailed. ${prompt}` }]
        },
        config: {
          imageConfig: {
            aspectRatio: "9:16",
            // imageSize: "1K" - Default is adequate
          }
        }
      });

      // Extract image
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData && part.inlineData.data) {
           return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
      return null;
    } catch (e) {
      console.error("Single generation failed", e);
      return null;
    }
  });

  const results = await Promise.all(requests);
  
  // Filter out failed requests
  return results.filter((url): url is string => url !== null);
};