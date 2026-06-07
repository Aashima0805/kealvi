import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { question } = await req.json();

    const res = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Answer this question clearly and simply:\n\n${question}`,
    });

    return Response.json({
      answer: res.text,
    });
  } catch (err: any) {
    return Response.json(
      { error: err.message || "AI failed" },
      { status: 500 }
    );
  }
}