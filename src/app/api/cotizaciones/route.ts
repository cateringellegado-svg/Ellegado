import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cotizacionSchema } from "@/lib/schemas";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

const RATE_LIMIT_WINDOW = 60_000;
const MAX_REQUESTS_PER_WINDOW = 5;
const ipMap = new Map<string, number[]>();

setInterval(() => {
  const now = Date.now();
  for (const [ip, timestamps] of ipMap.entries()) {
    const valid = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW);
    if (valid.length === 0) {
      ipMap.delete(ip);
    } else {
      ipMap.set(ip, valid);
    }
  }
}, 60_000);

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = ipMap.get(ip) ?? [];
  const valid = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW);
  ipMap.set(ip, [...valid, now]);
  return valid.length < MAX_REQUESTS_PER_WINDOW;
}

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Intentá de nuevo en un minuto." },
        { status: 429 }
      );
    }

    const body = await request.json();

    const parsed = cotizacionSchema.safeParse(body);
    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      return NextResponse.json({ error: "Datos inválidos", details: errors }, { status: 400 });
    }

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json(
        { error: "Servicio no disponible. Intentá de nuevo más tarde." },
        { status: 503 }
      );
    }

    const { data, error } = await supabase.from("cotizaciones").insert([
      {
        tipo_evento: "Catering",
        num_invitados: parsed.data.total_unidades,
        servicios: JSON.stringify(parsed.data.productos),
        presupuesto: parsed.data.total,
        cliente_nombre: parsed.data.cliente_nombre,
        cliente_email: parsed.data.cliente_email || null,
        cliente_telefono: parsed.data.cliente_telefono,
        estado: "nueva",
      },
    ]);

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: "Error al guardar la cotización" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
