"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import Pagination from "@/components/Pagination";

interface Cotizacion {
  id: string;
  created_at: string;
  cliente_nombre: string | null;
  cliente_email: string | null;
  cliente_telefono: string | null;
  tipo_evento: string | null;
  num_invitados: number | null;
  presupuesto: number | null;
  servicios: string | null;
  estado: string;
}

const ESTADOS = ["nueva", "contactada", "confirmada", "completada"];

function formatARS(v: number | null | undefined) {
  if (v == null) return "$0";
  return "$" + v.toLocaleString("es-AR");
}

function formatDate(d: string) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("es-AR", { year: "numeric", month: "short", day: "numeric" });
}

function estadoClass(e: string) {
  const map: Record<string, string> = {
    nueva: "bg-blue-100 text-blue-700",
    contactada: "bg-amber-100 text-amber-700",
    confirmada: "bg-green-100 text-green-700",
    completada: "bg-slate-100 text-slate-700",
  };
  return map[e] || "bg-slate-100 text-slate-700";
}

const PAGE_SIZE = 10;

export default function CotizacionesPage() {
  const [data, setData] = useState<Cotizacion[]>([]);
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState<Cotizacion | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const load = useCallback(async (estadoFilter: string, pageNum: number) => {
    if (!supabase) return;
    const from = (pageNum - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const countQuery = supabase
      .from("cotizaciones")
      .select("*", { count: "exact", head: true });
    if (estadoFilter) countQuery.eq("estado", estadoFilter);

    let dataQuery = supabase
      .from("cotizaciones")
      .select("*")
      .order("created_at", { ascending: false })
      .range(from, to);
    if (estadoFilter) dataQuery = dataQuery.eq("estado", estadoFilter);

    const [{ count }, { data: result }] = await Promise.all([countQuery, dataQuery]);
    setTotal(count ?? 0);
    setData(result || []);
  }, []);

  useEffect(() => {
    setPage(1);
    load(filter, 1);
  }, [filter, load]);

  useEffect(() => {
    load(filter, page);
  }, [page, filter, load]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const updateEstado = async (id: string, estado: string) => {
    await supabase?.from("cotizaciones").update({ estado }).eq("id", id);
    load(filter, page);
  };

  const exportCSV = () => {
    const headers = ["Fecha", "Cliente", "Email", "Teléfono", "Tipo Evento", "Invitados", "Presupuesto", "Estado", "Servicios"];
    const rows = data.map((c) => [
      formatDate(c.created_at),
      c.cliente_nombre || "",
      c.cliente_email || "",
      c.cliente_telefono || "",
      c.tipo_evento || "",
      String(c.num_invitados ?? ""),
      String(c.presupuesto ?? ""),
      c.estado,
      c.servicios || "",
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cotizaciones_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <h1 className="font-serif text-4xl text-dark-elegant">Cotizaciones</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={exportCSV}
            disabled={data.length === 0}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Exportar CSV
          </button>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-white border border-brand-copper/20 rounded-lg px-4 py-2 text-sm"
          >
            <option value="">Todos los estados</option>
            {ESTADOS.map((e) => <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-brand-copper/10 overflow-hidden">
        <table className="w-full">
          <thead className="bg-cream border-b border-brand-copper/10">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Cliente</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Tipo</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Invitados</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Presupuesto</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-copper/10">
            {data.length > 0 ? data.map((c) => (
              <tr key={c.id} className="hover:bg-cream/50 transition-colors">
                <td className="px-6 py-4 text-sm text-slate-700">{formatDate(c.created_at)}</td>
                <td className="px-6 py-4">
                  <p className="font-medium text-dark-elegant">{c.cliente_nombre || "Sin nombre"}</p>
                  <p className="text-xs text-slate-500">{c.cliente_email}</p>
                </td>
                <td className="px-6 py-4 text-sm text-slate-700">{c.tipo_evento}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{c.num_invitados}</td>
                <td className="px-6 py-4 font-medium text-brand-copper">{formatARS(c.presupuesto)}</td>
                <td className="px-6 py-4">
                  <select
                    value={c.estado}
                    onChange={(e) => updateEstado(c.id, e.target.value)}
                    className={`text-xs px-2 py-1 rounded-full border-0 ${estadoClass(c.estado)}`}
                  >
                    {ESTADOS.map((e) => <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>)}
                  </select>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => setSelected(c)}
                    className="text-brand-copper hover:text-brand-copper-light cursor-pointer"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-400">No hay cotizaciones</td></tr>
            )}
          </tbody>
        </table>
        <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={handlePageChange} />
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-serif text-2xl text-dark-elegant">Detalle Cotización</h2>
              <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-dark-elegant cursor-pointer"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="space-y-4 text-sm">
              <div><span className="font-semibold text-slate-600">Cliente:</span> <span className="text-dark-elegant">{selected.cliente_nombre || "-"}</span></div>
              <div><span className="font-semibold text-slate-600">Email:</span> <span className="text-dark-elegant">{selected.cliente_email || "-"}</span></div>
              <div><span className="font-semibold text-slate-600">Teléfono:</span> <span className="text-dark-elegant">{selected.cliente_telefono || "-"}</span></div>
              <div><span className="font-semibold text-slate-600">Tipo Evento:</span> <span className="text-dark-elegant">{selected.tipo_evento}</span></div>
              <div><span className="font-semibold text-slate-600">Invitados:</span> <span className="text-dark-elegant">{selected.num_invitados}</span></div>
              <div><span className="font-semibold text-slate-600">Presupuesto:</span> <span className="text-dark-elegant">{formatARS(selected.presupuesto)}</span></div>
              <div><span className="font-semibold text-slate-600">Estado:</span> <span className={`text-xs px-2 py-1 rounded-full ${estadoClass(selected.estado)}`}>{selected.estado}</span></div>
              {selected.servicios && (
                <div>
                  <span className="font-semibold text-slate-600 block mb-1">Servicios:</span>
                  <pre className="text-xs bg-cream p-3 rounded-lg overflow-auto max-h-32">{JSON.stringify(JSON.parse(selected.servicios), null, 2)}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
