"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import ConfirmDialog from "@/components/ConfirmDialog";

interface Evento {
  id: string;
  nombre: string;
  fecha: string;
  tipo: string;
  cliente: string;
  cliente_id?: string | null;
  clientes?: { nombre: string } | null;
  estado: string;
  invitados: number;
  menu: string;
  notas: string;
  created_at: string;
}

const ESTADOS = ["pendiente", "confirmado", "completado", "cancelado"];

function formatDate(d: string) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("es-AR", { year: "numeric", month: "short", day: "numeric" });
}

function estadoClass(e: string) {
  const map: Record<string, string> = {
    pendiente: "bg-amber-100 text-amber-700",
    confirmado: "bg-green-100 text-green-700",
    completado: "bg-blue-100 text-blue-700",
    cancelado: "bg-red-100 text-red-700",
  };
  return map[e] || "bg-slate-100 text-slate-700";
}

const emptyForm = {
  nombre: "", fecha: "", tipo: "", cliente: "", estado: "pendiente", invitados: 0, menu: "", notas: "",
};

export default function EventosPage() {
  const supabase = createClient();
  const [data, setData] = useState<Evento[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  const load = useCallback(async () => {
    if (!supabase) { if (mountedRef.current) setLoading(false); return; }
    try {
      const { data: result } = await supabase.from("eventos").select("*, clientes(nombre)").order("fecha", { ascending: false, nullsFirst: false });
      setData(result || []);
    } catch (e) {
      console.error("Error loading eventos:", e);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    mountedRef.current = true;
    load();
    return () => { mountedRef.current = false; };
  }, [load]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const openNew = () => { setEditId(null); setForm(emptyForm); setShowModal(true); setMsg(""); };

  const openEdit = (e: Evento) => {
    setEditId(e.id);
    setForm({
      nombre: e.nombre || "",
      fecha: e.fecha ? e.fecha.slice(0, 10) : "",
      tipo: e.tipo || "",
      cliente: e.cliente || "",
      estado: e.estado || "pendiente",
      invitados: e.invitados || 0,
      menu: e.menu || "",
      notas: e.notas || "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!supabase) return;
    setSaving(true);
    const payload = { ...form, fecha: form.fecha || null };
    const { error } = editId
      ? await supabase.from("eventos").update(payload).eq("id", editId)
      : await supabase.from("eventos").insert(payload);
    if (error) {
      setMsg("Error al guardar: " + error.message);
      setSaving(false);
      return;
    }
    setSaving(false);
    setShowModal(false);
    load();
  };

  const handleDelete = async (id: string) => {
    setConfirmDelete(id);
  };

  const confirmDeleteAction = async () => {
    if (!confirmDelete) return;
    const { error } = await supabase?.from("eventos").delete().eq("id", confirmDelete) ?? {};
    if (error) {
      setMsg("Error al eliminar: " + error.message);
    }
    setConfirmDelete(null);
    load();
  };

  const updateEstado = async (id: string, estado: string) => {
    const { error } = await supabase?.from("eventos").update({ estado }).eq("id", id) ?? {};
    if (error) {
      setMsg("Error al actualizar: " + error.message);
      return;
    }
    load();
  };

  const stats = {
    total: data.length,
    confirmados: data.filter((e) => e.estado === "confirmado").length,
    pendientes: data.filter((e) => e.estado === "pendiente").length,
    completados: data.filter((e) => e.estado === "completado").length,
  };

  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  const groupedByMonth: Record<string, Evento[]> = {};
  data.forEach((e) => {
    if (!e.fecha) { if (!groupedByMonth["Sin fecha"]) groupedByMonth["Sin fecha"] = []; groupedByMonth["Sin fecha"].push(e); return; }
    const d = new Date(e.fecha);
    const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
    if (!groupedByMonth[key]) groupedByMonth[key] = [];
    groupedByMonth[key].push(e);
  });

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-serif text-4xl text-dark-elegant">Eventos</h1>
        <button onClick={openNew} className="bg-brand-copper text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-copper-light transition-colors cursor-pointer">
          + Nuevo Evento
        </button>
      </div>

      {msg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-6" role="alert">
          {msg}
        </div>
      )}

      {loading ? (
        <div className="animate-pulse bg-slate-200 rounded-2xl p-8 h-64" />
      ) : (
      <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-brand-copper/10">
          <p className="text-2xl font-serif text-dark-elegant">{stats.total}</p>
          <p className="text-xs text-slate-500">Total</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-green-200">
          <p className="text-2xl font-serif text-green-700">{stats.confirmados}</p>
          <p className="text-xs text-slate-500">Confirmados</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-amber-200">
          <p className="text-2xl font-serif text-amber-700">{stats.pendientes}</p>
          <p className="text-xs text-slate-500">Pendientes</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-200">
          <p className="text-2xl font-serif text-blue-700">{stats.completados}</p>
          <p className="text-xs text-slate-500">Completados</p>
        </div>
      </div>

      {Object.entries(groupedByMonth).map(([month, eventos]) => (
        <div key={month} className="mb-8">
          <h2 className="font-serif text-xl text-dark-elegant mb-4">{month}</h2>
          <div className="bg-white rounded-2xl shadow-lg border border-brand-copper/10 overflow-x-auto">
            <table className="w-full">
              <thead className="bg-cream border-b border-brand-copper/10">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Evento</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Cliente</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Tipo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider hidden md:table-cell">Invitados</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Estado</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-copper/10">
                {eventos.map((e) => (
                  <tr key={e.id} className="hover:bg-cream/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-dark-elegant text-sm">{e.nombre || "Sin nombre"}</p>
                      <p className="text-[10px] text-slate-400">{formatDate(e.fecha)}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">{e.clientes?.nombre || e.cliente || "-"}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{e.tipo || "-"}</td>
                    <td className="px-4 py-3 text-sm text-slate-700 hidden md:table-cell">{e.invitados || "-"}</td>
                    <td className="px-4 py-3">
                      <select
                        value={e.estado}
                        onChange={(ev) => updateEstado(e.id, ev.target.value)}
                        className={`text-xs px-2 py-1 rounded-full border-0 ${estadoClass(e.estado)} cursor-pointer`}
                      >
                        {ESTADOS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => openEdit(e)} className="text-brand-copper hover:text-brand-copper-light text-sm mr-3 cursor-pointer">Editar</button>
                      <button onClick={() => handleDelete(e.id)} className="text-red-400 hover:text-red-600 text-sm cursor-pointer">Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {data.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <p className="text-lg mb-2">No hay eventos registrados</p>
          <button onClick={openNew} className="text-brand-copper hover:text-brand-copper-light text-sm cursor-pointer">Crear el primer evento</button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6" role="dialog" aria-modal="true" aria-label={editId ? "Editar Evento" : "Nuevo Evento"} onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-serif text-2xl text-dark-elegant">{editId ? "Editar Evento" : "Nuevo Evento"}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-dark-elegant cursor-pointer">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Nombre del Evento</label>
                  <input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Fecha</label>
                  <input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Tipo</label>
                  <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-2.5 text-sm">
                    <option value="">Seleccionar</option>
                    <option value="Boda">Boda</option>
                    <option value="Cumpleaños">Cumpleaños</option>
                    <option value="Corporativo">Corporativo</option>
                    <option value="Evento Social">Evento Social</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Cliente</label>
                  <input type="text" value={form.cliente} onChange={(e) => setForm({ ...form, cliente: e.target.value })} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Estado</label>
                  <select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-2.5 text-sm">
                    {ESTADOS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Invitados</label>
                  <input type="number" value={form.invitados} onChange={(e) => setForm({ ...form, invitados: Number(e.target.value) })} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-2.5 text-sm" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Menú</label>
                  <input type="text" value={form.menu} onChange={(e) => setForm({ ...form, menu: e.target.value })} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-2.5 text-sm" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Notas</label>
                  <textarea rows={3} value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-2.5 text-sm resize-none" />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-brand-copper/20 rounded-lg text-sm text-slate-600 hover:bg-cream transition-colors cursor-pointer">Cancelar</button>
                <button onClick={handleSave} disabled={saving} className="flex-1 px-4 py-2.5 bg-brand-copper text-white rounded-lg text-sm font-medium hover:bg-brand-copper-light transition-colors disabled:opacity-50 cursor-pointer">
                  {saving ? "Guardando..." : editId ? "Actualizar" : "Crear Evento"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete !== null}
        title="Eliminar Evento"
        message="¿Estás seguro de eliminar este evento? Esta acción no se puede deshacer."
        onConfirm={confirmDeleteAction}
        onCancel={() => setConfirmDelete(null)}
      />
      </>
      )}
    </>
  );
}
