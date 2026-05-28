import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

function getWhatsappPhone(): string {
  return process.env.WHATSAPP_PHONE || "541176753854";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const topic = body.topic || body.type;
    const resourceId = body.resource?.id || body.data?.id;

    if (!topic || !resourceId) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const xSignature = request.headers.get("x-signature");
    const xRequestId = request.headers.get("x-request-id");
    const dataIdStr = String(resourceId);

    const secret = process.env.MP_WEBHOOK_SECRET;
    if (secret) {
      if (!xSignature || !xRequestId) {
         return NextResponse.json({ error: "Missing signature headers" }, { status: 401 });
      }
      
      const parts = xSignature.split(',');
      const ts = parts.find(p => p.startsWith('ts='))?.replace('ts=', '');
      const v1 = parts.find(p => p.startsWith('v1='))?.replace('v1=', '');

      if (!ts || !v1) {
         return NextResponse.json({ error: "Invalid signature format" }, { status: 401 });
      }

      const manifest = `id:${dataIdStr.toLowerCase()};request-id:${xRequestId};ts:${ts};`;
      const generatedSignature = crypto.createHmac('sha256', secret).update(manifest).digest('hex');

      const bufferV1 = Buffer.from(v1);
      const bufferGenerated = Buffer.from(generatedSignature);

      if (bufferV1.length !== bufferGenerated.length || !crypto.timingSafeEqual(bufferV1, bufferGenerated)) {
         console.error("Invalid Webhook Signature");
         return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    } else {
      console.warn("MP_WEBHOOK_SECRET is not set, skipping signature validation. DO NOT USE IN PRODUCTION.");
    }

    if (topic !== "payment" && topic !== "merchant_order") {
      return NextResponse.json({ received: true });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
    }

    const mpAccessToken = process.env.MP_ACCESS_TOKEN;
    if (!mpAccessToken) {
      console.error("MP access token not configured");
      return NextResponse.json({ error: "MP not configured" }, { status: 503 });
    }

    const paymentRes = await fetch(
      `https://api.mercadopago.com/v1/payments/${resourceId}`,
      { headers: { Authorization: `Bearer ${mpAccessToken}` } }
    );

    if (!paymentRes.ok) {
      console.error("MP API error:", paymentRes.status);
      return NextResponse.json({ error: "MP API error" }, { status: 502 });
    }

    const payment = await paymentRes.json();

    if (payment.status === "approved") {
      const externalRef = payment.external_reference || "";
      const payerEmail = payment.payer?.email || "";
      const payerPhone = payment.payer?.phone?.number || "";

      if (externalRef) {
        const { error: updateError } = await supabase
          .from("cotizaciones")
          .update({
            pago_metodo: "mp",
            pago_status: "paid",
            estado: "confirmada",
          })
          .eq("id", externalRef);

        if (updateError) {
          console.error("Error updating cotizacion:", updateError);
        }

        await supabase.from("admin_logs").insert({
          accion: "pago_mp_aprobado",
          detalle: `Pago MP aprobado. ID: ${resourceId}, Monto: ${payment.transaction_amount}`,
          referencia_id: externalRef,
        });

        const { data: cotizacion } = await supabase
          .from("cotizaciones")
          .select("cliente_nombre, cliente_telefono")
          .eq("id", externalRef)
          .single();

        const nombreCliente = cotizacion?.cliente_nombre || "Cliente";
        const telefono = cotizacion?.cliente_telefono || payerPhone;

        if (telefono) {
          const whatsappNumber = telefono.startsWith("54") ? telefono : `54${telefono}`;

          const mensaje = encodeURIComponent(
            `¡Confirmación de Seña recibida, ${nombreCliente}! 🎉\n\nEl equipo de El Legado ya está organizando tu evento. Te contactaremos 48hs antes para ultimar los detalles.\n\n¡Gracias por confiar en nosotros!`
          );

          const waUrl = `https://wa.me/${whatsappNumber}?text=${mensaje}`;

          try {
            await fetch(waUrl, { method: "GET" });
          } catch (waError) {
            console.error("Error sending WhatsApp notification:", waError);
          }
        }
      }

      await supabase.from("admin_logs").insert({
        accion: "webhook_recibido",
        detalle: `Webhook MP: payment ${resourceId} approved. External ref: ${externalRef || "N/A"}`,
      });
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
