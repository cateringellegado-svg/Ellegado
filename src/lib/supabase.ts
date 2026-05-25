import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase URL or Anon Key is missing. Running in offline mode.");
}

export const supabase =
  supabaseUrl && supabaseUrl.startsWith("http")
    ? createClient(supabaseUrl, supabaseAnonKey!)
    : null;

export async function fetchProductsByCategory(category: string) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("menu_items")
    .select("*")
    .eq("categoria", category)
    .eq("activo", true)
    .order("orden");
  if (error) {
    console.error(`Error fetching ${category} products:`, error);
    return null;
  }
  return data;
}

export async function fetchSiteConfig() {
  if (!supabase) return null;
  const { data, error } = await supabase.from("site_config").select("*");
  if (error) return null;
  return data as { key: string; value: string }[];
}
