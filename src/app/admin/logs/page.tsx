"use client";

import { useEffect, useState, useRef } from "react";
import { fetchAdminLogs } from "@/lib/supabase";
import type { AdminLog } from "@/types";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("es-AR", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export default function LogsPage() {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const mountedRef = useRef(true);

  const load = async () => {
    try {
      const data = await fetchAdminLogs(200);
      if (mountedRef.current) setLogs(data || []);
    } catch (e) {
      console.error("Error loading logs:", e);
      if (mountedRef.current) setMsg("Error al cargar los registros de auditoría");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    load();
    return () => { mountedRef.current = false; };
  }, []);

  const accionColor = (accion: string) => {
    if (accion.includes("pago") || accion.includes("webhook")) return "bg-blue-100 text-blue-700";
    if (accion.includes("elimin") || accion.includes("delete")) return "bg-red-100 text-red-700";
    if (accion.includes("crear") || accion.includes("insert")) return "bg-green-100 text-green-700";
    if (accion.includes("actualiz") || accion.includes("update")) return "bg-amber-100 text-amber-700";
    return "bg-slate-100 text-slate-600";
  };

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-serif text-4xl text-dark-elegant">Auditoría</h1>
          <p className="text-xs text-slate-400 mt-1">Registro de actividades — Solo lectura</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 bg-white px-3 py-1.5 rounded-full border">
            {logs.length} eventos
          </span>
          <button
            onClick={() => { setLoading(true); setMsg(""); load(); }}
            className="flex items-center gap-2 bg-white border border-brand-copper/20 text-slate-600 px-4 py-2 rounded-lg text-sm hover:bg-cream transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            Actualizar
          </button>
        </div>
      </div>

      {msg && (
        <div className="mb-4 px-4 py-3 rounded-lg text-sm bg-red-50 text-red-600 border border-red-200" role="alert">
          {msg}
        </div>
      )}

      {loading ? (
        <div className="animate-pulse bg-slate-200 rounded-2xl p-8 h-64" />
      ) : (
      <div className="bg-white rounded-2xl shadow-lg border border-brand-copper/10 overflow-x-auto">
        <table className="w-full">
          <thead className="bg-cream border-b border-brand-copper/10">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Usuario</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Acción</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Detalle</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Referencia</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-copper/10">
            {logs.length > 0 ? logs.map((l) => (
              <tr key={l.id} className="hover:bg-cream/50 transition-colors">
                <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">{formatDate(l.created_at)}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{l.usuario_email || "-"}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs px-3 py-1 rounded-full ${accionColor(l.accion)}`}>
                    {l.accion}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 max-w-md truncate">{l.detalle || "-"}</td>
                <td className="px-6 py-4 text-right text-xs text-slate-400 font-mono">{l.referencia_id ? l.referencia_id.slice(0, 12) + "…" : "-"}</td>
              </tr>
            )) : (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">No hay registros de auditoría</td></tr>
            )}
          </tbody>
        </table>
      </div>
      )}
    </>
  );
}
