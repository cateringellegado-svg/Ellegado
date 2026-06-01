"use client";

import { useState, useCallback } from "react";
import type { CotizacionSeleccion, Combo } from "@/types";
import CotizacionModal from "./CotizacionModal";
import { useToast } from "./Toast";
import { ShoppingCart, MessageCircle } from "lucide-react";
import DeliveryPolicy from "./DeliveryPolicy";
import { formatARS } from "@/lib/formatters";

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
  entorno: string;
  onBack: () => void;
  onQuitarCombo: () => void;
  onRemoveItem: (productId: string) => void;
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
  entorno,
  onBack,
  onQuitarCombo,
  onRemoveItem,
}: Props) {
  const { showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [rateLimit, setRateLimit] = useState<number[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem("legado_rate_limit") || "[]");
    } catch {
      return [];
    }
  });

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
                className="flex items-center gap-3 py-2 border-b border-brand-copper/5 group"
              >
                <button
                  type="button"
                  onClick={() => onRemoveItem(p.id)}
                  className="flex-shrink-0 w-6 h-6 rounded-full bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                  aria-label={`Eliminar ${p.nombre}`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
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
        entorno={entorno}
      />
    </>
  );
}
