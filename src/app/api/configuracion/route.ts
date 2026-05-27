import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return NextResponse.json({ entorno: "produccion" });
  }

  try {
    const supabase = createClient(url, key);
    const { data } = await supabase
      .from("configuracion")
      .select("entorno")
      .limit(1)
      .single();
    return NextResponse.json({ entorno: data?.entorno ?? "produccion" });
  } catch {
    return NextResponse.json({ entorno: "produccion" });
  }
}
