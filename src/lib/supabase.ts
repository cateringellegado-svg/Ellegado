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

export async function saveCotizacion(cotizacion: {
  total_unidades: number;
  productos: { nombre: string; cantidad: number }[];
  total: number;
  cliente_nombre?: string;
  cliente_email?: string;
  cliente_telefono?: string;
}) {
  if (!supabase) return null;
  const { data, error } = await supabase.from("cotizaciones").insert([
    {
      tipo_evento: "Catering",
      num_invitados: cotizacion.total_unidades,
      servicios: JSON.stringify(cotizacion.productos),
      presupuesto: cotizacion.total,
      cliente_nombre: cotizacion.cliente_nombre || null,
      cliente_email: cotizacion.cliente_email || null,
      cliente_telefono: cotizacion.cliente_telefono || null,
      estado: "nueva",
    },
  ]);
  if (error) {
    console.error("Error saving cotizacion:", error);
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
