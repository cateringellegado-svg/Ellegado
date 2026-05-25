"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Cotizacion {
  id: string;
  created_at: string;
  cliente_nombre: string | null;
  tipo_evento: string | null;
  num_invitados: number | null;
  presupuesto: number | null;
  estado: string;
}

function formatARS(value: number | null | undefined): string {
  if (value == null) return "$0";
  return "$" + value.toLocaleString("es-AR");
}

function formatDate(dateString: string): string {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("es-AR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getEstadoClass(estado: string): string {
  const map: Record<string, string> = {
    nueva: "bg-blue-100 text-blue-700",
    contactada: "bg-amber-100 text-amber-700",
    confirmada: "bg-green-100 text-green-700",
    completada: "bg-slate-100 text-slate-700",
  };
  return map[estado] || "bg-slate-100 text-slate-700";
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    cotizaciones: 0,
    eventos: 0,
    clientes: 0,
    ingresos: 0,
  });
  const [recent, setRecent] = useState<Cotizacion[]>([]);

  useEffect(() => {
    async function load() {
      if (!supabase) return;
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const [{ data: monthCotiz }, { data: eventos }, { data: clientes }, { data: recentCots }] =
        await Promise.all([
          supabase.from("cotizaciones").select("presupuesto").gte("created_at", startOfMonth),
          supabase.from("eventos").select("id").eq("estado", "confirmado"),
          supabase.from("clientes").select("id", { count: "exact", head: true }),
          supabase.from("cotizaciones").select("*").order("created_at", { ascending: false }).limit(5),
        ]);

      setStats({
        cotizaciones: (monthCotiz || []).length,
        eventos: (eventos || []).length,
        clientes: clientes?.length ?? 0,
        ingresos: (monthCotiz || []).reduce((s, c) => s + (c.presupuesto || 0), 0),
      });
      setRecent(recentCots || []);
    }
    load();
  }, []);

  return (
    <>
      <h1 className="font-serif text-4xl text-dark-elegant mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Cotizaciones", value: stats.cotizaciones, sub: "Este mes", color: "bg-brand-copper/10", iconColor: "text-brand-copper", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /> },
          { label: "Eventos", value: stats.eventos, sub: "Confirmados", color: "bg-emerald-100", iconColor: "text-emerald-600", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /> },
          { label: "Clientes", value: stats.clientes, sub: "Registrados", color: "bg-blue-100", iconColor: "text-blue-600", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /> },
          { label: "Ingresos Est.", value: formatARS(stats.ingresos), sub: "Este mes", color: "bg-amber-100", iconColor: "text-amber-600", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-2xl p-6 shadow-lg border border-brand-copper/10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">{card.label}</span>
              <div className={`w-10 h-10 ${card.color} rounded-full flex items-center justify-center`}>
                <svg className={`w-5 h-5 ${card.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">{card.icon}</svg>
              </div>
            </div>
            <p className="text-3xl font-serif text-dark-elegant">{card.value}</p>
            <p className="text-xs text-slate-500 mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg border border-brand-copper/10">
        <h2 className="font-serif text-2xl text-dark-elegant mb-6">Cotizaciones Recientes</h2>
        <div className="space-y-4">
          {recent.length > 0 ? (
            recent.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-4 bg-cream rounded-lg">
                <div>
                  <p className="font-medium text-dark-elegant">{c.cliente_nombre || "Cliente sin nombre"}</p>
                  <p className="text-sm text-slate-600">{c.tipo_evento} - {c.num_invitados} invitados</p>
                </div>
                <div className="text-right">
                  <p className="font-serif text-brand-copper">{formatARS(c.presupuesto)}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${getEstadoClass(c.estado)}`}>{c.estado}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate-400 text-center py-4">No hay cotizaciones aún</p>
          )}
        </div>
      </div>
    </>
  );
}
