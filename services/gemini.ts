import { GoogleGenAI, Type } from "@google/genai";
import { AIWordAnalysis, QuizQuestion } from "../types";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || ''; // Must be set in .env
const ai = new GoogleGenAI({ apiKey });

export const geminiService = {
  analyzeWord: async (word: string): Promise<AIWordAnalysis> => {
    if (!apiKey) {
      // Mock response if no key provided in dev
      return {
        turkish: "API Key Eksik",
        definition: "Lütfen API Key giriniz.",
        example: "Example sentence unavailable.",
        example_turkish: "Örnek cümle mevcut değil."
      };
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Analyze the English word "${word}". Return a JSON object with: 
        1. "turkish": the Turkish translation. 
        2. "definition": A simple English definition suitable for a learner. 
        3. "example": A simple example sentence in English using the word.
        4. "example_turkish": The Turkish translation of that example sentence.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              turkish: { type: Type.STRING },
              definition: { type: Type.STRING },
              example: { type: Type.STRING },
              example_turkish: { type: Type.STRING },
            },
            required: ["turkish", "definition", "example", "example_turkish"]
          }
        }
      });

      if (response.text) {
        return JSON.parse(response.text) as AIWordAnalysis;
      }
      throw new Error("Boş yanıt");
    } catch (e) {
      console.error("Gemini Error:", e);
      return {
        turkish: "Hata",
        definition: "Çeviri alınamadı.",
        example: "-",
        example_turkish: "-"
      };
    }
  },

  generateQuiz: async (words: string[]): Promise<QuizQuestion[]> => {
    if (!apiKey || words.length === 0) return [];

    try {
      const wordList = words.slice(0, 5).join(", "); // Limit to 5 words context
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Create a multiple-choice quiz (3 questions) based on these words: ${wordList}. 
        Return a JSON array of objects. Each object should have:
        - question: The question text.
        - options: Array of 4 strings.
        - correctAnswer: The correct string from options.
        - explanation: Brief explanation.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctAnswer: { type: Type.STRING },
                explanation: { type: Type.STRING }
              },
              required: ["question", "options", "correctAnswer", "explanation"]
            }
          }
        }
      });

      if (response.text) {
        return JSON.parse(response.text) as QuizQuestion[];
      }
      return [];
    } catch (e) {
      console.error("Quiz Gen Error:", e);
      return [];
    }
  }
};