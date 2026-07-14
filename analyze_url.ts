import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function analyzeUrl() {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "Analyze the website https://ai-interview-coach-henna.vercel.app and list all the interview categories, roles, and key features it offers. Format the output as a JSON object with 'categories' (array of strings) and 'features' (array of strings).",
    config: {
      tools: [{ urlContext: {} }]
    }
  });

  console.log(response.text);
}

analyzeUrl();
