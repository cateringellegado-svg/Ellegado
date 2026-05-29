"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { createCliente, updateCliente, deleteCliente } from "@/lib/supabase";
import Pagination from "@/components/Pagination";
import ConfirmDialog from "@/components/ConfirmDialog";

interface Cliente {
  id: string;
  nombre: string | null;
  email: string | null;
  telefono: string | null;
  direccion: string | null;
  tipo_documento: string | null;
  numero_documento: string | null;
  condicion_iva: string | null;
  moneda_preferida: string | null;
  notas: string | null;
  created_at: string;
  ultimo_contacto: string | null;
}

function formatDate(d: string | null) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("es-AR", { year: "numeric", month: "short", day: "numeric" });
}

const PAGE_SIZE = 10;

const emptyForm = {
  nombre: "", email: "", telefono: "", direccion: "",
  tipo_documento: "DNI", numero_documento: "", condicion_iva: "Consumidor Final",
  moneda_preferida: "ARS", notas: "",
};

export default function ClientesPage() {
  const supabase = createClient();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const load = useCallback(async (searchTerm: string, pageNum: number) => {
    if (!supabase) { if (mountedRef.current) setLoading(false); return; }
    const from = (pageNum - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    try {
      let countQuery = supabase.from("clientes").select("*", { count: "exact", head: true });
      let dataQuery = supabase.from("clientes").select("*").order("created_at", { ascending: false }).range(from, to);

      if (searchTerm) {
        countQuery = countQuery.or(`nombre.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
        dataQuery = dataQuery.or(`nombre.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      const [{ count }, { data }] = await Promise.all([countQuery, dataQuery]);
      if (mountedRef.current) {
        setTotal(count ?? 0);
        setClientes(data || []);
      }
    } catch (e) {
      console.error("Error loading clientes:", e);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    load(search, page);
    return () => { mountedRef.current = false; };
  }, [page, search, load]);

  const openNew = () => {
    setEditId(null);
    setForm(emptyForm);
    setShowModal(true);
    setMsg("");
  };

  const openEdit = (c: Cliente) => {
    setEditId(c.id);
    setForm({
      nombre: c.nombre || "",
      email: c.email || "",
      telefono: c.telefono || "",
      direccion: c.direccion || "",
      tipo_documento: c.tipo_documento || "DNI",
      numero_documento: c.numero_documento || "",
      condicion_iva: c.condicion_iva || "Consumidor Final",
      moneda_preferida: c.moneda_preferida || "ARS",
      notas: c.notas || "",
    });
    setShowModal(true);
    setMsg("");
  };

  const handleSave = async () => {
    if (!supabase) return;
    if (!form.nombre.trim()) { setMsg("El nombre es obligatorio"); return; }
    setSaving(true);
    const payload = {
      nombre: form.nombre,
      email: form.email || null,
      telefono: form.telefono || null,
      direccion: form.direccion || null,
      tipo_documento: form.tipo_documento,
      numero_documento: form.numero_documento || null,
      condicion_iva: form.condicion_iva,
      moneda_preferida: form.moneda_preferida,
      notas: form.notas || null,
    };
    const { error } = editId
      ? await updateCliente(editId, payload)
      : await createCliente(payload);
    setSaving(false);
    if (error) { setMsg("Error: " + error.message); return; }
    setShowModal(false);
    load(search, page);
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    const { error } = await deleteCliente(confirmDelete);
    if (error) { setMsg("Error: " + error.message); } else { setMsg("Cliente eliminado"); }
    setConfirmDelete(null);
    load(search, page);
  };

  const exportCSV = () => {
    const headers = ["Nombre", "Email", "Teléfono", "Dirección", "Tipo Doc.", "Nro Doc.", "Condición IVA", "Moneda", "Notas", "Registrado", "Último Contacto"];
    const rows = clientes.map((c) => [c.nombre || "", c.email || "", c.telefono || "", c.direccion || "", c.tipo_documento || "", c.numero_documento || "", c.condicion_iva || "", c.moneda_preferida || "", c.notas || "", formatDate(c.created_at), formatDate(c.ultimo_contacto)]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `clientes_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
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
          <button onClick={openNew} className="bg-brand-copper text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-brand-copper-light transition-colors cursor-pointer">
            + Nuevo Cliente
          </button>
          <button onClick={exportCSV} disabled={clientes.length === 0} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Exportar CSV
          </button>
        </div>
      </div>

      {msg && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${msg.includes("Error") ? "bg-red-50 text-red-600 border border-red-200" : "bg-green-50 text-green-600 border border-green-200"}`} role="alert">
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
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Email</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Teléfono</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Registrado</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Último Contacto</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Acciones</th>
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
                <td className="px-6 py-4 text-right">
                  <button onClick={() => openEdit(c)} className="text-brand-copper hover:text-brand-copper-light text-sm mr-3 cursor-pointer">Editar</button>
                  <button onClick={() => setConfirmDelete(c.id)} className="text-red-400 hover:text-red-600 text-sm cursor-pointer">Eliminar</button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">No hay clientes registrados</td></tr>
            )}
          </tbody>
        </table>
        <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
      </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6" role="dialog" aria-modal="true" aria-label={editId ? "Editar Cliente" : "Nuevo Cliente"} onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-serif text-2xl text-dark-elegant">{editId ? "Editar Cliente" : "Nuevo Cliente"}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-dark-elegant cursor-pointer">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Nombre *</label>
                <input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-2.5 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Email</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Teléfono</label>
                  <input type="text" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-2.5 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Dirección</label>
                <input type="text" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-2.5 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Tipo Documento</label>
                  <select value={form.tipo_documento} onChange={(e) => setForm({ ...form, tipo_documento: e.target.value })} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-2.5 text-sm">
                    <option value="DNI">DNI</option>
                    <option value="CUIL">CUIL</option>
                    <option value="CUIT">CUIT</option>
                    <option value="Pasaporte">Pasaporte</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Nro. Documento</label>
                  <input type="text" value={form.numero_documento} onChange={(e) => setForm({ ...form, numero_documento: e.target.value })} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-2.5 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Condición IVA</label>
                  <select value={form.condicion_iva} onChange={(e) => setForm({ ...form, condicion_iva: e.target.value })} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-2.5 text-sm">
                    <option value="Consumidor Final">Consumidor Final</option>
                    <option value="Responsable Inscripto">Responsable Inscripto</option>
                    <option value="Monotributista">Monotributista</option>
                    <option value="Exterior">Exterior</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Moneda Preferida</label>
                  <select value={form.moneda_preferida} onChange={(e) => setForm({ ...form, moneda_preferida: e.target.value })} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-2.5 text-sm">
                    <option value="ARS">ARS</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Notas</label>
                <textarea rows={2} value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-2.5 text-sm resize-none" />
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-brand-copper/20 rounded-lg text-sm text-slate-600 hover:bg-cream transition-colors cursor-pointer">Cancelar</button>
                <button onClick={handleSave} disabled={saving} className="flex-1 px-4 py-2.5 bg-brand-copper text-white rounded-lg text-sm font-medium hover:bg-brand-copper-light transition-colors disabled:opacity-50 cursor-pointer">
                  {saving ? "Guardando..." : editId ? "Actualizar" : "Crear Cliente"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete !== null}
        title="Eliminar Cliente"
        message="¿Estás seguro de eliminar este cliente? Esta acción no se puede deshacer."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </>
  );
}
