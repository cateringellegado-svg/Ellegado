"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
interface ClienteSummary {
  id: string;
  nombre: string;
}

interface PagoRow {
  id: string;
  cliente_id: string;
  monto: number;
  moneda: "ARS" | "USD";
  tipo_pago: string;
  metodo_pago: string;
  fecha_pago: string;
  notas: string | null;
  created_at: string;
  clientes: { nombre: string } | null;
}

interface CotizacionResumen {
  id: string;
  cliente_nombre: string;
  tipo_evento: string;
  presupuesto: number;
  estado: string;
  created_at: string;
}

type FormPago = {
  cliente_id: string;
  monto: string;
  moneda: "ARS" | "USD";
  tipo_pago: "seña" | "parcial" | "completo" | "saldo";
  metodo_pago: "transferencia_mp" | "efectivo";
  fecha_pago: string;
  notas: string;
};

const emptyForm: FormPago = {
  cliente_id: "",
  monto: "",
  moneda: "ARS",
  tipo_pago: "completo",
  metodo_pago: "transferencia_mp",
  fecha_pago: new Date().toISOString().slice(0, 10),
  notas: "",
};

function formatARS(v: number | null | undefined) {
  if (v == null) return "$0";
  return "$" + v.toLocaleString("es-AR");
}

function formatUSD(v: number | null | undefined) {
  if (v == null) return "USD 0";
  return "USD " + v.toLocaleString("en-US");
}

