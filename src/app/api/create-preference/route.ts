import { NextRequest, NextResponse } from "next/server";
import MercadoPagoConfig, { Preference } from "mercadopago";
import { createClient } from "@supabase/supabase-js";

async function getEntorno(): Promise<string> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (url && key) {
    try {
      const supabase = createClient(url, key);
      const { data } = await supabase
        .from("configuracion")
        .select("entorno")
        .limit(1)
        .single();
      return (data?.entorno as string) || "produccion";
    } catch (e) {
      console.error("Error fetching MP entorno:", e);
    }
  }
  return "produccion";
}

export async function POST(request: NextRequest) {
  try {
    const entorno = await getEntorno();
    const isTest = entorno === "prueba";
    const accessToken = isTest
      ? process.env.MP_ACCESS_TOKEN_TEST || ""
      : process.env.MP_ACCESS_TOKEN || "";

    if (!accessToken) {
      return NextResponse.json(
        { error: "Mercado Pago no configurado" },
        { status: 503 }
      );
    }

    const client = new MercadoPagoConfig({ accessToken });
    const body = await request.json();
    const { title, quantity, price, externalReference, cotizacionId } = body;

    if (!title || !quantity || !price || isNaN(Number(price)) || Number(price) <= 0) {
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

    const publicKey = isTest
      ? process.env.NEXT_PUBLIC_MP_PUBLIC_KEY_TEST
      : process.env.NEXT_PUBLIC_MP_PUBLIC_KEY;

    return NextResponse.json({
      id: result.id,
      publicKey,
    }, { status: 201 });
  } catch (err) {
    console.error("MP create preference error:", err);
    return NextResponse.json(
      { error: "Error al crear preferencia de pago" },
      { status: 500 }
    );
  }
}
