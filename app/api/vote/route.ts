import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request)
{
  const body = await req.json();

  const { poll_option_id } = body;

  const { error } = await supabase
    .from("poll_votes")
    .insert([{ poll_option_id }]);

  if(error)
  {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}