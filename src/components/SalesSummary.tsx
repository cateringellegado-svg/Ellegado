"use client";

import { useState, useEffect, useCallback } from "react";
import type { CotizacionSeleccion, Combo } from "@/types";
import { initMercadoPago, Wallet } from "@mercadopago/sdk-react";
import CotizacionModal from "./CotizacionModal";
import { useToast } from "./Toast";
import { ShoppingCart, CreditCard, MessageCircle } from "lucide-react";
import DeliveryPolicy from "./DeliveryPolicy";

function formatARS(value: number): string {
  return "$" + value.toLocaleString("es-AR");
}

const MP_PUBLIC_KEY = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY || "";
let mpInitialized = false;

function ensureMercadoPago() {
  if (MP_PUBLIC_KEY && !mpInitialized) {
    mpInitialized = true;
    initMercadoPago(MP_PUBLIC_KEY, { locale: "es-AR" });
  }
}

interface Props {
  cotizacion: CotizacionSeleccion;
  total: number;
  anticipo: number;
  modo: "combo" | "personalizar";
  selectedCombo: Combo | null;
  hasConflict: boolean;
  selectedProducts: { id: string; cantidad: number; precio: number; subtotal: number; nombre: string }[];
  fechaEntrega: string;
  horarioEntrega: string;
  onBack: () => void;
  onQuitarCombo: () => void;
}

