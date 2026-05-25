"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import Pagination from "@/components/Pagination";

interface Cliente {
  id: string;
  nombre: string | null;
  email: string | null;
  telefono: string | null;
  created_at: string;
  ultimo_contacto: string | null;
}

function formatDate(d: string | null) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("es-AR", { year: "numeric", month: "short", day: "numeric" });
}

const PAGE_SIZE = 10;

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");

  const load = useCallback(async (searchTerm: string, pageNum: number) => {
    if (!supabase) return;
    const from = (pageNum - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let countQuery = supabase.from("clientes").select("*", { count: "exact", head: true });
    let dataQuery = supabase.from("clientes").select("*").order("created_at", { ascending: false }).range(from, to);

    if (searchTerm) {
      countQuery = countQuery.or(`nombre.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      dataQuery = dataQuery.or(`nombre.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
    }

    const [{ count }, { data }] = await Promise.all([countQuery, dataQuery]);
    setTotal(count ?? 0);
    setClientes(data || []);
  }, []);

  useEffect(() => { load(search, page); }, [page, search, load]);

  const exportCSV = () => {
    const headers = ["Nombre", "Email", "Teléfono", "Registrado", "Último Contacto"];
    const rows = clientes.map((c) => [c.nombre || "", c.email || "", c.telefono || "", formatDate(c.created_at), formatDate(c.ultimo_contacto)]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clientes_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <h1 className="font-serif text-4xl text-dark-elegant">Clientes</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar cliente o email..." className="bg-white border border-brand-copper/20 rounded-lg pl-9 pr-4 py-2 text-sm w-48 focus:outline-none focus:border-brand-copper" />
            <svg className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <button onClick={exportCSV} disabled={clientes.length === 0} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Exportar CSV
          </button>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-lg border border-brand-copper/10 overflow-hidden">
        <table className="w-full">
          <thead className="bg-cream border-b border-brand-copper/10">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Email</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Teléfono</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Registrado</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Último Contacto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-copper/10">
            {clientes.length > 0 ? clientes.map((c) => (
              <tr key={c.id} className="hover:bg-cream/50 transition-colors">
                <td className="px-6 py-4 font-medium text-dark-elegant">{c.nombre || "-"}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{c.email || "-"}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{c.telefono || "-"}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{formatDate(c.created_at)}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{formatDate(c.ultimo_contacto)}</td>
              </tr>
            )) : (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">No hay clientes registrados</td></tr>
            )}
          </tbody>
        </table>
        <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
      </div>
    </>
  );
}
