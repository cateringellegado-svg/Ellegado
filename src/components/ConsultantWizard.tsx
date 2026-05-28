"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import { insertLead } from "@/lib/supabase";
import { Package, Sparkles, ArrowLeft, Calendar, Clock } from "lucide-react";
import { useToast } from "./Toast";
import { EVENT_TYPES, EVENT_EMOJIS, TIME_SLOTS, SHABAT_NOTE, VIERNES_NOTE, DOMINGO_NOTE, getDayName } from "@/lib/data";
import type { EventType } from "@/lib/data";

export type WizardMode = "combo" | "personalizar";

export interface WizardResult {
  eventType: EventType;
  guestCount: number;
  mode: WizardMode;
  fechaEntrega: string;
  horarioEntrega: string;
}

interface Props {
  onComplete: (result: WizardResult) => void;
  onSkip: () => void;
}

const MAX_ADELANTO_DIAS = 45;

function getMinDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  return d.toISOString().slice(0, 10);
}

function getMaxDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + MAX_ADELANTO_DIAS);
  return d.toISOString().slice(0, 10);
}

function getRecommendedCombo(guestCount: number): string {
  if (guestCount <= 17) return "Combo Esencia";
  if (guestCount <= 27) return "Combo Celebración";
  if (guestCount <= 37) return "Combo Ejecutivo";
  if (guestCount <= 47) return "Combo Magno";
  return "Combo Gran Fiesta";
}

