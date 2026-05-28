"use client";

import { useMemo } from "react";
import type { Combo } from "@/types";
import { COMBO_MINIMUMS } from "@/lib/constants";
import { Package, Star } from "lucide-react";

function formatARS(value: number): string {
  return "$" + value.toLocaleString("es-AR");
}

interface Props {
  combos: Combo[];
  wizardGuestCount: number;
  factorAjuste: number;
  onSelect: (combo: Combo) => void;
  onBack: () => void;
  onPersonalizar: () => void;
}

export default function ComboSelector({
  combos,
  wizardGuestCount,
  factorAjuste,
  onSelect,
  onBack,
  onPersonalizar,
}: Props) {
  const recommendedId = useMemo(
    () => (wizardGuestCount > 0 && combos.length > 0 ? combos[0].id : null),
    [wizardGuestCount, combos]
  );

  return (
    <div className="mb-16">
      <div className="flex items-center justify-center gap-4 mb-10">
        <button
          type="button"
          onClick={onBack}
          className="text-xs text-slate-500 hover:text-brand-copper underline cursor-pointer"
        >
          ← Volver
        </button>
        <span className="text-slate-300">|</span>
        <button
          type="button"
          onClick={onPersonalizar}
          className="text-xs text-slate-500 hover:text-amber-600 underline cursor-pointer"
        >
          Personalizar menú →
        </button>
      </div>

      <div className="text-center mb-10">
        <h3 className="font-serif text-3xl text-dark-elegant mb-3">
          {wizardGuestCount > 0
            ? "Combos recomendados para vos"
            : "Elegí tu Combo"}
        </h3>
        <p className="text-slate-500 text-sm">
          {wizardGuestCount > 0
            ? `Según tu evento de ${wizardGuestCount} invitados`
            : "Combos diseñados para cada tipo de evento. Precio fijo sin sorpresas."}
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {combos.map((combo) => {
          const isRecommended = combo.id === recommendedId;
          return (
            <button
              key={combo.id}
              type="button"
              onClick={() => onSelect(combo)}
              className={`group bg-white rounded-2xl p-6 shadow-lg border transition-all text-left cursor-pointer flex flex-col relative ${
                isRecommended
                  ? "border-amber-400 ring-2 ring-amber-200 hover:shadow-xl hover:-translate-y-1"
                  : "border-brand-copper/10 hover:shadow-xl hover:-translate-y-1"
              }`}
            >
              {isRecommended && (
                <span className="absolute -top-3 -right-3 bg-amber-400 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1 z-10">
                  <Star className="w-3 h-3" fill="currentColor" />
                  Recomendado
                </span>
              )}
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:bg-brand-copper/20 transition-colors ${
                  isRecommended ? "bg-amber-100" : "bg-brand-copper/10"
                }`}
              >
                <Package
                  className={`w-6 h-6 ${
                    isRecommended ? "text-amber-600" : "text-brand-copper"
                  }`}
                  strokeWidth={1.5}
                />
              </div>
              <h4 className="font-serif text-xl text-dark-elegant mb-2">
                {combo.nombre}
              </h4>
              <p className="text-xs text-slate-500 mb-4 flex-grow leading-relaxed">
                {combo.descripcion}
              </p>
              <div className="space-y-2 mb-4">
                {combo.items_json.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-slate-600">{item.nombre}</span>
                    <span className="text-slate-400">
                      {item.cantidad} u.
                    </span>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-brand-copper/5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-500">
                    {COMBO_MINIMUMS[combo.id] ?? combo.personas_min}–{combo.personas_max} pers.
                  </span>
                  <span className="font-serif text-lg text-brand-copper font-bold">
                    {formatARS(Math.round(combo.precio * factorAjuste))}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
