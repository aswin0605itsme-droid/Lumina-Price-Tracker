import { GoogleGenAI, Type, FunctionDeclaration, Schema } from '@google/genai';
import { Product } from '../types';

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to clean JSON string if markdown code blocks are present
const cleanJson = (text: string) => {
  return text.replace(/^```json\n/, '').replace(/\n```$/, '');
};

// Shared Schema
const productSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING },
        name: { type: Type.STRING },
        price: { type: Type.NUMBER },
        retailer: { type: Type.STRING },
        imageUrl: { type: Type.STRING },
        link: { type: Type.STRING },
        specs: {
          type: Type.OBJECT,
          properties: {
            "Battery": { type: Type.STRING },
            "RAM": { type: Type.STRING },
            "Storage": { type: Type.STRING },
            "Screen": { type: Type.STRING },
            "Processor": { type: Type.STRING },
          }
        },
      },
      required: ["id", "name", "price", "retailer", "specs"],
    },
  };

export const searchProductsWithGemini = async (query: string, currency: string = 'USD'): Promise<Product[]> => {
  if (!apiKey) {
    console.error("API Key is missing");
    return [];
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Search for 3 distinct products matching "${query}" available for purchase in ${currency} currency. 
      
      Requirements:
      1. Prices MUST be in ${currency} (numeric value only).
      2. Find ACTUAL product image URLs.
      3. CRITICAL: If a real image URL cannot be found, use this specific fallback format: "https://image.pollinations.ai/prompt/product photo of {exact_product_name_encoded} studio lighting?width=400&height=400&nologo=true".
      4. Return valid JSON matching the schema.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: 'application/json',
        responseSchema: productSchema,
      },
    });

    const jsonText = response.text || "[]";
    const products = JSON.parse(cleanJson(jsonText)) as Product[];
    
    // Normalize specs for the UI
    return products.map(p => ({
        ...p,
        specs: normalizeSpecs(p.specs)
    }));
  } catch (error) {
    console.error("Gemini Search Error:", error);
    return [];
  }
};

export const getRecommendations = async (history: string[], comparedProducts: Product[], currency: string = 'USD'): Promise<Product[]> => {
    if (!apiKey) return [];

    const context = {
        recentSearches: history.slice(0, 3).join(", "),
        comparedItems: comparedProducts.map(p => p.name).join(", ")
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `The user is interested in these topics: [${context.recentSearches}]. 
            They are currently comparing: [${context.comparedItems}].
            
            Based on this, recommend 4 NEW products available in ${currency} that they might like. 
            Do not repeat products they are already comparing.
            If history is empty, suggest 4 trending tech gadgets.
            
            Requirements:
            1. Prices in ${currency}.
            2. High quality product images (use pollinations.ai fallback if real ones aren't found).
            3. Return valid JSON.`,
            config: {
                tools: [{ googleSearch: {} }],
                responseMimeType: 'application/json',
                responseSchema: productSchema
            }
        });

        const jsonText = response.text || "[]";
        const products = JSON.parse(cleanJson(jsonText)) as Product[];
        return products.map(p => ({
            ...p,
            specs: normalizeSpecs(p.specs)
        }));

    } catch (e) {
        console.error("Recommendation Error", e);
        return [];
    }
};

// Helper to normalize spec values
const normalizeSpecs = (specs: Record<string, string | number>) => {
    return Object.entries(specs).reduce((acc, [key, val]) => {
        const num = parseFloat(val as string);
        acc[key] = !isNaN(num) && (val as string).match(/^\d+(\.\d+)?$/) ? num : val;
        return acc;
    }, {} as Record<string, string | number>);
};

export const analyzeImageWithGemini = async (base64Image: string): Promise<string> => {
    if (!apiKey) return "API Key missing.";

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
                    { text: "Identify this product and list its key specifications and estimated price." }
                ]
            }
        });
        return response.text || "Could not analyze image.";
    } catch (error) {
        console.error("Image Analysis Error:", error);
        return "Error analyzing image.";
    }
};

export const chatWithGemini = async (history: { role: string, parts: { text: string }[] }[], message: string, useThinking = false): Promise<string> => {
    if (!apiKey) return "API Key missing.";

    try {
        const model = useThinking ? 'gemini-3-pro-preview' : 'gemini-3-pro-preview';
        const config: any = {};
        
        if (useThinking) {
            config.thinkingConfig = { thinkingBudget: 16000 };
        }

        const chat = ai.chats.create({
            model: model,
            config: config,
            history: history,
        });

        const result = await chat.sendMessage({ message });
        return result.text || "";
    } catch (error) {
        console.error("Chat Error:", error);
        return "Sorry, I encountered an error processing your request.";
    }
};

export const getQuickAnswer = async (query: string): Promise<string> => {
    if (!apiKey) return "API Key missing.";
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: query,
        });
        return response.text || "";
    } catch (error) {
        console.error("Quick Answer Error:", error);
        return "";
    }
}