import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const {
    poll_id,
    option_id,
    user_id,
  } = await req.json();

  const { error } = await supabase
    .from("poll_votes")
    .insert({
      poll_id,
      option_id,
      user_id,
    });

  if (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return Response.json({ ok: true });
}