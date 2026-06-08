import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  const { question } = await req.json();

  const res = await ai.models.generateContent({
   model: "gemini-2.5-flash-lite",
    contents: question,
  });

  return Response.json({ answer: res.text ?? "no text returned" });
}