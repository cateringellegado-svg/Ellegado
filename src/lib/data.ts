import type { ElementType } from "react";
import { Presentation, Users, ChefHat } from "lucide-react";

export type EventType = "social" | "corporativo" | "familiar";

export interface EventTypeConfig {
  key: EventType;
  label: string;
  icon: ElementType;
  desc: string;
  msg: string;
}

export const EVENT_TYPES: EventTypeConfig[] = [
  { key: "social", label: "Social", icon: ChefHat, desc: "Cumpleaños, aniversarios, reuniones", msg: "¡Perfecto para celebrar! Tenemos combos ideales para eventos sociales." },
  { key: "corporativo", label: "Corporativo", icon: Presentation, desc: "Eventos de empresa, lanzamientos", msg: "Impecable para tu evento corporativo. Prepará algo profesional y elegante." },
  { key: "familiar", label: "Familiar", icon: Users, desc: "Reuniones familiares, celebraciones íntimas", msg: "Qué lindo compartir en familia. Tenemos opciones que encantan a todas las edades." },
];

export const EVENT_EMOJIS: Record<EventType, string> = {
  social: "🎉",
  corporativo: "💼",
  familiar: "👨‍👩‍👧‍👦",
};

export const TIME_SLOTS = [
  "09:00", "10:00", "11:00", "12:00", "13:00",
  "14:00", "15:00", "16:00", "17:00", "18:00",
  "19:00", "20:00", "21:00", "22:00",
];

export const WEEKDAYS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

export function getDayName(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return WEEKDAYS[d.getDay()];
}

export const SHABAT_NOTE = "Para eventos el sábado, entregamos el viernes hasta las 20:00 hrs para asegurar la frescura artesanal";
export const VIERNES_NOTE = "Los viernes coordinamos la entrega hasta las 20:00 hrs para respetar el inicio del Shabat";
export const DOMINGO_NOTE = "Los domingos la entrega es a partir de las 13:00 hrs";
