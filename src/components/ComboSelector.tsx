"use client";

import { useMemo } from "react";
import type { Combo } from "@/types";
import { COMBO_MINIMUMS } from "@/lib/constants";
import { Package, Star } from "lucide-react";
import { formatARS } from "@/lib/formatters";

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
  const { recommendedId, gapMessage } = useMemo(() => {
    if (wizardGuestCount <= 0 || combos.length === 0) {
      return { recommendedId: null, gapMessage: null };
    }
    const inRange = combos.some(
      (c) => wizardGuestCount >= c.personas_min && wizardGuestCount <= c.personas_max
    );
    if (inRange) {
      const match = combos.find(
        (c) => wizardGuestCount >= c.personas_min && wizardGuestCount <= c.personas_max
      );
      return { recommendedId: match?.id ?? null, gapMessage: null };
    }
    const next = combos
      .filter((c) => c.personas_min > wizardGuestCount)
      .sort((a, b) => a.personas_min - b.personas_min)[0];
    return {
      recommendedId: next?.id ?? null,
      gapMessage: next
        ? `¡Excelente evento de ${wizardGuestCount} invitados! Te recomendamos nuestro ${next.nombre} para que tus invitados disfruten con mayor comodidad.`
        : null,
    };
  }, [wizardGuestCount, combos]);

  return (
    <div className="mb-16">
      {gapMessage && (
        <div className="bg-gradient-to-r from-amber-50 to-brand-copper/5 border border-amber-200 rounded-2xl p-4 mb-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          <p className="text-sm text-dark-elegant font-medium leading-relaxed">
            {gapMessage}
          </p>
        </div>
      )}

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

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        {combos.map((combo) => {
          const isRecommended = combo.id === recommendedId;
          return (
            <button
              key={combo.id}
              type="button"
              onClick={() => onSelect(combo)}
              className={`group rounded-2xl p-6 shadow-lg border transition-all text-left cursor-pointer flex flex-col relative ${
                isRecommended
                  ? "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-400 ring-2 ring-amber-300 shadow-xl shadow-amber-200/50 scale-[1.05] z-10 hover:shadow-2xl hover:shadow-amber-300/50"
                  : "bg-white border-brand-copper/10 saturate-[0.7] opacity-80 hover:saturate-100 hover:opacity-100 hover:shadow-xl hover:-translate-y-1"
              }`}
            >
              {isRecommended && (
                <span className="absolute -top-3.5 -right-3.5 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-[11px] font-bold px-3.5 py-1.5 rounded-full shadow-xl shadow-amber-300/50 flex items-center gap-1.5 z-20 animate-pulse">
                  <Star className="w-3.5 h-3.5" fill="currentColor" />
                  Recomendado
                </span>
              )}
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${
                  isRecommended ? "bg-amber-200/70" : "bg-brand-copper/10"
                }`}
              >
                <Package
                  className={`w-6 h-6 ${
                    isRecommended ? "text-amber-700" : "text-brand-copper"
                  }`}
                  strokeWidth={1.5}
                />
              </div>
              <h4 className="font-serif text-xl text-dark-elegant mb-1">
                {combo.nombre}
              </h4>
              {isRecommended && (
                <p className="text-[10px] text-amber-700 font-medium mb-2 flex items-center gap-1">
                  <Star className="w-3 h-3" fill="currentColor" />
                  La opción más elegida por nuestros clientes
                </p>
              )}
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
                  <span className={`font-serif text-lg font-bold ${
                    isRecommended ? "text-amber-700" : "text-brand-copper"
                  }`}>
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
