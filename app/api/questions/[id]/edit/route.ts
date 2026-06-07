import { supabase } from "@/lib/supabase";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { body } = await req.json();

  const { data, error } = await supabase
    .from("questions")
    .update({ body })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.log("Edit error:", error);

    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return Response.json(data);
}