export default function ConsultantWizard({ onComplete, onSkip }: Props) {
  const [step, setStep] = useState(1);
  const [eventType, setEventType] = useState<EventType | null>(null);
  const [guestCount, setGuestCount] = useState("");
  const [fechaEntrega, setFechaEntrega] = useState("");
  const [horarioEntrega, setHorarioEntrega] = useState("");
  const leadCaptured = useRef(false);
  const { showToast } = useToast();

  const minDate = useMemo(() => getMinDate(), []);
  const maxDate = useMemo(() => getMaxDate(), []);

  const captureLead = useCallback(async (tipo: EventType, invitados: number | null) => {
    if (leadCaptured.current) return;
    leadCaptured.current = true;
    await insertLead(tipo, invitados);
  }, []);

  const handleEventType = useCallback(
    (type: EventType) => {
      setEventType(type);
      captureLead(type, null);
      setStep(2);
    },
    [captureLead]
  );

  const handleGuestNext = useCallback(() => {
    const count = parseInt(guestCount);
    if (!count || count < 1) return;
    setStep(3);
  }, [guestCount]);

  const handleDateNext = useCallback(() => {
    if (!fechaEntrega) return;
    setStep(4);
  }, [fechaEntrega]);

  const handleModeSelect = useCallback(
    (mode: WizardMode) => {
      if (!eventType || !fechaEntrega) return;
      const count = parseInt(guestCount) || 0;
      onComplete({
        eventType,
        guestCount: count,
        mode,
        fechaEntrega,
        horarioEntrega,
      });
    },
    [eventType, guestCount, fechaEntrega, horarioEntrega, onComplete]
  );

  const handleSkip = useCallback(() => {
    if (eventType) {
      const count = parseInt(guestCount) || null;
      captureLead(eventType, count);
    }
    onSkip();
  }, [eventType, guestCount, captureLead, onSkip]);

  const eventMsg = eventType ? EVENT_TYPES.find((t) => t.key === eventType)?.msg : "";
  const emoji = eventType ? EVENT_EMOJIS[eventType] : "";
  const count = parseInt(guestCount) || 0;
  const recommendedCombo = count > 0 ? getRecommendedCombo(count) : null;
  const quantityError = count > 0 && count < 10 ? "Mínimo 10 invitados para continuar" : "";
  const quantityWarning = "";

  const dayName = fechaEntrega ? getDayName(fechaEntrega) : "";
  const isDomingo = dayName === "domingo";
  const isSabado = dayName === "sábado";
  const isViernes = dayName === "viernes";

  const availableTimes = useMemo(() => {
    let slots = TIME_SLOTS;
    if (isDomingo) slots = slots.filter((t) => t >= "13:00");
    if (isViernes) slots = slots.filter((t) => t <= "20:00");
    return slots;
  }, [isDomingo, isViernes]);

  const stepperCount = 4;

  return (
    <div className="max-w-2xl mx-auto mb-24">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-2">
          {Array.from({ length: stepperCount }, (_, i) => i + 1).map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                  s === step
                    ? "bg-brand-copper text-white shadow-lg shadow-brand-copper/30 scale-110"
                    : s < step
                      ? "bg-brand-copper/20 text-brand-copper"
                      : "bg-slate-100 text-slate-400"
                }`}
              >
                {s}
              </div>
              {s < stepperCount && (
                <div
                  className={`w-8 h-0.5 mx-1 transition-colors duration-500 ${
                    s < step ? "bg-brand-copper/60" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={handleSkip}
          className="text-xs text-slate-400 hover:text-brand-copper underline transition-colors cursor-pointer"
        >
          Ver catálogo completo →
        </button>
      </div>

      {step === 1 && (
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="text-center mb-10">
            <span className="text-brand-copper font-medium tracking-[0.4em] uppercase text-xs mb-4 block">
              Paso 1 de {stepperCount}
            </span>
            <h2 className="font-serif text-4xl md:text-5xl text-dark-elegant mb-4">
              ¿Qué tipo de evento planeamos?
            </h2>
            <p className="text-slate-500 font-light italic text-lg">
              Ayudanos a recomendar la mejor opción para tu ocasión
            </p>
          </div>
          <div className="grid gap-4">
            {EVENT_TYPES.map(({ key, label, icon: Icon, desc }) => (
              <button
                key={key}
                type="button"
                onClick={() => handleEventType(key)}
                className={`group flex items-center gap-5 bg-white rounded-2xl p-6 shadow-md border transition-all text-left cursor-pointer hover:shadow-xl hover:-translate-y-0.5 ${
                  eventType === key
                    ? "border-brand-copper ring-2 ring-brand-copper/20"
                    : "border-brand-copper/10"
                }`}
              >
                <div className="w-14 h-14 bg-brand-copper/10 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-brand-copper/20 transition-colors">
                  <Icon className="w-7 h-7 text-brand-copper" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-serif text-xl text-dark-elegant mb-1">
                    {label}
                  </h3>
                  <p className="text-xs text-slate-500">{desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
          {eventMsg && (
            <div className="bg-brand-copper/5 border border-brand-copper/10 rounded-2xl p-4 mb-8 text-center">
              <p className="text-sm text-dark-elegant font-medium">
                {emoji} {eventMsg}
              </p>
            </div>
          )}
          <div className="text-center mb-10">
            <span className="text-brand-copper font-medium tracking-[0.4em] uppercase text-xs mb-4 block">
              Paso 2 de {stepperCount}
            </span>
            <h2 className="font-serif text-4xl md:text-5xl text-dark-elegant mb-4">
              ¿Cuántos invitados esperas?
            </h2>
            <p className="text-slate-500 font-light italic text-lg">
              Así podemos recomendarte los combos o cantidades ideales
            </p>
          </div>
          <div className="max-w-xs mx-auto">
            <input
              type="number"
              inputMode="numeric"
              min={1}
              placeholder="Ej: 50"
              value={guestCount}
              onChange={(e) => setGuestCount(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleGuestNext();
              }}
              className="w-full text-center text-4xl font-serif text-dark-elegant bg-cream border-2 border-brand-copper/20 rounded-2xl px-6 py-5 focus:outline-none focus:border-brand-copper transition-colors"
              autoFocus
            />
            <p className="text-xs text-slate-400 text-center mt-3">
              Ingresá el número aproximado de invitados
            </p>
            {quantityError && (
              <p className="text-xs text-red-500 text-center mt-2 font-medium">
                ⚠️ {quantityError}
              </p>
            )}
            {quantityWarning && !quantityError && (
              <p className="text-xs text-amber-600 text-center mt-2 font-medium">
                ⚠️ {quantityWarning}
              </p>
            )}
          </div>
          <div className="flex justify-center mt-8">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center gap-2 text-xs text-slate-500 hover:text-brand-copper transition-colors mr-4 cursor-pointer"
            >
              <ArrowLeft className="w-3 h-3" />
              Volver
            </button>
            <button
              type="button"
              onClick={handleGuestNext}
              disabled={!guestCount || count < 10}
              className="px-8 py-3 bg-brand-copper text-white text-sm font-semibold rounded-full shadow-lg hover:shadow-brand-copper/30 transition-all disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
          {recommendedCombo && (
            <div className="bg-gradient-to-r from-amber-50 to-brand-copper/5 border border-amber-200 rounded-2xl p-5 mb-8 text-center">
              <p className="text-sm text-dark-elegant font-medium leading-relaxed">
                {emoji} Excelente, para un evento de <strong>{count} personas</strong>, el{" "}
                <strong className="text-brand-copper">{recommendedCombo}</strong> es nuestra recomendación estrella
              </p>
            </div>
          )}
          <div className="text-center mb-10">
            <span className="text-brand-copper font-medium tracking-[0.4em] uppercase text-xs mb-4 block">
              Paso 3 de {stepperCount}
            </span>
            <h2 className="font-serif text-4xl md:text-5xl text-dark-elegant mb-4">
              ¿Cuándo necesitás la entrega?
            </h2>
            <p className="text-slate-500 font-light italic text-lg">
              Seleccioná la fecha y horario estimado para tu evento
            </p>
          </div>

          <div className="max-w-sm mx-auto space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand-copper" strokeWidth={1.5} />
                Fecha del evento
              </label>
              <input
                type="date"
                value={fechaEntrega}
                min={minDate}
                max={maxDate}
                onChange={(e) => {
                  const val = e.target.value;
                  const d = new Date(val + "T12:00:00");
                  if (d.getDay() === 6) {
                    showToast("Los sábados nuestra cocina está cerrada. Te entregamos el viernes ideal para tu evento del fin de semana", "warning");
                    setFechaEntrega("");
                    setHorarioEntrega("");
                  } else {
                    setFechaEntrega(val);
                    setHorarioEntrega("");
                  }
                }}
                className="w-full text-center text-lg font-serif text-dark-elegant bg-cream border-2 border-brand-copper/20 rounded-2xl px-6 py-4 focus:outline-none focus:border-brand-copper transition-colors"
                autoFocus
                data-testid="fecha-input"
              />
              {dayName && (
                <p className="text-xs text-slate-400 text-center mt-2 capitalize">
                  {dayName} {fechaEntrega}
                </p>
              )}
            </div>

            {isSabado && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                <p className="text-xs text-amber-700 leading-relaxed">
                  🕯️ {SHABAT_NOTE}
                </p>
              </div>
            )}
            {isViernes && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                <p className="text-xs text-amber-700 leading-relaxed">
                  🕯️ {VIERNES_NOTE}
                </p>
              </div>
            )}

            {fechaEntrega && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-copper" strokeWidth={1.5} />
                  Horario estimado
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {availableTimes.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setHorarioEntrega(time)}
                      className={`py-2 px-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                        horarioEntrega === time
                          ? "bg-brand-copper text-white border-brand-copper"
                          : "bg-white text-slate-600 border-brand-copper/20 hover:border-brand-copper"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
                {isDomingo && (
                  <p className="text-[10px] text-amber-600 text-center mt-2">
                    {DOMINGO_NOTE}
                  </p>
                )}
                {isViernes && (
                  <p className="text-[10px] text-amber-600 text-center mt-2">
                    Los viernes coordinamos hasta las 20:00 hrs
                  </p>
                )}
                {availableTimes.length === 0 && (
                  <p className="text-xs text-red-500 text-center mt-2">
                    No hay horarios disponibles para esta fecha
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-center mt-8">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="flex items-center gap-2 text-xs text-slate-500 hover:text-brand-copper transition-colors mr-4 cursor-pointer"
            >
              <ArrowLeft className="w-3 h-3" />
              Volver a invitados
            </button>
            <button
              type="button"
              onClick={handleDateNext}
              disabled={!fechaEntrega || !horarioEntrega}
              className="px-8 py-3 bg-brand-copper text-white text-sm font-semibold rounded-full shadow-lg hover:shadow-brand-copper/30 transition-all disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
          {recommendedCombo && (
            <div className="bg-gradient-to-r from-amber-50 to-brand-copper/5 border border-amber-200 rounded-2xl p-5 mb-8 text-center">
              <p className="text-sm text-dark-elegant font-medium leading-relaxed">
                {emoji} Excelente, para un evento de <strong>{count} personas</strong>, el{" "}
                <strong className="text-brand-copper">{recommendedCombo}</strong> es nuestra recomendación estrella
              </p>
            </div>
          )}
          <div className="text-center mb-10">
            <span className="text-brand-copper font-medium tracking-[0.4em] uppercase text-xs mb-4 block">
              Paso 4 de {stepperCount} — Último paso
            </span>
            <h2 className="font-serif text-4xl md:text-5xl text-dark-elegant mb-4">
              ¿Cómo preferís armar tu menú?
            </h2>
            <p className="text-slate-500 font-light italic text-lg">
              Tenemos dos caminos para llegar al catering perfecto
            </p>
          </div>

          <div className="bg-brand-copper/5 border border-brand-copper/10 rounded-2xl p-4 mb-8 text-center">
            <p className="text-xs text-slate-600">
              Entrega estimada: <strong>{dayName} {fechaEntrega}</strong> a las <strong>{horarioEntrega}</strong> hrs
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <button
              type="button"
              onClick={() => handleModeSelect("combo")}
              className="group bg-white rounded-3xl p-8 shadow-lg border border-brand-copper/10 hover:shadow-xl hover:-translate-y-1 transition-all text-left cursor-pointer"
            >
              <div className="w-16 h-16 bg-brand-copper/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand-copper/20 transition-colors">
                <Package className="w-8 h-8 text-brand-copper" strokeWidth={1.5} />
              </div>
              <h3 className="font-serif text-2xl text-dark-elegant mb-3">
                Solución en Combos
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-4">
                Combos pre-diseñados que se ajustan a tu cantidad de invitados.
                Precio fijo, sin complicaciones.
              </p>
              <span className="text-brand-copper text-sm font-semibold group-hover:underline">
                Ver combos recomendados →
              </span>
            </button>
            <button
              type="button"
              onClick={() => handleModeSelect("personalizar")}
              className="group bg-white rounded-3xl p-8 shadow-lg border border-brand-copper/10 hover:shadow-xl hover:-translate-y-1 transition-all text-left cursor-pointer"
            >
              <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-amber-100 transition-colors">
                <Sparkles className="w-8 h-8 text-amber-600" strokeWidth={1.5} />
              </div>
              <h3 className="font-serif text-2xl text-dark-elegant mb-3">
                Experiencia a Medida
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-4">
                Armá tu menú producto por producto. Control total sobre cada
                elección y cantidad.
              </p>
              <span className="text-amber-600 text-sm font-semibold group-hover:underline">
                Personalizar menú →
              </span>
            </button>
          </div>
          <div className="flex justify-center mt-6">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="flex items-center gap-2 text-xs text-slate-500 hover:text-brand-copper transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3 h-3" />
              Volver a fecha y horario
            </button>
          </div>
        </div>
      )}

      <div className="text-center mt-8">
        <button
          type="button"
          onClick={handleSkip}
          className="text-xs text-slate-400 hover:text-brand-copper underline transition-colors cursor-pointer"
        >
          Ver catálogo completo sin asistencia
        </button>
      </div>
    </div>
  );
}
