"use client";

import { Clock, Calendar, ShieldCheck } from "lucide-react";
import { getDayName } from "@/lib/data";

interface Props {
  fechaEntrega: string;
  horarioEntrega: string;
}

export default function DeliveryPolicy({ fechaEntrega, horarioEntrega }: Props) {
  const dayName = getDayName(fechaEntrega);
  const isDomingo = dayName === "domingo";
  const isSabado = dayName === "sábado";

  return (
    <div className="bg-gradient-to-br from-brand-copper/5 to-amber-50/50 rounded-xl border border-brand-copper/10 p-5 space-y-3">
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-brand-copper" strokeWidth={1.5} />
        <span className="text-xs font-semibold text-dark-elegant uppercase tracking-wider">
          Política de Entrega — El Legado
        </span>
      </div>

      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Calendar className="w-4 h-4 text-brand-copper/60" strokeWidth={1.5} />
        <span>
          Tu entrega estimada: <strong className="text-dark-elegant capitalize">{dayName} {fechaEntrega}</strong> a las <strong className="text-dark-elegant">{horarioEntrega} hrs</strong>
        </span>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-brand-copper/20 to-transparent" />

      <div className="flex items-start gap-2 text-xs text-slate-500 leading-relaxed">
        <Clock className="w-3.5 h-3.5 text-brand-copper/60 mt-0.5 shrink-0" strokeWidth={1.5} />
        <p>
          Trabajamos con anticipación mínima de <strong>2 días</strong> para garantizar la frescura artesanal
          de cada preparación. Todos nuestros productos se elaboran el día anterior al evento.
        </p>
      </div>

      {isSabado && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-[11px] text-amber-700 leading-relaxed">
            🕯️ Para eventos el sábado, entregamos el viernes hasta las 20:00 hrs
            para asegurar la frescura artesanal y respetar el descanso sabático de nuestro equipo.
          </p>
        </div>
      )}

      {isDomingo && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-[11px] text-amber-700 leading-relaxed">
            ☀️ Los domingos coordinamos la entrega a partir de las 13:00 hrs,
            para que puedas disfrutar de tu evento sin contratiempos.
          </p>
        </div>
      )}

      <p className="text-[10px] text-slate-400 italic">
        El horario definitivo se confirmará por WhatsApp al momento de concretar la reserva.
      </p>
    </div>
  );
}
