import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

export async function POST(req: Request) {
  const { question } = await req.json();

  const res = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `
Rewrite the following question to make it clear, professional, and easy to understand.
Return only the improved question.

Question:
${question}
`,
  });

  return Response.json({
    refined: res.text,
  });
}