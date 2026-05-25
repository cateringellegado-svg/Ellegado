"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

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

const BarTooltip = ({ active, payload }: { active?: boolean; payload?: { value: number }[] }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl px-4 py-3 shadow-lg border border-slate-200 text-sm">
      <p className="text-brand-copper font-medium">{formatARS(payload[0].value)}</p>
    </div>
  );
};

function formatDate(dateString: string): string {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("es-AR", {
    year: "numeric", month: "short", day: "numeric",
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

const COLORS = ["#AF7A54", "#D9A78B", "#F0D6C4", "#8B6B4E", "#C49A7C"];

const ESTADO_COLORS: Record<string, string> = {
  nueva: "#3B82F6",
  contactada: "#F59E0B",
  confirmada: "#10B981",
  completada: "#64748B",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    cotizaciones: 0,
    eventos: 0,
    clientes: 0,
    ingresos: 0,
    cotizacionesPrev: 0,
    ingresosPrev: 0,
  });
  const [recent, setRecent] = useState<Cotizacion[]>([]);
  const [monthlyData, setMonthlyData] = useState<{ month: string; cotizaciones: number; ingresos: number }[]>([]);
  const [estadoData, setEstadoData] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    async function load() {
      if (!supabase) { if (mountedRef.current) setLoading(false); return; }
      try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const startPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
        const endPrevMonth = startOfMonth;

        const [
          { data: monthCotiz },
          { data: prevCotiz },
          { data: eventos },
          { data: clientes_count },
          { data: recentCots },
          { data: allCotiz },
          { data: estadoCount },
        ] = await Promise.all([
          supabase.from("cotizaciones").select("presupuesto").gte("created_at", startOfMonth),
          supabase.from("cotizaciones").select("presupuesto").gte("created_at", startPrevMonth).lt("created_at", endPrevMonth),
          supabase.from("eventos").select("id").eq("estado", "confirmado"),
          supabase.from("clientes").select("id", { count: "exact", head: true }),
          supabase.from("cotizaciones").select("*").order("created_at", { ascending: false }).limit(5),
          supabase.from("cotizaciones").select("created_at, presupuesto").gte("created_at", new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString()).order("created_at", { ascending: true }),
          supabase.from("cotizaciones").select("estado"),
        ]);

        setStats({
          cotizaciones: (monthCotiz || []).length,
          eventos: (eventos || []).length,
          clientes: clientes_count?.length ?? 0,
          ingresos: (monthCotiz || []).reduce((s, c) => s + (c.presupuesto || 0), 0),
          cotizacionesPrev: (prevCotiz || []).length,
          ingresosPrev: (prevCotiz || []).reduce((s, c) => s + (c.presupuesto || 0), 0),
        });
        setRecent(recentCots || []);

        const monthMap: Record<string, { cotizaciones: number; ingresos: number }> = {};
        (allCotiz || []).forEach((c: { created_at: string; presupuesto: number | null }) => {
          const m = new Date(c.created_at).toLocaleDateString("es-AR", { month: "short", year: "2-digit" });
          if (!monthMap[m]) monthMap[m] = { cotizaciones: 0, ingresos: 0 };
          monthMap[m].cotizaciones++;
          monthMap[m].ingresos += c.presupuesto || 0;
        });
        setMonthlyData(Object.entries(monthMap).map(([month, d]) => ({ month, ...d })));

        const estadoMap: Record<string, number> = {};
        (estadoCount || []).forEach((c: { estado: string }) => {
          estadoMap[c.estado] = (estadoMap[c.estado] || 0) + 1;
        });
        setEstadoData(Object.entries(estadoMap).map(([name, value]) => ({ name, value })));
      } catch (e) {
        console.error("Error loading dashboard data:", e);
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    }
    load();
    return () => { mountedRef.current = false; };
  }, []);

  const pctChange = (curr: number, prev: number) =>
    prev > 0 ? ((curr / prev - 1) * 100).toFixed(0) : "+100";

  const cards = [
    {
      label: "Cotizaciones",
      value: stats.cotizaciones,
      prev: stats.cotizacionesPrev,
      sub: "vs mes anterior",
      icon: "document",
      href: "/admin/cotizaciones",
      change: stats.cotizaciones - stats.cotizacionesPrev,
      changePct: pctChange(stats.cotizaciones, stats.cotizacionesPrev),
    },
    {
      label: "Eventos",
      value: stats.eventos,
      sub: "Confirmados",
      icon: "calendar",
      href: "/admin/eventos",
    },
    {
      label: "Clientes",
      value: stats.clientes,
      sub: "Registrados",
      icon: "users",
      href: "/admin/clientes",
    },
    {
      label: "Ingresos Est.",
      value: formatARS(stats.ingresos),
      prev: stats.ingresosPrev,
      sub: "vs mes anterior",
      icon: "money",
      href: "/admin/cotizaciones",
      change: stats.ingresos - stats.ingresosPrev,
      changePct: pctChange(stats.ingresos, stats.ingresosPrev),
    },
  ];

  if (loading) {
    return (
      <div className="animate-pulse bg-slate-200 rounded-2xl p-8 h-64" />
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-serif text-4xl text-dark-elegant">Dashboard</h1>
        <div className="flex gap-2">
          <Link href="/admin/cotizaciones" className="bg-white border border-brand-copper/20 text-dark-elegant px-4 py-2 rounded-lg text-sm hover:bg-cream transition-colors">
            Cotizaciones
          </Link>
          <Link href="/admin/cms" className="bg-brand-copper text-white px-4 py-2 rounded-lg text-sm hover:bg-brand-copper-light transition-colors">
            CMS
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card) => (
          <Link key={card.label} href={card.href} className="block bg-white rounded-2xl p-6 shadow-lg border border-brand-copper/10 hover:shadow-xl hover:-translate-y-1 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">{card.label}</span>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors group-hover:bg-brand-copper group-hover:text-white ${card.label === "Cotizaciones" ? "bg-brand-copper/10 text-brand-copper" : card.label === "Eventos" ? "bg-emerald-100 text-emerald-600" : card.label === "Clientes" ? "bg-blue-100 text-blue-600" : "bg-amber-100 text-amber-600"}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {card.label === "Cotizaciones" ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /> :
                   card.label === "Eventos" ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /> :
                   card.label === "Clientes" ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /> :
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />}
                </svg>
              </div>
            </div>
            <p className="text-3xl font-serif text-dark-elegant">{card.value}</p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs text-slate-500">{card.sub}</p>
              {card.change !== undefined && (
                <span className={`text-xs font-medium ${card.change >= 0 ? "text-green-600" : "text-red-500"}`}>
                  {card.changePct}%
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-brand-copper/10">
          <h2 className="font-serif text-xl text-dark-elegant mb-6">Tendencia de Cotizaciones</h2>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="cotizGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#AF7A54" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#AF7A54" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94A3B8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94A3B8" />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #E2E8F0", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }} />
                <Area type="monotone" dataKey="cotizaciones" stroke="#AF7A54" fill="url(#cotizGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <p className="text-slate-400 text-sm py-8 text-center">Sin datos suficientes aún</p>}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-brand-copper/10">
          <h2 className="font-serif text-xl text-dark-elegant mb-6">Distribución por Estado</h2>
          {estadoData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={estadoData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, percent }: { name?: string; percent?: number }) => `${name || ""} ${((percent || 0) * 100).toFixed(0)}%`}>
                  {estadoData.map((_, i) => (
                    <Cell key={i} fill={Object.values(ESTADO_COLORS)[i % Object.values(ESTADO_COLORS).length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-slate-400 text-sm py-8 text-center">Sin datos aún</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-brand-copper/10">
          <h2 className="font-serif text-xl text-dark-elegant mb-6">Ingresos por Mes</h2>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94A3B8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94A3B8" />
                <Tooltip content={<BarTooltip />} />
                <Bar dataKey="ingresos" fill="#AF7A54" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-slate-400 text-sm py-8 text-center">Sin datos suficientes aún</p>}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-brand-copper/10">
          <h2 className="font-serif text-xl text-dark-elegant mb-6">Cotizaciones Recientes</h2>
          <div className="space-y-3">
            {recent.length > 0 ? recent.map((c) => (
              <Link key={c.id} href="/admin/cotizaciones" className="flex items-center justify-between p-4 bg-cream rounded-xl hover:bg-cream/80 transition-colors">
                <div className="min-w-0">
                  <p className="font-medium text-dark-elegant text-sm truncate">{c.cliente_nombre || "Cliente sin nombre"}</p>
                  <p className="text-xs text-slate-500">{c.tipo_evento} · {c.num_invitados} invitados</p>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className="font-serif text-brand-copper text-sm">{formatARS(c.presupuesto)}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${getEstadoClass(c.estado)}`}>{c.estado}</span>
                </div>
              </Link>
            )) : (
              <p className="text-slate-400 text-center py-8 text-sm">No hay cotizaciones aún</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
