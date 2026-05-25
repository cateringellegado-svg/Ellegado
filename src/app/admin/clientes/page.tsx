"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Pagination from "@/components/Pagination";

interface Cliente {
  id: string;
  nombre: string | null;
  email: string | null;
  telefono: string | null;
  created_at: string;
  ultimo_contacto: string | null;
  total_eventos?: number;
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

  useEffect(() => {
    async function load() {
      if (!supabase) return;
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { count } = await supabase
        .from("clientes")
        .select("*", { count: "exact", head: true });

      const { data } = await supabase
        .from("clientes")
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, to);

      setTotal(count ?? 0);
      setClientes(data || []);
    }
    load();
  }, [page]);

  return (
    <>
      <h1 className="font-serif text-4xl text-dark-elegant mb-8">Clientes</h1>
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
