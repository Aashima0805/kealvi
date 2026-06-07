import { supabase } from "@/lib/supabase";
export async function GET() {
  const { data, error } = await supabase
    .from("polls")
    .select(`
  *,
  poll_options (
    *,
    poll_votes(count)
  )
`)
    .order("created_at", { ascending: false });

  if (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return Response.json(data);
}
export async function POST(req: Request) {
  const { question, options } = await req.json();

  const { data: poll, error } = await supabase
    .from("polls")
    .insert({ question })
    .select()
    .single();

  if (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }

  const rows = options
    .filter((o: string) => o.trim())
    .map((o: string) => ({
      poll_id: poll.id,
      option_text: o,
    }));

  await supabase
    .from("poll_options")
    .insert(rows);

  return Response.json({ ok: true });
}