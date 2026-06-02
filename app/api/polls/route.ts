import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET()
{
  const { data, error } = await supabase
    .from("polls")
    .select(`
      id,
      question,
      poll_options (
        id,
        option_text
      )
    `);

  if(error)
  {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}