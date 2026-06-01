"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { fetchAllCombosAdmin, createComboAdmin, updateComboAdmin, deleteComboAdmin } from "@/lib/supabase";
import type { Combo, ComboItem } from "@/types";
import ConfirmDialog from "@/components/ConfirmDialog";

const emptyForm = {
  nombre: "",
  descripcion: "",
  precio: 0,
  personas_min: 1,
  personas_max: 1,
  activo: true,
  orden: 0,
  capacidad_diaria: 0,
  items: [] as string[],
};

function formatARS(v: number) {
  return "$" + v.toLocaleString("es-AR");
}

export default function CombosPage() {
  const supabase = createClient();
  const [combos, setCombos] = useState<Combo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const load = async () => {
    if (!supabase) { if (mountedRef.current) setLoading(false); return; }
    try {
      const data = await fetchAllCombosAdmin();
      if (mountedRef.current) setCombos(data || []);
    } catch (e) {
      console.error("Error loading combos:", e);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    return () => { mountedRef.current = false; };
  }, []);

  const openNew = () => {
    setEditId(null);
    setForm(emptyForm);
    setShowModal(true);
    setMsg("");
  };

  const openEdit = (c: Combo) => {
    setEditId(c.id);
    setForm({
      nombre: c.nombre,
      descripcion: c.descripcion,
      precio: c.precio,
      personas_min: c.personas_min,
      personas_max: c.personas_max,
      activo: c.activo ?? true,
      orden: c.orden ?? 0,
      capacidad_diaria: c.capacidad_diaria ?? 0,
      items: (c.items_json || []).map((i) => i.nombre),
    });
    setShowModal(true);
    setMsg("");
  };

  const handleSave = async () => {
    if (!supabase) return;
    if (!form.nombre.trim()) { setMsg("El nombre es obligatorio"); return; }
    if (form.precio <= 0) { setMsg("El precio debe ser mayor a 0"); return; }

    const items: ComboItem[] = form.items
      .filter((n) => n.trim())
      .map((nombre, idx) => ({
        id: String(idx + 1),
        nombre: nombre.trim(),
        cantidad: 1,
        precio: 0,
      }));

    setSaving(true);
    const payload = {
      nombre: form.nombre,
      descripcion: form.descripcion,
      precio: form.precio,
      items_json: items,
      personas_min: form.personas_min,
      personas_max: form.personas_max,
      activo: form.activo,
      orden: form.orden,
      capacidad_diaria: form.capacidad_diaria || 0,
    };

    if (editId) {
      const { error } = await updateComboAdmin(editId, payload);
      if (error) { setMsg("Error: " + error.message); setSaving(false); return; }
    } else {
      const { error } = await createComboAdmin({ id: crypto.randomUUID(), ...payload });
      if (error) { setMsg("Error: " + error.message); setSaving(false); return; }
    }

    setSaving(false);
    setShowModal(false);
    load();
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    const { error } = await deleteComboAdmin(confirmDelete);
    if (error) { setMsg("Error: " + error.message); } else { setMsg("Combo eliminado"); }
    setConfirmDelete(null);
    load();
  };

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-serif text-4xl text-dark-elegant">Combos</h1>
        <button
          onClick={openNew}
          className="bg-brand-copper text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-brand-copper-light transition-colors cursor-pointer"
        >
          + Nuevo Combo
        </button>
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
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Precio</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Personas</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Orden</th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Activo</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-copper/10">
            {combos.length > 0 ? combos.map((c) => (
              <tr key={c.id} className="hover:bg-cream/50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-medium text-dark-elegant">{c.nombre}</p>
                  <p className="text-xs text-slate-500 truncate max-w-xs">{c.descripcion}</p>
                </td>
                <td className="px-6 py-4 font-serif text-brand-copper">{formatARS(c.precio)}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{c.personas_min}–{c.personas_max}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{c.orden}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`text-xs px-3 py-1 rounded-full border ${c.activo ? "bg-green-50 text-green-700 border-green-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                    {c.activo ? "Sí" : "No"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => openEdit(c)} className="text-brand-copper hover:text-brand-copper-light text-sm mr-3 cursor-pointer">Editar</button>
                  <button onClick={() => setConfirmDelete(c.id)} className="text-red-400 hover:text-red-600 text-sm cursor-pointer">Eliminar</button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">No hay combos registrados</td></tr>
            )}
          </tbody>
        </table>
      </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6" role="dialog" aria-modal="true" aria-label={editId ? "Editar Combo" : "Nuevo Combo"} onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-serif text-2xl text-dark-elegant">{editId ? "Editar Combo" : "Nuevo Combo"}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-dark-elegant cursor-pointer">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Nombre *</label>
                <input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-2.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Descripción</label>
                <textarea rows={2} value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-2.5 text-sm resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Precio *</label>
                  <input type="number" min="1" value={form.precio || ""} onChange={(e) => setForm({ ...form, precio: parseInt(e.target.value) || 0 })} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Orden</label>
                  <input type="number" min="0" value={form.orden} onChange={(e) => setForm({ ...form, orden: parseInt(e.target.value) || 0 })} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-2.5 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Personas Mín</label>
                  <input type="number" min="1" value={form.personas_min} onChange={(e) => setForm({ ...form, personas_min: parseInt(e.target.value) || 1 })} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Personas Máx</label>
                  <input type="number" min="1" value={form.personas_max} onChange={(e) => setForm({ ...form, personas_max: parseInt(e.target.value) || 1 })} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-2.5 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Capacidad Diaria</label>
                <input type="number" min="0" value={form.capacidad_diaria} onChange={(e) => setForm({ ...form, capacidad_diaria: parseInt(e.target.value) || 0 })} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-2.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Productos del Combo</label>
                <div className="space-y-2">
                  {form.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => {
                          const next = [...form.items];
                          next[idx] = e.target.value;
                          setForm({ ...form, items: next });
                        }}
                        className="flex-1 bg-cream border border-brand-copper/20 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-copper"
                        placeholder="Nombre del producto"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const next = form.items.filter((_, i) => i !== idx);
                          setForm({ ...form, items: next });
                        }}
                        className="text-red-400 hover:text-red-600 p-2 cursor-pointer shrink-0"
                        aria-label={`Eliminar ${item || "producto"}`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, items: [...form.items, ""] })}
                    className="flex items-center gap-2 text-brand-copper hover:text-brand-copper-light text-sm font-medium cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    Agregar Producto
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="combo-activo" checked={form.activo} onChange={(e) => setForm({ ...form, activo: e.target.checked })} className="w-4 h-4 text-brand-copper rounded" />
                <label htmlFor="combo-activo" className="text-sm text-slate-600">Combo activo</label>
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-brand-copper/20 rounded-lg text-sm text-slate-600 hover:bg-cream transition-colors cursor-pointer">Cancelar</button>
                <button onClick={handleSave} disabled={saving} className="flex-1 px-4 py-2.5 bg-brand-copper text-white rounded-lg text-sm font-medium hover:bg-brand-copper-light transition-colors disabled:opacity-50 cursor-pointer">
                  {saving ? "Guardando..." : editId ? "Actualizar" : "Crear Combo"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete !== null}
        title="Eliminar Combo"
        message="¿Estás seguro de eliminar este combo? Esta acción no se puede deshacer."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </>
  );
}
