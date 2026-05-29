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

export async function fetchCombos() {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("combos")
    .select("*")
    .eq("activo", true)
    .order("orden");
  if (error) {
    console.error("Error fetching combos:", error);
    return null;
  }
  return data as import("@/types").Combo[];
}

export async function insertLead(tipo_evento: string, num_invitados: number | null) {
  const supabase = getClient();
  const { error } = await supabase.from("leads").insert([
    { tipo_evento, num_invitados },
  ]);
  if (error) {
    console.error("Error inserting lead:", error);
  }
}

export async function fetchSiteConfig() {
  const supabase = getClient();
  const { data, error } = await supabase.from("site_config").select("*");
  if (error) return null;
  return data as { key: string; value: string }[];
}

export async function fetchConfiguracion() {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("configuracion")
    .select("factor_ajuste, entorno")
    .limit(1)
    .single();
  if (error) {
    console.error("Error fetching configuracion:", error);
    return null;
  }
  return data as { factor_ajuste: number; entorno?: string };
}

export async function checkComboCapacidad(comboId: string, fecha: string) {
  const supabase = getClient();
  const { data, error } = await supabase
    .rpc("check_combo_capacidad", { p_combo_id: comboId, p_fecha: fecha });
  if (error) {
    console.error("Error checking combo capacity:", error);
    return null;
  }
  return data as { disponible: boolean; cupo_total: number; cupo_usado: number }[];
}

export async function fetchConfiguracionCompleta() {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("configuracion")
    .select("*")
    .limit(1)
    .single();
  if (error) {
    console.error("Error fetching configuracion completa:", error);
    return null;
  }
  return data as import("@/types").Configuracion;
}

export async function updateConfiguracionAdmin(values: {
  factor_ajuste?: number;
  mp_access_token?: string;
  mp_access_token_test?: string;
  entorno?: "produccion" | "prueba";
  capacidad_diaria_total?: number;
}) {
  const supabase = getClient();
  const id = (await supabase.from("configuracion").select("id").limit(1).single()).data?.id;
  if (!id) {
    const { error: insertError } = await supabase.from("configuracion").insert([{ factor_ajuste: 1.0, ...values }]);
    return { error: insertError };
  }
  const { error } = await supabase.from("configuracion").update(values).eq("id", id);
  return { error };
}

export async function fetchAllCombosAdmin() {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("combos")
    .select("*")
    .order("orden");
  if (error) {
    console.error("Error fetching all combos:", error);
    return null;
  }
  return data as import("@/types").Combo[];
}

export async function updateComboAdmin(
  id: string,
  values: {
    nombre?: string;
    descripcion?: string;
    precio?: number;
    activo?: boolean;
    orden?: number;
    items_json?: import("@/types").ComboItem[];
    personas_min?: number;
    personas_max?: number;
    capacidad_diaria?: number;
  }
) {
  const supabase = getClient();
  const { error } = await supabase.from("combos").update(values).eq("id", id);
  return { error };
}

export async function deleteComboAdmin(id: string) {
  const supabase = getClient();
  const { error } = await supabase.from("combos").delete().eq("id", id);
  return { error };
}

export async function createComboAdmin(values: {
  id: string;
  nombre: string;
  descripcion: string;
  items_json: import("@/types").ComboItem[];
  precio: number;
  personas_min: number;
  personas_max: number;
  activo: boolean;
  orden: number;
}) {
  const supabase = getClient();
  const { error } = await supabase.from("combos").insert(values);
  return { error };
}

export async function fetchAdminLogs(limit = 50) {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("admin_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("Error fetching admin logs:", error);
    return null;
  }
  return data as import("@/types").AdminLog[];
}

export async function insertAdminLog(accion: string, detalle = "", referenciaId = "") {
  const supabase = getClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase.from("admin_logs").insert({
    accion,
    detalle,
    usuario_email: user?.email || "",
    referencia_id: referenciaId,
  });
  return { error };
}

export async function marcarReservaManual(cotizacionId: string) {
  const supabase = getClient();
  const { error } = await supabase
    .from("cotizaciones")
    .update({ pago_metodo: "manual", pago_status: "reserved", reserva_manual: true, estado: "confirmada" })
    .eq("id", cotizacionId);
  return { error };
}

// ============================================================
// Clientes CRUD
// ============================================================
export async function createCliente(values: {
  nombre: string;
  email?: string | null;
  telefono?: string | null;
  direccion?: string | null;
  tipo_documento?: string;
  numero_documento?: string | null;
  condicion_iva?: string;
  moneda_preferida?: string;
  notas?: string | null;
}) {
  const supabase = getClient();
  const { data, error } = await supabase.from("clientes").insert([values]).select().single();
  return { data, error };
}

export async function updateCliente(
  id: string,
  values: {
    nombre?: string;
    email?: string | null;
    telefono?: string | null;
    direccion?: string | null;
    tipo_documento?: string;
    numero_documento?: string | null;
    condicion_iva?: string;
    moneda_preferida?: string;
    notas?: string | null;
  }
) {
  const supabase = getClient();
  const { error } = await supabase.from("clientes").update(values).eq("id", id);
  return { error };
}

export async function deleteCliente(id: string) {
  const supabase = getClient();
  const { error } = await supabase.from("clientes").delete().eq("id", id);
  return { error };
}

// ============================================================
// Cotizaciones CRUD
// ============================================================
export async function deleteCotizacion(id: string) {
  const supabase = getClient();
  const { error } = await supabase.from("cotizaciones").delete().eq("id", id);
  return { error };
}

export interface TestimonialRow {
  id: string;
  name: string;
  text: string;
  event: string;
  rating: number;
  menu: string;
  active: boolean;
  orden: number;
  created_at: string;
}

export async function fetchTestimonialsAdmin() {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .order("orden", { ascending: true });
  if (error) throw error;
  return (data || []) as TestimonialRow[];
}

export async function createTestimonialAdmin(values: {
  name: string;
  text: string;
  event: string;
  rating: number;
  menu: string;
  active: boolean;
  orden: number;
}) {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("testimonials")
    .insert(values)
    .select();
  if (error) throw error;
  return (data?.[0] || null) as TestimonialRow | null;
}

export async function updateTestimonialAdmin(
  id: string,
  values: Partial<{
    name: string;
    text: string;
    event: string;
    rating: number;
    menu: string;
    active: boolean;
    orden: number;
  }>
) {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("testimonials")
    .update(values)
    .eq("id", id)
    .select();
  if (error) throw error;
  return (data?.[0] || null) as TestimonialRow | null;
}

export async function deleteTestimonialAdmin(id: string) {
  const supabase = getClient();
  const { error } = await supabase.from("testimonials").delete().eq("id", id);
  return { error };
}
