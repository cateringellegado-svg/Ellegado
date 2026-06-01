"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

interface LeadRow {
  id: string;
  tipo_evento: string;
  num_invitados: number | null;
  estado: string | null;
  notas_internas: string | null;
  created_at: string;
}

const ESTADOS = ["Nuevo", "Contactado", "Convertido", "Descartado"];

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("es-AR", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function LeadsPage() {
  const supabase = createClient();
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<LeadRow | null>(null);
  const [editEstado, setEditEstado] = useState("");
  const [editNotas, setEditNotas] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const mountedRef = useRef(true);

  const load = async () => {
    if (!supabase) { if (mountedRef.current) setLoading(false); return; }
    try {
      const { data } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });
      if (mountedRef.current) setLeads(data || []);
    } catch (e) {
      console.error("Error loading leads:", e);
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

  const openEdit = (l: LeadRow) => {
    setSelected(l);
    setEditEstado(l.estado || "Nuevo");
    setEditNotas(l.notas_internas || "");
    setMsg("");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!supabase || !selected) return;
    setSaving(true);
    const { error } = await supabase
      .from("leads")
      .update({ estado: editEstado, notas_internas: editNotas || null })
      .eq("id", selected.id);
    setSaving(false);
    if (error) { setMsg("Error: " + error.message); return; }
    setShowModal(false);
    load();
  };

  const estadoColor = (estado: string | null) => {
    switch (estado) {
      case "Nuevo": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Contactado": return "bg-amber-100 text-amber-700 border-amber-200";
      case "Convertido": return "bg-green-100 text-green-700 border-green-200";
      case "Descartado": return "bg-slate-100 text-slate-500 border-slate-200";
      default: return "bg-slate-100 text-slate-500 border-slate-200";
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-serif text-4xl text-dark-elegant">Prospectos (Leads)</h1>
        <span className="text-xs text-slate-400 bg-white px-3 py-1.5 rounded-full border">
          {leads.length} registros
        </span>
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
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Tipo de Evento</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Invitados</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Notas Internas</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Recibido</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-copper/10">
            {leads.length > 0 ? leads.map((l) => (
              <tr key={l.id} className="hover:bg-cream/50 transition-colors">
                <td className="px-6 py-4 font-medium text-dark-elegant capitalize">{l.tipo_evento || "Sin especificar"}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{l.num_invitados ? `${l.num_invitados}` : "-"}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs px-3 py-1 rounded-full border ${estadoColor(l.estado)}`}>
                    {l.estado || "Nuevo"}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate">{l.notas_internas || "-"}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{formatDate(l.created_at)}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => openEdit(l)} className="text-brand-copper hover:text-brand-copper-light text-sm cursor-pointer">Gestionar</button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">No hay prospectos capturados</td></tr>
            )}
          </tbody>
        </table>
      </div>
      )}

      {showModal && selected && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6" role="dialog" aria-modal="true" aria-label="Gestionar Lead" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-serif text-2xl text-dark-elegant">Gestionar Prospecto</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-dark-elegant cursor-pointer">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-cream rounded-xl p-4 space-y-1">
                <p className="text-sm"><span className="font-semibold text-slate-600">Evento:</span> <span className="capitalize">{selected.tipo_evento || "Sin especificar"}</span></p>
                <p className="text-sm"><span className="font-semibold text-slate-600">Invitados:</span> {selected.num_invitados ?? "-"}</p>
                <p className="text-sm"><span className="font-semibold text-slate-600">Recibido:</span> {formatDate(selected.created_at)}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Estado</label>
                <select value={editEstado} onChange={(e) => setEditEstado(e.target.value)} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-2.5 text-sm">
                  {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Notas Internas</label>
                <textarea rows={3} value={editNotas} onChange={(e) => setEditNotas(e.target.value)} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-2.5 text-sm resize-none" placeholder="Agregar nota sobre este prospecto..." />
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-brand-copper/20 rounded-lg text-sm text-slate-600 hover:bg-cream transition-colors cursor-pointer">Cancelar</button>
                <button onClick={handleSave} disabled={saving} className="flex-1 px-4 py-2.5 bg-brand-copper text-white rounded-lg text-sm font-medium hover:bg-brand-copper-light transition-colors disabled:opacity-50 cursor-pointer">
                  {saving ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