export default function SalesSummary({
  cotizacion,
  total,
  anticipo,
  modo,
  selectedCombo,
  hasConflict,
  selectedProducts,
  fechaEntrega,
  horarioEntrega,
  onBack,
  onQuitarCombo,
}: Props) {
  const { showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [creatingPref, setCreatingPref] = useState(false);
  const [mpError, setMpError] = useState(false);
  const [rateLimit, setRateLimit] = useState<number[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem("legado_rate_limit") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => { ensureMercadoPago(); }, []);

  const handleCotizarClick = useCallback(() => {
    if (selectedProducts.length === 0) {
      showToast("Por favor selecciona al menos un producto con cantidad válida", "warning");
      return;
    }
    const now = Date.now();
    const recent = rateLimit.filter((t) => now - t < 3600000);
    if (recent.length >= 5) {
      showToast("Demasiadas solicitudes. Esperá unos minutos antes de intentar nuevamente.", "warning");
      return;
    }
    recent.push(now);
    setRateLimit(recent);
    localStorage.setItem("legado_rate_limit", JSON.stringify(recent));
    setModalOpen(true);
  }, [selectedProducts, rateLimit, showToast]);

  const handleMpPayment = useCallback(async () => {
    if (!MP_PUBLIC_KEY) {
      showToast("Mercado Pago no está configurado. Usá WhatsApp.", "warning");
      return;
    }
    setCreatingPref(true);
    setMpError(false);
    try {
      const res = await fetch("/api/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: modo === "combo" && selectedCombo ? selectedCombo.nombre : "Catering Personalizado",
          quantity: 1,
          price: anticipo,
        }),
      });
      if (!res.ok) throw new Error("Error al crear preferencia");
      const data = await res.json();
      setPreferenceId(data.id);
    } catch {
      setMpError(true);
      showToast("Error al conectar con Mercado Pago. Intentá con WhatsApp.", "error");
    } finally {
      setCreatingPref(false);
    }
  }, [anticipo, modo, selectedCombo, showToast]);

  const hasProducts = selectedProducts.length > 0;

  return (
    <>
      <div className="bg-white rounded-2xl p-6 shadow-xl border border-brand-copper/10 max-w-lg mx-auto">
        {modo === "combo" && selectedCombo && (
          <div className="mb-4 p-3 bg-brand-copper/5 rounded-xl border border-brand-copper/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Combo seleccionado
              </span>
              <button
                type="button"
                onClick={onQuitarCombo}
                className="text-[10px] text-red-500 hover:text-red-700 underline cursor-pointer"
              >
                Quitar combo
              </button>
            </div>
            <p className="font-serif text-lg text-dark-elegant mt-1">
              {selectedCombo.nombre}
            </p>
            <p className="text-xs text-slate-500">
              {selectedCombo.personas_min}–{selectedCombo.personas_max} personas
            </p>
          </div>
        )}

        <h3 className="font-serif text-2xl text-dark-elegant mb-4 text-center border-b border-brand-copper/10 pb-4 flex items-center justify-center gap-2">
          <ShoppingCart className="w-5 h-5 text-brand-copper" strokeWidth={1.5} />
          Tu Cotización
        </h3>

        <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-2">
          {!hasProducts ? (
            <p className="text-slate-600 text-sm text-center py-4">
              {modo === "combo"
                ? "Seleccioná un combo para ver los productos incluidos"
                : "Selecciona los productos arriba para agregarlos a tu cuenta"}
            </p>
          ) : (
            selectedProducts.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 py-2 border-b border-brand-copper/5"
              >
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-dark-elegant block truncate">
                    {p.nombre}
                  </span>
                  <span className="text-xs text-slate-600">
                    {p.cantidad} u. x {formatARS(p.precio)}
                  </span>
                </div>
                <span className="text-sm text-brand-copper font-medium flex-shrink-0">
                  {formatARS(p.subtotal)}
                </span>
              </div>
            ))
          )}
        </div>

        {hasConflict && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4 text-center font-medium">
            No se pueden mezclar productos de Experiencia Clásica con Premium
          </div>
        )}

        <div className="border-t-2 border-brand-copper/20 pt-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-slate-700 font-medium">Total del Presupuesto</span>
            <span className="font-serif text-3xl text-brand-copper font-bold">
              {formatARS(total)}
            </span>
          </div>

          {hasProducts && (
            <>
              <div className="h-px bg-gradient-to-r from-transparent via-brand-copper/20 to-transparent" />
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-amber-800 font-semibold">
                    Anticipo (50%)
                  </span>
                  <span className="font-serif text-xl text-amber-700 font-bold">
                    {formatARS(anticipo)}
                  </span>
                </div>
                <p className="text-[10px] text-amber-600 leading-relaxed">
                  Monto a pagar para confirmar reserva. El saldo restante se
                  coordina previo al evento.
                </p>
              </div>

              {MP_PUBLIC_KEY && !mpError && (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={handleMpPayment}
                    disabled={creatingPref || hasConflict}
                    className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-[#009EE3] text-white text-sm font-semibold rounded-full shadow-lg hover:shadow-[#009EE3]/40 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CreditCard className="w-4 h-4" />
                    {creatingPref ? "Conectando con Mercado Pago..." : `Pagar ${formatARS(anticipo)} con Mercado Pago`}
                  </button>

                  {preferenceId && (
                    <div className="mt-2">
                      <Wallet
                        initialization={{ preferenceId }}
                      />
                    </div>
                  )}
                </div>
              )}

              {mpError && (
                <p className="text-xs text-red-500 text-center">
                  Error con Mercado Pago. Usá WhatsApp para cotizar.
                </p>
              )}
            </>
          )}

          <button
            type="button"
            onClick={handleCotizarClick}
            disabled={hasConflict || !hasProducts}
            className={`flex items-center justify-center gap-2 w-full px-6 py-3 bg-green-600 text-white text-sm font-semibold rounded-full shadow-lg hover:shadow-green-600/40 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer ${
              hasConflict || !hasProducts
                ? "opacity-50 pointer-events-none"
                : ""
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            {hasProducts
              ? `Reservar fecha con ${formatARS(anticipo)}`
              : "Cotizar por WhatsApp"}
          </button>

          <p className="text-center text-[9px] text-slate-500 mt-3 uppercase tracking-widest">
            Valores referenciales. El precio final se confirmará por WhatsApp.
          </p>

          <div className="mt-6">
            <DeliveryPolicy
              fechaEntrega={fechaEntrega}
              horarioEntrega={horarioEntrega}
            />
          </div>
        </div>
      </div>

      <CotizacionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        cotizacion={cotizacion}
        total={total}
        anticipo={anticipo}
        fechaEntrega={fechaEntrega}
        horarioEntrega={horarioEntrega}
        modo={modo}
        selectedCombo={selectedCombo}
      />
    </>
  );
}
