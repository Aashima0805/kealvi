import { supabase } from "@/lib/supabase";
import { getQuestionsPage, searchQuestions } from "@/lib/questions";

const PAGE_SIZE = 10;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();

  if (q) {
    const questions = await searchQuestions(q, PAGE_SIZE);
    return Response.json({ questions, hasMore: false });
  }

const offset = Number(searchParams.get("offset") ?? 0);
const { questions, hasMore } = await getQuestionsPage(offset, PAGE_SIZE);
  return Response.json({ questions, hasMore });
}

export async function POST(req: Request) {
  const { body, author } = await req.json();

  const normalizedBody = body.trim().toLowerCase();

  const { data: existingQuestion } = await supabase
    .from("questions")
    .select("id, body")
    .ilike("body", normalizedBody)
    .limit(1);

  if (existingQuestion && existingQuestion.length > 0) {
    return Response.json(
      { error: "This question already exists!" },
      { status: 409 }
    );
  }

  const { data, error } = await supabase
    .from("questions")
    .insert({ body, author })
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}