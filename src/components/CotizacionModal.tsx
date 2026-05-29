"use client";

import { useState, useCallback, useEffect } from "react";
import type { CotizacionSeleccion, Combo } from "@/types";
import { initMercadoPago, Wallet } from "@mercadopago/sdk-react";
import { useToast } from "./Toast";
import { fetchConfiguracionCompleta } from "@/lib/supabase";
import { MIN_PRODUCT_UNITS, COMBO_MINIMUMS } from "@/lib/constants";
import { getWhatsAppUrl } from "@/lib/constants";
import { useSiteConfig } from "@/lib/site-config";
import PoliticasContratacionText from "./legal/PoliticasContratacionText";

const MP_PUBLIC_KEY = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY || "";
let mpInitialized = false;

const WHATSAPP_MSG_PREFIX =
  "Hola El Legado, me gustaría solicitar una cotización de catering.";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  cotizacion: CotizacionSeleccion;
  total: number;
  anticipo?: number;
  fechaEntrega?: string;
  horarioEntrega?: string;
  modo?: "combo" | "personalizar";
  selectedCombo?: Combo | null;
}

export default function CotizacionModal({
  isOpen,
  onClose,
  cotizacion,
  total,
  anticipo,
  fechaEntrega,
  horarioEntrega,
  modo,
  selectedCombo,
}: Props) {
  const config = useSiteConfig();
  const { showToast } = useToast();
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [aceptoTerminos, setAceptoTerminos] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<"form" | "payment">("form");
  const [cotizacionId, setCotizacionId] = useState<string | null>(null);
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [creatingPreference, setCreatingPreference] = useState(false);
  const [preferenceError, setPreferenceError] = useState(false);

  useEffect(() => {
    if (MP_PUBLIC_KEY && !mpInitialized) {
      mpInitialized = true;
      initMercadoPago(MP_PUBLIC_KEY, { locale: "es-AR" });
    }
  }, []);

  const openWhatsApp = useCallback(() => {
    const productos = Object.values(cotizacion).filter(
      (p) => p.cantidad > 0 && p.precio > 0
    );
    const totalFormat = "$" + total.toLocaleString("es-AR");
    const anticipoFormat = anticipo != null ? "$" + anticipo.toLocaleString("es-AR") : totalFormat;
    const fechaTexto = fechaEntrega
      ? `\n*Fecha de entrega:* ${fechaEntrega}${horarioEntrega ? ` a las ${horarioEntrega} hrs` : ""}`
      : "";

    const productosTexto = productos
      .map(
        (p) =>
          `• ${p.nombre}: ${p.cantidad} unidades ($${p.subtotal.toLocaleString("es-AR")})`
      )
      .join("\n");

    const mensajePersonal = `Mi nombre es ${nombre}. Quedo atento a su respuesta para coordinar los detalles.`;
    const mensaje = `${WHATSAPP_MSG_PREFIX}\n\n*Productos solicitados:*\n${productosTexto}\n${fechaTexto}\n\n*Total del Presupuesto:* ${totalFormat}\n*Anticipo (50%):* ${anticipoFormat}\n\n${mensajePersonal}\n\n_Acepto los términos de cancelación y la cláusula de ajuste por inflación en reservas mayores a 30 días._`;

    window.open(
      getWhatsAppUrl(config.contact.whatsapp, mensaje),
      "_blank",
      "noopener,noreferrer"
    );
  }, [cotizacion, total, anticipo, fechaEntrega, horarioEntrega, nombre, config]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const items = Object.values(cotizacion);
      const unid = items.reduce((s, p) => s + (p.cantidad || 0), 0);
      const esCombo = items.some((p) => p.esCombo);
      const dbConfig = await fetchConfiguracionCompleta();
      const capTotal = dbConfig?.capacidad_diaria_total;
      if (capTotal && unid > capTotal) {
        showToast(`La cantidad solicitada (${unid} u.) supera la capacidad diaria disponible (${capTotal} u.)`, "warning");
        return;
      }
      if (!esCombo) {
        if (unid < MIN_PRODUCT_UNITS) {
          showToast(`El pedido mínimo es de ${MIN_PRODUCT_UNITS} unidades`, "warning");
          return;
        }
        if (unid % 10 !== 0) {
          showToast("La cantidad total debe ser múltiplo de 10", "warning");
          return;
        }
      }
      if (!aceptoTerminos) {
        showToast("Debés aceptar los términos de cancelación y ajuste por inflación", "warning");
        return;
      }
      setSubmitting(true);
      setPreferenceError(false);

      const productos = Object.values(cotizacion).filter(
        (p) => p.cantidad > 0 && p.precio > 0
      );

      // Paso 1: crear la cotización en la base de datos
      let cotId: string | null = null;
      try {
        const res = await fetch("/api/cotizaciones", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            total_unidades: productos.reduce((sum, p) => sum + p.cantidad, 0),
            productos: productos.map((p) => ({
              nombre: p.nombre,
              cantidad: p.cantidad,
              es_combo: p.esCombo || false,
            })),
            total,
            fecha_entrega: fechaEntrega || "",
            cliente_nombre: nombre,
            cliente_telefono: telefono,
            cliente_email: email || "",
          }),
        });

        if (!res.ok) {
          let errMsg = "Error al enviar cotización";
          try {
            const err = await res.json();
            errMsg = err.error || errMsg;
          } catch {}
          showToast(errMsg, "error");
          openWhatsApp();
          setSubmitting(false);
          return;
        }

        const json = await res.json();
        cotId = json.data?.[0]?.id || json.data?.id || null;
        if (cotId) setCotizacionId(cotId);
      } catch {
        showToast("Error de red. Verificá tu conexión e intentá de nuevo.", "error");
        openWhatsApp();
        setSubmitting(false);
        onClose();
        return;
      }

      // Paso 2: crear preferencia de Mercado Pago con el ID real de la cotización
      if (MP_PUBLIC_KEY && cotId) {
        setCreatingPreference(true);
        try {
          const prefRes = await fetch("/api/create-preference", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: modo === "combo" && selectedCombo ? selectedCombo.nombre : "Catering Personalizado",
              quantity: 1,
              price: anticipo ?? Math.round(total * 0.5),
              externalReference: cotId,
              cotizacionId: cotId,
            }),
          });

          if (prefRes.ok) {
            const prefJson = await prefRes.json();
            setPreferenceId(prefJson.id);
            setStep("payment");
            openWhatsApp();
            setSubmitting(false);
            setCreatingPreference(false);
            return;
          } else {
            setPreferenceError(true);
          }
        } catch {
          setPreferenceError(true);
        }
        setCreatingPreference(false);
      }

      // Fallback: abrir WhatsApp y cerrar
      openWhatsApp();
      showToast("Cotización enviada correctamente", "success");
      setSubmitting(false);
      onClose();
    },
    [cotizacion, total, anticipo, nombre, telefono, email, aceptoTerminos, modo, selectedCombo, onClose, showToast, openWhatsApp]
  );

  useEffect(() => {
    if (!isOpen) return;
    setStep("form");
    setPreferenceId(null);
    setPreferenceError(false);
    setCotizacionId(null);
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const items = Object.values(cotizacion);
  const totalUnits = items.reduce((sum, p) => sum + (p.cantidad || 0), 0);
  const esCombo = items.some((p) => p.esCombo);
  const quantityError = !esCombo && totalUnits > 0 && totalUnits < 50
    ? "El pedido mínimo es de 50 unidades"
    : "";
  const quantityWarning = !esCombo && totalUnits > 0 && totalUnits % 10 !== 0
    ? "La cantidad total debe ser múltiplo de 10"
    : "";

  const anticipoCalculado = anticipo ?? Math.round(total * 0.5);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Formulario de cotización"
      className="fixed inset-0 bg-dark-elegant/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-dark-elegant transition-colors cursor-pointer"
          aria-label="Cerrar"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {step === "payment" && preferenceId ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="font-serif text-2xl text-dark-elegant mb-2">
              Reserva Confirmada
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              Ya te enviamos la propuesta por WhatsApp. Ahora podés abonar la seña para asegurar tu fecha.
            </p>

            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-amber-800">
                  Anticipo (50%) — Seña
                </span>
                <span className="font-serif text-lg font-bold text-amber-700">
                  {"$" + anticipoCalculado.toLocaleString("es-AR")}
                </span>
              </div>
              <p className="text-[10px] text-amber-600">
                Este monto confirma tu reserva. El saldo se coordina previo al evento.
              </p>
            </div>

            <div className="mb-4">
              <Wallet initialization={{ preferenceId }} />
            </div>

            <p className="text-[10px] text-slate-400 mt-4">
              También podés coordinar el pago por WhatsApp.
            </p>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-brand-copper/10 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-copper">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="font-serif text-2xl text-dark-elegant mb-2">
                Casi listo...
              </h3>
              <p className="text-sm text-slate-600">
                Completa tus datos para enviarte la propuesta formal por WhatsApp.
              </p>
            </div>

            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 mb-6">
              <div className="text-center mb-3">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                  Resumen del Presupuesto
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">Total del Presupuesto</span>
                  <span className="font-serif font-bold text-dark-elegant">
                    {"$" + total.toLocaleString("es-AR")}
                  </span>
                </div>
                <div className="h-px bg-amber-200/50" />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-amber-800">
                    Anticipo (50%) — Seña
                  </span>
                  <span className="font-serif text-lg font-bold text-amber-700">
                    {"$" + anticipoCalculado.toLocaleString("es-AR")}
                  </span>
                </div>
                <p className="text-[10px] text-amber-600 leading-relaxed text-center pt-1">
                  Este monto confirma tu reserva. El saldo se coordina previo al evento.
                </p>
              </div>
            </div>

            {(quantityError || quantityWarning) && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-center">
                <p className="text-xs font-medium text-red-700">
                  {quantityError || quantityWarning}
                </p>
                <p className="text-[10px] text-red-500 mt-1">
                  Unidades en tu pedido: {totalUnits}
                </p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="cotizacion-nombre" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Nombre y Apellido *
                </label>
                <input
                  id="cotizacion-nombre"
                  name="nombre"
                  type="text"
                  required
                  autoFocus
                  autoComplete="name"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-copper"
                />
              </div>
              <div>
                <label htmlFor="cotizacion-telefono" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Teléfono *
                </label>
                <input
                  id="cotizacion-telefono"
                  name="telefono"
                  type="tel"
                  required
                  autoComplete="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="+54 11 1234 5678"
                  pattern="[\+]?[0-9\s\-]{7,20}"
                  className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-copper"
                />
              </div>
              <div>
                <label htmlFor="cotizacion-email" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Email
                </label>
                <input
                  id="cotizacion-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Opcional"
                  className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-copper"
                />
              </div>
              <details className="mt-4 group">
                <summary className="text-xs text-brand-copper font-medium cursor-pointer hover:underline select-none">
                  Ver políticas de contratación
                </summary>
                <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 leading-relaxed space-y-3 max-h-60 overflow-y-auto">
                  <PoliticasContratacionText />
                </div>
              </details>

              <div className="flex items-start gap-3 mt-4">
                <input
                  id="acepto-terminos"
                  type="checkbox"
                  checked={aceptoTerminos}
                  onChange={(e) => setAceptoTerminos(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-brand-copper/30 text-brand-copper focus:ring-brand-copper cursor-pointer"
                />
                <label htmlFor="acepto-terminos" className="text-[10px] text-slate-500 leading-relaxed cursor-pointer select-none">
                  Acepto las{" "}
                  <button
                    type="button"
                    onClick={(e) => {
                      const details = (e.target as HTMLElement).closest("form")?.querySelector("details");
                      if (details) details.open = !details.open;
                    }}
                    className="underline hover:text-brand-copper transition-colors"
                  >
                    políticas de contratación
                  </button>{" "}
                  (cancelación y ajuste por inflación en reservas &gt; 30 días)
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting || !aceptoTerminos}
                className="w-full bg-[#25D366] text-white font-semibold py-4 rounded-xl shadow-lg shadow-[#25D366]/30 hover:scale-[1.02] transition-all duration-300 uppercase tracking-widest text-sm flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.438 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
                </svg>
                {submitting ? "Enviando..." : "Enviar a WhatsApp"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
