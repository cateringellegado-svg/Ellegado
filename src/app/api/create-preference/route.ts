import { NextRequest, NextResponse } from "next/server";
import MercadoPagoConfig, { Preference } from "mercadopago";
import { createClient } from "@supabase/supabase-js";

interface ConfigData {
  entorno?: string;
  mp_access_token?: string;
  mp_access_token_test?: string;
}

async function getConfig(): Promise<ConfigData | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (url && key) {
    try {
      const supabase = createClient(url, key);
      const { data } = await supabase
        .from("configuracion")
        .select("entorno, mp_access_token, mp_access_token_test")
        .limit(1)
        .single();
      return data as ConfigData | null;
    } catch (e) {
      console.error("Error fetching MP config:", e);
      throw e;
    }
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const config = await getConfig();
    const isTest = config?.entorno === "prueba";
    const accessToken = isTest
      ? config?.mp_access_token_test || process.env.MP_ACCESS_TOKEN_TEST || ""
      : config?.mp_access_token || process.env.MP_ACCESS_TOKEN || "";

    if (!accessToken) {
      return NextResponse.json(
        { error: "Mercado Pago no configurado" },
        { status: 503 }
      );
    }

    const client = new MercadoPagoConfig({ accessToken });
    const body = await request.json();
    const { title, quantity, price, externalReference, cotizacionId } = body;

    if (!title || !quantity || !price) {
      return NextResponse.json(
        { error: "Faltan datos: title, quantity, price" },
        { status: 400 }
      );
    }

    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: [
          {
            id: "anticipo-catering",
            title: String(title),
            quantity: Number(quantity),
            unit_price: Number(price),
            currency_id: "ARS",
          },
        ],
        notification_url: `${request.nextUrl.origin}/api/webhooks/mercadopago`,
        external_reference: externalReference || cotizacionId || "",
        purpose: "wallet_purchase",
        auto_return: "approved",
        back_urls: {
          success: `${request.nextUrl.origin}/?mp_status=success`,
          failure: `${request.nextUrl.origin}/?mp_status=failure`,
          pending: `${request.nextUrl.origin}/?mp_status=pending`,
        },
      },
    });

    return NextResponse.json({ id: result.id }, { status: 201 });
  } catch (err) {
    console.error("MP create preference error:", err);
    return NextResponse.json(
      { error: "Error al crear preferencia de pago" },
      { status: 500 }
    );
  }
}
