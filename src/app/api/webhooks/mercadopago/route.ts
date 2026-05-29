import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
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
    const mpPaymentId = String(resourceId);
    const externalRef = payment.external_reference || "";

    // ──────────────────────────────────────────────────────────
    // IDEMPOTENCIA: verificar si este mp_payment_id ya fue
    // procesado exitosamente. Si ya existe → 200 silencioso.
    // ──────────────────────────────────────────────────────────
    if (externalRef && payment.status === "approved") {
      const { data: existing } = await supabase
        .from("cotizaciones")
        .select("mp_payment_id, pago_status")
        .eq("id", externalRef)
        .maybeSingle();

      if (existing?.mp_payment_id === mpPaymentId && existing?.pago_status === "paid") {
        console.log("Webhook duplicado ignorado (payment ya procesado):", mpPaymentId);
        return NextResponse.json({ received: true, ignored: true });
      }
    }

    // ──────────────────────────────────────────────────────────
    // Manejo según estado del pago
    // ──────────────────────────────────────────────────────────
    if (payment.status === "approved") {
      const payerPhone = payment.payer?.phone?.number || "";

      if (externalRef) {
        // Actualizar cotización con el mp_payment_id y estado "paid"
        const { error: updateError } = await supabase
          .from("cotizaciones")
          .update({
            pago_metodo: "mp",
            pago_status: "paid",
            estado: "confirmada",
            mp_payment_id: mpPaymentId,
          })
          .eq("id", externalRef);

        if (updateError) {
          // Si el índice único rechazó el update (mp_payment_id duplicado),
          // significa que otro webhook ya lo procesó → abortar silenciosamente
          if (updateError.code === "23505") {
            console.log("Unique constraint evitó duplicado de mp_payment_id:", mpPaymentId);
            return NextResponse.json({ received: true, ignored: true });
          }
          console.error("Error updating cotizacion:", updateError);
        }

        await supabase.from("admin_logs").insert({
          accion: "pago_mp_aprobado",
          detalle: `Pago MP aprobado. ID: ${mpPaymentId}, Monto: ${payment.transaction_amount}`,
          referencia_id: externalRef,
        });

        // ──────────────────────────────────────────────────────
        // WhatsApp: SOLO se envía si el pago no había sido
        // procesado antes (ya verificado arriba). Garantiza que
        // la notificación se dispara UNA SOLA VEZ.
        // ──────────────────────────────────────────────────────
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
            `Confirmacion de Senia recibida, ${nombreCliente}!\n\nEl equipo de El Legado ya esta organizando tu evento. Te contactaremos 48hs antes para ultimar los detalles.\n\nGracias por confiar en nosotros!`
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
        detalle: `Webhook MP: payment ${mpPaymentId} approved. External ref: ${externalRef || "N/A"}`,
      });
    }

    // ──────────────────────────────────────────────────────────
    // Manejo de reembolsos y cancelaciones (nuevo)
    // ──────────────────────────────────────────────────────────
    if (payment.status === "refunded" || payment.status === "cancelled" || payment.status === "charged_back") {
      if (externalRef) {
        await supabase
          .from("cotizaciones")
          .update({
            pago_status: payment.status === "refunded" ? "refunded" : "cancelled",
            estado: payment.status === "refunded" ? "reembolsada" : "cancelada",
          })
          .eq("id", externalRef);

        await supabase.from("admin_logs").insert({
          accion: `pago_mp_${payment.status}`,
          detalle: `Pago MP ${payment.status}. ID: ${mpPaymentId}, Monto: ${payment.transaction_amount}`,
          referencia_id: externalRef,
        });
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
