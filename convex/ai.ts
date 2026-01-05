import { action } from "./_generated/server";
import { v } from "convex/values";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const scanWorkoutImage = action({
  args: { base64Image: v.string() },
  handler: async (ctx, args) => {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const prompt = `
  Analyze this gym whiteboard. Distinguish between standard strength movements and WODs/Metcons.
  Return a JSON array of blocks. Each block must have:
  - type: 'STRENGTH' or 'WOD'
  - title: string (e.g., "Strength Complex" or "WOD #1")
  - timeCap: string (e.g., "7:00" or null)
  - repScheme: string (e.g., "21-15-9" or null)
  - exercises: array of strings (the movements involved)
`;

    const imagePart = {
      inlineData: {
        data: args.base64Image,
        mimeType: "image/png",
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = result.response.text();

    // Clean potential markdown and parse
    const cleanJson = response.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson);
  }
});
