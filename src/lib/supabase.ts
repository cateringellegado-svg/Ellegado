import { createClient as createBrowserClient } from "@/lib/supabase/client";

function getClient() {
  return createBrowserClient();
}

export async function fetchProductsByCategory(category: string) {
  const supabase = getClient();
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
  const supabase = getClient();
  const { data, error } = await supabase.from("site_config").select("*");
  if (error) return null;
  return data as { key: string; value: string }[];
}
