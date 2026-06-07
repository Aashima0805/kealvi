import { supabase } from "@/lib/supabase";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: questionId } = await params;
  const { voterId } = await req.json();

  // Check if vote already exists
  const { data: existing } = await supabase
    .from("votes")
    .select("*")
    .eq("question_id", questionId)
    .eq("voter_id", voterId)
    .single();

  if (!existing) {
    // first time vote → insert
    const { error } = await supabase.from("votes").insert({
      question_id: questionId,
      voter_id: voterId,
      value: -1,
    });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ ok: true });
  }

  // already voted → UPDATE instead of insert
  const { error } = await supabase
    .from("votes")
    .update({ value: -1 })
    .eq("question_id", questionId)
    .eq("voter_id", voterId);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}