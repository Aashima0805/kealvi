import { supabase } from "@/lib/supabase";

export async function getQuestionsPage(offset: number, limit: number) {
const { data, error } = await supabase
  .from("questions")
  .select("id, body, author, created_at, votes(value)")
  .order("created_at", { ascending: false })
  .range(offset, offset + limit - 1);
  if (error) {
    console.log("Supabase error:", error);
    return { questions: [], hasMore: false };
  }

 const rows = (data ?? []).map((q: any) => ({
  id: q.id,
  body: q.body,
  author: q.author,
  created_at: q.created_at,
 votes:
  q.votes?.reduce(
    (sum: number, vote: any) => sum + vote.value,
    0
  ) ?? 0,
}));

  const hasMore = rows.length === limit;

  return {
    questions: rows,
    hasMore,
  };
}

export async function searchQuestions(q: string, limit: number) {
  const { data, error } = await supabase
  .from("questions")
  .select("id, body, author, created_at, votes(value)")
  .ilike("body", `%${q}%`)
  .limit(limit);

  if (error) {
    console.log("Supabase search error:", error);
    return [];
  }

 return (data ?? []).map((row: any) => ({
  id: row.id,
  body: row.body,
  author: row.author,
  created_at: row.created_at,
  votes:
  row.votes?.reduce(
    (sum: number, vote: any) => sum + vote.value,
    0
  ) ?? 0,
}));
}