function formatFecha(d: string | null | undefined) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("es-AR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function FinancieroPage() {
  const supabase = createClient();
  const [ingresosMes, setIngresosMes] = useState(0);
  const [ingresosUSD, setIngresosUSD] = useState(0);
  const [pendientes, setPendientes] = useState(0);
  const [totalClientes, setTotalClientes] = useState(0);
  const [pagosRecientes, setPagosRecientes] = useState<PagoRow[]>([]);
  const [cotizacionesPendientes, setCotizacionesPendientes] = useState<CotizacionResumen[]>([]);
  const [clientes, setClientes] = useState<ClienteSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<FormPago>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [bloquearCliente, setBloquearCliente] = useState(false);

  const mountedRef = useRef(true);

  const load = useCallback(async () => {
    if (!supabase) {
      if (mountedRef.current) setLoading(false);
      return;
    }
    try {
      const now = new Date();
      const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const [
        { data: pagosMes },
        { data: cotizacionesNuevas },
        { data: clientesData },
        { data: pagosRecent },
        { data: cotizPend },
        { count: clientesCount },
      ] = await Promise.all([
        supabase.from("pagos").select("monto, moneda").gte("fecha_pago", inicioMes),
        supabase.from("cotizaciones").select("id").eq("estado", "nueva"),
        supabase.from("clientes").select("id, nombre").order("nombre", { ascending: true }),
        supabase
          .from("pagos")
          .select("*, clientes(nombre)")
          .order("fecha_pago", { ascending: false })
          .limit(10),
        supabase
          .from("cotizaciones")
          .select("id, cliente_nombre, tipo_evento, presupuesto, estado, created_at")
          .in("estado", ["nueva", "contactada"])
          .order("created_at", { ascending: false })
          .limit(20),
        supabase.from("clientes").select("id", { count: "exact", head: true }),
      ]);

      let totalARS = 0;
      let totalUSD = 0;
      (pagosMes || []).forEach((p: { monto: number; moneda: string }) => {
        if (p.moneda === "USD") totalUSD += p.monto;
        else totalARS += p.monto;
      });

      if (mountedRef.current) {
        setIngresosMes(totalARS);
        setIngresosUSD(totalUSD);
        setPendientes(cotizacionesNuevas?.length ?? 0);
        setTotalClientes(clientesCount ?? 0);
        setPagosRecientes(pagosRecent || []);
        setCotizacionesPendientes(cotizPend || []);
        setClientes(clientesData || []);
      }
    } catch (e) {
      console.error("Error loading financiero data:", e);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    mountedRef.current = true;
    load();
    return () => {
      mountedRef.current = false;
    };
  }, [load]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleSavePago = async () => {
    if (!supabase) return;
    setSaving(true);
    setMsg("");

    const monto = Number(form.monto);
    if (!form.cliente_id || isNaN(monto) || monto <= 0) {
      setMsg("Completá todos los campos obligatorios.");
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("pagos").insert({
      cliente_id: form.cliente_id,
      monto,
      moneda: form.moneda,
      tipo_pago: form.tipo_pago,
      metodo_pago: form.metodo_pago,
      fecha_pago: form.fecha_pago,
      notas: form.notas || null,
    });

    if (error) {
      setMsg("Error al guardar: " + error.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    setShowModal(false);
    setForm(emptyForm);
    setBloquearCliente(false);
    load();
  };

  const openPagoModal = (prefill?: { cliente_id?: string; cliente_nombre?: string }) => {
    setForm({
      ...emptyForm,
      cliente_id: prefill?.cliente_id ?? "",
    });
    setBloquearCliente(!!prefill?.cliente_id);
    setMsg("");
    setShowModal(true);
  };

  const ingresosDisplay =
    ingresosMes > 0 || ingresosUSD > 0
      ? `${formatARS(ingresosMes)}${ingresosUSD > 0 ? ` · ${formatUSD(ingresosUSD)}` : ""}`
      : "$0";

  const cards = [
    {
      label: "Ingresos del Mes",
      value: ingresosDisplay,
      sub: "Pagos registrados",
      icon: "money",
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      label: "Cotizaciones Pendientes",
      value: pendientes,
      sub: "Esperando respuesta",
      icon: "clock",
      color: "bg-amber-100 text-amber-600",
    },
    {
      label: "Clientes Registrados",
      value: totalClientes,
      sub: "Base de datos",
      icon: "users",
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Presupuestos en Curso",
      value: cotizacionesPendientes.length,
      sub: "Nuevas + Contactadas",
      icon: "document",
      color: "bg-brand-copper/10 text-brand-copper",
    },
  ];

  if (loading) {
    return (
      <>
        <h1 className="font-serif text-4xl text-dark-elegant mb-8">Finanzas</h1>
        <div className="animate-pulse bg-slate-200 rounded-2xl p-8 h-64" />
      </>
    );
  }

  return (
    <>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <h1 className="font-serif text-4xl text-dark-elegant">Finanzas</h1>
        <button
          onClick={() => openPagoModal()}
          className="flex items-center gap-2 bg-brand-copper text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-copper-light transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Registrar Pago
        </button>
      </div>

      {msg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-6" role="alert">
          {msg}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-2xl p-6 shadow-lg border border-brand-copper/10 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {card.label}
              </span>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${card.color}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {card.icon === "money" ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  ) : card.icon === "clock" ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  ) : card.icon === "users" ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  )}
                </svg>
              </div>
            </div>
            <p className="text-2xl font-serif text-dark-elegant truncate">{card.value}</p>
            <p className="text-xs text-slate-500 mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-brand-copper/10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-xl text-dark-elegant">Últimos Pagos</h2>
            <span className="text-xs text-slate-400 bg-cream px-3 py-1 rounded-full">
              {pagosRecientes.length} registrados
            </span>
          </div>

          {pagosRecientes.length > 0 ? (
            <div className="space-y-3">
              {pagosRecientes.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-4 bg-cream rounded-xl hover:bg-cream/80 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-dark-elegant text-sm truncate">
                      {p.clientes?.nombre || "Cliente"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatFecha(p.fecha_pago)} · {p.metodo_pago === "transferencia_mp" ? "Transf. MP" : "Efectivo"} · {p.tipo_pago}
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="font-serif text-brand-copper text-sm">
                      {p.moneda === "USD" ? formatUSD(p.monto) : formatARS(p.monto)}
                    </p>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full ${
                        p.metodo_pago === "transferencia_mp"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {p.metodo_pago === "transferencia_mp" ? "MP" : "Efect."}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg
                className="w-12 h-12 mx-auto text-slate-300 mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <p className="text-sm text-slate-400">No hay pagos registrados este mes</p>
              <button
                onClick={() => openPagoModal()}
                className="mt-3 text-brand-copper text-sm hover:text-brand-copper-light cursor-pointer"
              >
                Registrar el primer pago
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-brand-copper/10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-xl text-dark-elegant">Cotizaciones Pendientes</h2>
            <span className="text-xs text-slate-400 bg-cream px-3 py-1 rounded-full">
              {cotizacionesPendientes.length} abiertas
            </span>
          </div>

          {cotizacionesPendientes.length > 0 ? (
            <div className="space-y-3">
              {cotizacionesPendientes.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-4 bg-cream rounded-xl">
                  <div className="min-w-0">
                    <p className="font-medium text-dark-elegant text-sm truncate">
                      {c.cliente_nombre || "Sin nombre"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {c.tipo_evento || "Sin tipo"} · {formatFecha(c.created_at)}
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-4 flex items-center gap-2">
                    <span className="font-serif text-brand-copper text-sm">
                      {formatARS(c.presupuesto)}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full ${
                        c.estado === "nueva"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {c.estado}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg
                className="w-12 h-12 mx-auto text-slate-300 mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm text-slate-400">No hay cotizaciones pendientes</p>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Registrar Pago Manual"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-serif text-2xl text-dark-elegant">Registrar Pago Manual</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-500 hover:text-dark-elegant cursor-pointer"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Cliente <span className="text-red-400">*</span>
                </label>
                <select
                  value={form.cliente_id}
                  onChange={(e) => setForm({ ...form, cliente_id: e.target.value })}
                  disabled={bloquearCliente}
                  className={`w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-2.5 text-sm ${
                    bloquearCliente ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                >
                  <option value="">Seleccionar cliente</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Monto <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={form.monto}
                    onChange={(e) => setForm({ ...form, monto: e.target.value })}
                    placeholder="0.00"
                    className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Moneda
                  </label>
                  <select
                    value={form.moneda}
                    onChange={(e) => setForm({ ...form, moneda: e.target.value as "ARS" | "USD" })}
                    className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-2.5 text-sm"
                  >
                    <option value="ARS">ARS ($)</option>
                    <option value="USD">USD (US$)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Tipo de Pago
                  </label>
                  <select
                    value={form.tipo_pago}
                    onChange={(e) =>
                      setForm({ ...form, tipo_pago: e.target.value as "seña" | "parcial" | "completo" | "saldo" })
                    }
                    className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-2.5 text-sm"
                  >
                    <option value="completo">Completo</option>
                    <option value="seña">Seña</option>
                    <option value="parcial">Parcial</option>
                    <option value="saldo">Saldo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Método de Pago
                  </label>
                  <select
                    value={form.metodo_pago}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        metodo_pago: e.target.value as "transferencia_mp" | "efectivo",
                      })
                    }
                    className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-2.5 text-sm"
                  >
                    <option value="transferencia_mp">Transferencia MP</option>
                    <option value="efectivo">Efectivo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Fecha del Pago
                </label>
                <input
                  type="date"
                  value={form.fecha_pago}
                  onChange={(e) => setForm({ ...form, fecha_pago: e.target.value })}
                  className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Notas
                </label>
                <textarea
                  rows={2}
                  value={form.notas}
                  onChange={(e) => setForm({ ...form, notas: e.target.value })}
                  placeholder="Referencia, evento asociado, etc."
                  className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-2.5 text-sm resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-brand-copper/20 rounded-lg text-sm text-slate-600 hover:bg-cream transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSavePago}
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-brand-copper text-white rounded-lg text-sm font-medium hover:bg-brand-copper-light transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {saving ? "Guardando..." : "Registrar Pago"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
