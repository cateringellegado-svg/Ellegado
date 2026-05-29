"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import ConfirmDialog from "@/components/ConfirmDialog";

interface PagoRow {
  id: string;
  cliente_id: string;
  monto: number;
  moneda: "ARS" | "USD";
  tipo_pago: string;
  metodo_pago: string;
  estado: string | null;
  fecha_pago: string;
  notas: string | null;
  created_at: string;
  clientes: { nombre: string } | null;
}

interface ClienteOption {
  id: string;
  nombre: string;
}

function formatARS(v: number) { return "$" + v.toLocaleString("es-AR"); }
function formatUSD(v: number) { return "USD " + v.toLocaleString("en-US"); }
function formatFecha(d: string) {
  return new Date(d).toLocaleDateString("es-AR", { year: "numeric", month: "short", day: "numeric" });
}

const emptyForm = {
  cliente_id: "",
  monto: "",
  moneda: "ARS" as "ARS" | "USD",
  tipo_pago: "completo" as string,
  metodo_pago: "efectivo" as string,
  estado: "aprobado" as string,
  fecha_pago: new Date().toISOString().slice(0, 10),
  notas: "",
};

export default function PagosPage() {
  const supabase = createClient();
  const [pagos, setPagos] = useState<PagoRow[]>([]);
  const [clientes, setClientes] = useState<ClienteOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const load = useCallback(async () => {
    if (!supabase) { if (mountedRef.current) setLoading(false); return; }
    try {
      const [pagosRes, clientesRes] = await Promise.all([
        supabase
          .from("pagos")
          .select("*, clientes(nombre)")
          .order("fecha_pago", { ascending: false }),
        supabase.from("clientes").select("id, nombre").order("nombre"),
      ]);
      if (mountedRef.current) {
        setPagos(pagosRes.data || []);
        setClientes(clientesRes.data || []);
      }
    } catch (e) {
      console.error("Error loading pagos:", e);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    load();
    return () => { mountedRef.current = false; };
  }, [load]);

  const openNew = () => {
    setEditId(null);
    setForm(emptyForm);
    setShowModal(true);
    setMsg("");
  };

  const openEdit = (p: PagoRow) => {
    setEditId(p.id);
    setForm({
      cliente_id: p.cliente_id,
      monto: String(p.monto),
      moneda: p.moneda,
      tipo_pago: p.tipo_pago,
      metodo_pago: p.metodo_pago,
      estado: p.estado || "aprobado",
      fecha_pago: p.fecha_pago?.slice(0, 10) || new Date().toISOString().slice(0, 10),
      notas: p.notas || "",
    });
    setShowModal(true);
    setMsg("");
  };

  const handleSave = async () => {
    if (!supabase) return;
    const monto = Number(form.monto);
    if (!form.cliente_id || isNaN(monto) || monto <= 0) {
      setMsg("Seleccioná un cliente e ingresá un monto válido");
      return;
    }
    setSaving(true);
    const payload = {
      cliente_id: form.cliente_id,
      monto,
      moneda: form.moneda,
      tipo_pago: form.tipo_pago,
      metodo_pago: form.metodo_pago,
      estado: form.estado,
      fecha_pago: form.fecha_pago,
      notas: form.notas || null,
    };
    if (editId) {
      const { error } = await supabase.from("pagos").update(payload).eq("id", editId);
      if (error) { setMsg("Error: " + error.message); setSaving(false); return; }
    } else {
      const { error } = await supabase.from("pagos").insert(payload);
      if (error) { setMsg("Error: " + error.message); setSaving(false); return; }
    }
    setSaving(false);
    setShowModal(false);
    load();
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    const { error } = await supabase!.from("pagos").delete().eq("id", confirmDelete);
    if (error) { setMsg("Error: " + error.message); } else { setMsg("Pago eliminado"); }
    setConfirmDelete(null);
    load();
  };

  const estadoColor = (estado: string | null) => {
    switch (estado) {
      case "aprobado": return "bg-green-100 text-green-700 border-green-200";
      case "pendiente": return "bg-amber-100 text-amber-700 border-amber-200";
      case "fallido": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-slate-100 text-slate-500 border-slate-200";
    }
  };

  const metodoLabel = (m: string) => {
    if (m === "transferencia_mp") return "Transf. MP";
    if (m === "efectivo") return "Efectivo";
    return m;
  };

  const formatMonto = (monto: number, moneda: string) =>
    moneda === "USD" ? formatUSD(monto) : formatARS(monto);

  return (
    <>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <h1 className="font-serif text-4xl text-dark-elegant">Pagos</h1>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 bg-white px-3 py-1.5 rounded-full border">
            {pagos.length} registros
          </span>
          <button onClick={openNew} className="bg-brand-copper text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-brand-copper-light transition-colors cursor-pointer">
            + Registrar Pago
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
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Cliente</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Monto</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Método</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Tipo</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-copper/10">
            {pagos.length > 0 ? pagos.map((p) => (
              <tr key={p.id} className="hover:bg-cream/50 transition-colors">
                <td className="px-6 py-4 font-medium text-dark-elegant">{p.clientes?.nombre || "Cliente"}</td>
                <td className="px-6 py-4 text-right font-serif text-brand-copper">{formatMonto(p.monto, p.moneda)}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{metodoLabel(p.metodo_pago)}</td>
                <td className="px-6 py-4 text-sm text-slate-700 capitalize">{p.tipo_pago}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs px-3 py-1 rounded-full border ${estadoColor(p.estado)}`}>
                    {p.estado || "aprobado"}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{formatFecha(p.fecha_pago)}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => openEdit(p)} className="text-brand-copper hover:text-brand-copper-light text-sm mr-3 cursor-pointer">Editar</button>
                  <button onClick={() => setConfirmDelete(p.id)} className="text-red-400 hover:text-red-600 text-sm cursor-pointer">Eliminar</button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-400">No hay pagos registrados</td></tr>
            )}
          </tbody>
        </table>
      </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6" role="dialog" aria-modal="true" aria-label={editId ? "Editar Pago" : "Registrar Pago"} onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-serif text-2xl text-dark-elegant">{editId ? "Editar Pago" : "Registrar Pago"}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-dark-elegant cursor-pointer">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Cliente <span className="text-red-400">*</span></label>
                <select value={form.cliente_id} onChange={(e) => setForm({ ...form, cliente_id: e.target.value })} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-2.5 text-sm">
                  <option value="">Seleccionar cliente</option>
                  {clientes.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Monto <span className="text-red-400">*</span></label>
                  <input type="number" step="0.01" min="0.01" value={form.monto} onChange={(e) => setForm({ ...form, monto: e.target.value })} placeholder="0.00" className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Moneda</label>
                  <select value={form.moneda} onChange={(e) => setForm({ ...form, moneda: e.target.value as "ARS" | "USD" })} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-2.5 text-sm">
                    <option value="ARS">ARS ($)</option>
                    <option value="USD">USD (US$)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Método de Pago</label>
                  <select value={form.metodo_pago} onChange={(e) => setForm({ ...form, metodo_pago: e.target.value })} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-2.5 text-sm">
                    <option value="transferencia_mp">Transferencia MP</option>
                    <option value="efectivo">Efectivo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Tipo de Pago</label>
                  <select value={form.tipo_pago} onChange={(e) => setForm({ ...form, tipo_pago: e.target.value })} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-2.5 text-sm">
                    <option value="completo">Completo</option>
                    <option value="seña">Seña</option>
                    <option value="parcial">Parcial</option>
                    <option value="saldo">Saldo</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Estado</label>
                  <select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-2.5 text-sm">
                    <option value="aprobado">Aprobado</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="fallido">Fallido</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Fecha del Pago</label>
                  <input type="date" value={form.fecha_pago} onChange={(e) => setForm({ ...form, fecha_pago: e.target.value })} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-2.5 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Notas</label>
                <textarea rows={2} value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-2.5 text-sm resize-none" placeholder="Referencia, evento asociado, etc." />
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-brand-copper/20 rounded-lg text-sm text-slate-600 hover:bg-cream transition-colors cursor-pointer">Cancelar</button>
                <button onClick={handleSave} disabled={saving} className="flex-1 px-4 py-2.5 bg-brand-copper text-white rounded-lg text-sm font-medium hover:bg-brand-copper-light transition-colors disabled:opacity-50 cursor-pointer">
                  {saving ? "Guardando..." : editId ? "Actualizar" : "Registrar Pago"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete !== null}
        title="Eliminar Pago"
        message="¿Estás seguro de eliminar este pago? Esta acción no se puede deshacer."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </>
  );
}
