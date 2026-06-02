"use client";

import { useState, useCallback, useEffect } from "react";
import type { CotizacionSeleccion, Combo } from "@/types";
import { useToast } from "./Toast";
import { fetchConfiguracionCompleta } from "@/lib/supabase";
import { MIN_PRODUCT_UNITS } from "@/lib/constants";
import { getWhatsAppUrl } from "@/lib/constants";
import { useSiteConfig } from "@/lib/site-config";
import { calcAnticipo } from "@/lib/formatters";
import PoliticasContratacionText from "./legal/PoliticasContratacionText";

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
  const [submitted, setSubmitted] = useState(false);

  const openWhatsApp = useCallback(() => {
    const productos = Object.values(cotizacion).filter(
      (p) => p.cantidad > 0 && p.precio > 0
    );
    const totalFormat = "$" + total.toLocaleString("es-AR");
    const anticipoFormat =
      anticipo != null
        ? "$" + anticipo.toLocaleString("es-AR")
        : totalFormat;
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
    const mensaje = `${WHATSAPP_MSG_PREFIX}\n\n*Productos solicitados:*\n${productosTexto}${fechaTexto}\n\n*Total del Presupuesto:* ${totalFormat}\n*Anticipo (50%):* ${anticipoFormat}\n\n${mensajePersonal}\n\n_Acepto los términos de cancelación y la cláusula de ajuste por inflación en reservas mayores a 30 días._`;

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
        showToast(
          `La cantidad solicitada (${unid} u.) supera la capacidad diaria disponible (${capTotal} u.)`,
          "warning"
        );
        return;
      }
      if (!esCombo) {
        if (unid < MIN_PRODUCT_UNITS) {
          showToast(
            `El pedido mínimo es de ${MIN_PRODUCT_UNITS} unidades`,
            "warning"
          );
          return;
        }
        if (unid % 10 !== 0) {
          showToast("La cantidad total debe ser múltiplo de 10", "warning");
          return;
        }
      }
      if (!aceptoTerminos) {
        showToast(
          "Debés aceptar los términos de cancelación y ajuste por inflación",
          "warning"
        );
        return;
      }
      setSubmitting(true);

      const productos = Object.values(cotizacion).filter(
        (p) => p.cantidad > 0 && p.precio > 0
      );

      try {
        const payload = {
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
        };
        const res = await fetch("/api/cotizaciones", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          let errMsg = "Error al enviar cotización";
          try {
            const err = await res.json();
            errMsg = err.error || errMsg;
          } catch {}
          showToast(errMsg, "error");
          setSubmitting(false);
          return;
        }
      } catch {
        showToast(
          "Error de red. Verificá tu conexión e intentá de nuevo.",
          "error"
        );
        setSubmitting(false);
        return;
      }

      setSubmitted(true);
      setSubmitting(false);
    },
    [
      cotizacion,
      total,
      nombre,
      telefono,
      email,
      aceptoTerminos,
      showToast,
      fechaEntrega,
      horarioEntrega,
      anticipo,
    ]
  );

  useEffect(() => {
    if (!isOpen) return;
    setSubmitted(false);
    setSubmitting(false);
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
  const quantityError =
    !esCombo && totalUnits > 0 && totalUnits < 50
      ? "El pedido mínimo es de 50 unidades"
      : "";
  const quantityWarning =
    !esCombo && totalUnits > 0 && totalUnits % 10 !== 0
      ? "La cantidad total debe ser múltiplo de 10"
      : "";

  const anticipoCalculado = anticipo ?? calcAnticipo(total);

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

        <>
          {/* Header */}
          {submitted ? (
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-600">
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="font-serif text-xl text-dark-elegant mb-1">
                Cotización Enviada
              </h3>
              <p className="text-xs text-slate-600">
                Tu cotización fue registrada. Abrí WhatsApp para finalizar.
              </p>
            </div>
          ) : (
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-brand-copper/10 rounded-full flex items-center justify-center mx-auto mb-3 text-brand-copper">
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="font-serif text-xl text-dark-elegant mb-1">
                Casi listo...
              </h3>
              <p className="text-xs text-slate-600">
                Completa tus datos para recibir la propuesta formal.
              </p>
            </div>
          )}

          {/* Resumen del presupuesto — siempre visible */}
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 mb-4">
            <div className="flex justify-between items-center mb-1 text-sm">
              <span className="text-slate-600">Total del Presupuesto</span>
              <span className="font-serif font-bold text-dark-elegant">
                {"$" + total.toLocaleString("es-AR")}
              </span>
            </div>
            <div className="h-px bg-amber-200/50 my-2" />
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-amber-800">
                Anticipo (50%) — Seña
              </span>
              <span className="font-serif text-lg font-bold text-amber-700">
                {"$" + anticipoCalculado.toLocaleString("es-AR")}
              </span>
            </div>
            <p className="text-[10px] text-amber-600 leading-relaxed text-center pt-1">
              Este monto confirma tu reserva. El saldo se coordina previo al
              evento.
            </p>
          </div>

          {(quantityError || quantityWarning) && !submitted && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-center">
              <p className="text-xs font-medium text-red-700">
                {quantityError || quantityWarning}
              </p>
              <p className="text-[10px] text-red-500 mt-1">
                Unidades en tu pedido: {totalUnits}
              </p>
            </div>
          )}

          {/* Loading State */}
          {submitting && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center animate-pulse">
              <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm font-semibold text-blue-700">
                Guardando reserva...
              </p>
              <p className="text-xs text-blue-500 mt-1">
                Esto puede tomar unos segundos
              </p>
            </div>
          )}

          {/* Form State */}
          {!submitted && !submitting && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="cotizacion-nombre"
                  className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1"
                >
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
                <label
                  htmlFor="cotizacion-telefono"
                  className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1"
                >
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
                <label
                  htmlFor="cotizacion-email"
                  className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1"
                >
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
                <label
                  htmlFor="acepto-terminos"
                  className="text-[10px] text-slate-500 leading-relaxed cursor-pointer select-none"
                >
                  Acepto las{" "}
                  <a
                    href="/politicas-contratacion"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-brand-copper transition-colors"
                  >
                    políticas de contratación
                  </a>{" "}
                  (cancelación y ajuste por inflación en reservas &gt; 30 días)
                </label>
              </div>
              <button
                type="submit"
                disabled={submitting || !aceptoTerminos}
                className="w-full bg-dark-elegant text-white font-semibold py-4 rounded-xl shadow-lg hover:scale-[1.02] transition-all duration-300 uppercase tracking-widest text-sm flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirmar Datos
              </button>
              <div className="text-center mt-2">
                <button
                  type="button"
                  onClick={openWhatsApp}
                  className="text-xs text-slate-500 hover:text-brand-copper underline underline-offset-2 transition-colors cursor-pointer"
                >
                  Prefiero contactar por WhatsApp
                </button>
              </div>
            </form>
          )}

          {/* Post-Submit State */}
          {submitted && !submitting && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-600">
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
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <p className="font-semibold text-dark-elegant">
                  ✅ ¡Cotización guardada con éxito!
                </p>
              </div>

              <button
                onClick={openWhatsApp}
                className="w-full bg-[#25D366] text-white font-semibold py-3 rounded-xl shadow-lg hover:scale-[1.02] transition-all text-sm text-center cursor-pointer"
              >
                Abrir WhatsApp manualmente
              </button>

              <button
                onClick={onClose}
                className="w-full text-xs text-slate-500 hover:text-dark-elegant underline underline-offset-2 transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          )}
        </>
      </div>
    </div>
  );
}
