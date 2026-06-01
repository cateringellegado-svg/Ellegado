"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { fetchTestimonialsAdmin, createTestimonialAdmin, updateTestimonialAdmin, deleteTestimonialAdmin } from "@/lib/supabase";
import type { TestimonialRow } from "@/lib/supabase";
import ConfirmDialog from "@/components/ConfirmDialog";

const emptyForm = {
  name: "",
  text: "",
  event: "",
  rating: 5,
  menu: "",
  active: true,
  orden: 0,
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("es-AR", { year: "numeric", month: "short", day: "numeric" });
}

export default function TestimoniosPage() {
  const supabase = createClient();
  const [testimonials, setTestimonials] = useState<TestimonialRow[]>([]);
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
      const data = await fetchTestimonialsAdmin();
      if (mountedRef.current) setTestimonials(data || []);
    } catch (e) {
      console.error("Error loading testimonials:", e);
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

  const openEdit = (t: TestimonialRow) => {
    setEditId(t.id);
    setForm({
      name: t.name,
      text: t.text,
      event: t.event,
      rating: t.rating,
      menu: t.menu,
      active: t.active,
      orden: t.orden,
    });
    setShowModal(true);
    setMsg("");
  };

  const handleSave = async () => {
    if (!supabase) return;
    if (!form.name.trim() || !form.text.trim()) {
      setMsg("Nombre y mensaje son obligatorios");
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        await updateTestimonialAdmin(editId, form);
      } else {
        await createTestimonialAdmin(form);
      }
      setShowModal(false);
      await load();
    } catch (e) {
      setMsg("Error: " + (e instanceof Error ? e.message : "desconocido"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!supabase || !confirmDelete) return;
    const { error } = await deleteTestimonialAdmin(confirmDelete);
    if (error) { setMsg("Error: " + error.message); return; }
    setConfirmDelete(null);
    await load();
  };

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-serif text-4xl text-dark-elegant">Testimonios</h1>
        <button onClick={openNew} className="bg-brand-copper text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-brand-copper/30 transition-all text-sm font-medium cursor-pointer">
          + Nuevo Testimonio
        </button>
      </div>

      {msg && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${msg.includes("Error") ? "bg-red-50 text-red-600 border border-red-200" : "bg-green-50 text-green-600 border border-green-200"}`} role="alert">
          <div className="flex justify-between items-center">
            <span>{msg}</span>
            <button onClick={() => setMsg("")} className="ml-4 text-current opacity-50 hover:opacity-100 cursor-pointer">x</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="animate-pulse bg-slate-200 rounded-2xl p-8 h-64" />
      ) : (
        <div className="bg-white rounded-2xl shadow-lg border border-brand-copper/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-copper/10 bg-cream">
                  <th className="text-left px-4 py-3 font-semibold text-slate-700 text-xs uppercase tracking-wider">Orden</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700 text-xs uppercase tracking-wider">Nombre</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700 text-xs uppercase tracking-wider">Evento</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700 text-xs uppercase tracking-wider">Valoración</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700 text-xs uppercase tracking-wider">Visible</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700 text-xs uppercase tracking-wider">Creado</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-700 text-xs uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {testimonials.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">No hay testimonios registrados.</td></tr>
                ) : testimonials.map((t) => (
                  <tr key={t.id} className="border-b border-brand-copper/5 hover:bg-cream/50 transition-colors">
                    <td className="px-4 py-3 text-slate-500">{t.orden}</td>
                    <td className="px-4 py-3 font-medium text-dark-elegant max-w-[180px] truncate">{t.name}</td>
                    <td className="px-4 py-3 text-slate-600 max-w-[140px] truncate">{t.event}</td>
                    <td className="px-4 py-3">
                      <span className="text-amber-500 text-sm">{"★".repeat(t.rating)}{"☆".repeat(5 - t.rating)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block w-2 h-2 rounded-full ${t.active ? "bg-green-500" : "bg-slate-300"}`} />
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{formatDate(t.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEdit(t)} className="px-3 py-1.5 bg-brand-copper/10 text-brand-copper rounded-lg text-xs font-medium hover:bg-brand-copper/20 transition-colors cursor-pointer">Editar</button>
                        <button onClick={() => setConfirmDelete(t.id)} className="px-3 py-1.5 bg-red-50 text-red-500 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors cursor-pointer">Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-serif text-2xl text-dark-elegant mb-6">{editId ? "Editar Testimonio" : "Nuevo Testimonio"}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Nombre del Cliente</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-2.5 text-sm" placeholder="María García" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Mensaje</label>
                <textarea rows={3} value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-2.5 text-sm resize-none" placeholder="Excelente servicio..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Evento</label>
                  <input type="text" value={form.event} onChange={(e) => setForm({ ...form, event: e.target.value })} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-2.5 text-sm" placeholder="Cumpleaños" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Menú</label>
                  <input type="text" value={form.menu} onChange={(e) => setForm({ ...form, menu: e.target.value })} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-2.5 text-sm" placeholder="Clásico" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Valoración (1-5)</label>
                  <select value={form.rating} onChange={(e) => setForm({ ...form, rating: parseInt(e.target.value) })} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-2.5 text-sm">
                    {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} estrella{n > 1 ? "s" : ""}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Orden</label>
                  <input type="number" min="0" value={form.orden} onChange={(e) => setForm({ ...form, orden: parseInt(e.target.value) || 0 })} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-2.5 text-sm" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="testimonial-activo" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="w-4 h-4 text-brand-copper rounded" />
                <label htmlFor="testimonial-activo" className="text-sm text-slate-700">Activo / Visible en el sitio</label>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 cursor-pointer">Cancelar</button>
              <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-brand-copper text-white rounded-lg text-sm font-medium hover:bg-brand-copper-light transition-colors cursor-pointer disabled:opacity-50">
                {saving ? "Guardando..." : editId ? "Actualizar" : "Crear"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete !== null}
        title="Eliminar Testimonio"
        message="¿Estás seguro de eliminar este testimonio? No se puede deshacer."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </>
  );
}
