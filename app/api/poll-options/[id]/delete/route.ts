import { supabase } from "@/lib/supabase";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await supabase
    .from("poll_votes")
    .delete()
    .eq("option_id", id);

  const { error } = await supabase
    .from("poll_options")
    .delete()
    .eq("id", id);

  if (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return Response.json({ ok: true });
}