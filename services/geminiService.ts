import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ConceptData } from "../types";
import { decodeBase64, decodeAudioData } from "./audioUtils";

// Initialize Gemini Client
// Note: process.env.API_KEY is automatically available in this environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates the SVG visualization and textual explanation.
 */
export const generateConcept = async (prompt: string): Promise<ConceptData> => {
  try {
    const modelId = "gemini-2.5-flash"; // Good for coding and reasoning

    const systemInstruction = `
      You are a world-class technical artist, UI designer for sci-fi movies, and scientific educator.
      Your goal is to explain scientific terms or technical concepts by generating a "Sci-Fi Holographic HUD" style interface.

      ### 1. LANGUAGE REQUIREMENT
      - **CRITICAL:** ALL output text, including the JSON values, the Explanation, the Title, and **text labels inside the SVG**, MUST BE IN **SIMPLIFIED CHINESE (简体中文)**.

      ### 2. VISUALIZATION (SVG) - "Make it Look Advanced"
      Create a COMPLEX, HIGHLY DETAILED, and ANIMATED SVG diagram. It should look like a blueprint from Iron Man's JARVIS or a Star Trek display.
      
      **Aesthetic & Style:**
      - **Theme:** Futuristic Blueprint / Cyberpunk HUD. Dark background compatible.
      - **Colors:** Deep Neon Cyan (#06b6d4), Electric Magenta (#d946ef), Bright Lime (#84cc16), and White highlights. Use opacity (fill-opacity) to create glass/hologram effects.
      - **Complexity:** Do NOT create simple cartoons. Create schematic representations with internal structures, cross-sections, zoom-out bubbles, and data lines.
      - **Decorations:** Include technical artifacts:
        - Grid lines in the background.
        - Rotating concentric circles (HUD elements).
        - Random binary numbers streams or hex codes as texture.
        - Connection nodes with pulsing dots.
      
      **Technical Implementation:**
      - **ViewBox:** Use a large canvas, strictly "0 0 1200 800". FILL the canvas.
      - **Filters & Defs (MANDATORY):** You MUST use <defs> to define:
         - <filter id="glow"> with feGaussianBlur and feMerge for that neon light bloom effect.
         - <linearGradient> for metallic or energy surfaces.
         - <marker> for arrowheads on flow lines.
      - **Animation (MANDATORY):** The diagram MUST be alive.
         - Use <animate> for pulsing opacity (breathing effect).
         - Use <animateTransform> for rotating gears, fans, atoms, or HUD rings.
         - Use <animateMotion> for particles (circles/dots) flowing along paths to show direction of flow (electricity, blood, data, wind).
      
      ### 3. EXPLANATION (Chinese)
      - Provide a professional, engaging explanation of the concept in Simplified Chinese (approx. 150-200 chars).
      - Focus on the structure and principle (结构与原理).
      
      ### 4. TITLE (Chinese)
      - A short title in Simplified Chinese.
    `;

    const userPrompt = `Create a high-tech schematic visualization for: "${prompt}". Explain it in Chinese. Make the visual very complex and animated.`;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            svgCode: { type: Type.STRING, description: "The full raw SVG string with animations, defs, and filters." },
            explanation: { type: Type.STRING, description: "The text explanation script in Chinese." },
          },
          required: ["title", "svgCode", "explanation"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini.");

    const data = JSON.parse(text) as ConceptData;
    return data;

  } catch (error) {
    console.error("Error generating concept:", error);
    throw error;
  }
};

/**
 * Generates audio speech for the explanation.
 */
export const generateSpeech = async (text: string): Promise<AudioBuffer> => {
  try {
    const modelId = "gemini-2.5-flash-preview-tts";

    const response = await ai.models.generateContent({
      model: modelId,
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // Kore tends to have a neutral tone good for tech
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      throw new Error("No audio data returned.");
    }

    // Decode standard PCM data from Gemini
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const audioBuffer = await decodeAudioData(
      decodeBase64(base64Audio),
      audioContext,
      24000,
      1
    );
    
    // We suspend immediately; the UI will resume it when playing.
    audioContext.close(); 
    return audioBuffer;

  } catch (error) {
    console.error("Error generating speech:", error);
    throw error;
  }
};