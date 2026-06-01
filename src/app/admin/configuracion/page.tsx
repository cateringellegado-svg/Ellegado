"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { WHATSAPP_NUMBER } from "@/lib/constants";
import { fetchAdminLogs } from "@/lib/supabase";

interface ConfigForm {
  factor_ajuste: number;
  entorno: "produccion" | "prueba";
  capacidad_diaria_total: number;
  salado: number;
  dulce: number;
  staff: number;
  decor: number;
  whatsapp: string;
  min_invitados: number;
  max_invitados: number;
}

const DEFAULT_CONFIG: ConfigForm = {
  factor_ajuste: 1.0,
  entorno: "produccion",
  capacidad_diaria_total: 0,
  salado: 15000,
  dulce: 10000,
  staff: 6000,
  decor: 4000,
  whatsapp: WHATSAPP_NUMBER,
  min_invitados: 20,
  max_invitados: 300,
};

interface AdminLogEntry {
  id: string;
  accion: string;
  detalle: string;
  usuario_email: string;
  created_at: string;
}

export default function ConfiguracionPage() {
  const supabase = createClient();
  const [form, setForm] = useState<ConfigForm>(DEFAULT_CONFIG);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<AdminLogEntry[]>([]);
  const [activeTab, setActiveTab] = useState<"financiera" | "entorno" | "operativa" | "logs">("financiera");
  const mountedRef = useRef(true);

  const loadLogs = useCallback(async () => {
    const data = await fetchAdminLogs(20);
    if (data && mountedRef.current) setLogs(data);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    async function load() {
      if (!supabase) { if (mountedRef.current) setLoading(false); return; }
      try {
        const [configRes, siteRes] = await Promise.all([
          supabase.from("configuracion").select("*").limit(1).single(),
          supabase.from("site_config").select("*"),
        ]);
        if (configRes.data) {
          setForm((p) => ({
            ...p,
            factor_ajuste: configRes.data.factor_ajuste ?? 1.0,
            entorno: configRes.data.entorno ?? "produccion",
            capacidad_diaria_total: configRes.data.capacidad_diaria_total ?? 0,
          }));
        }
        if (siteRes.data) {
          const siteConfig: Record<string, string> = {};
          siteRes.data.forEach((c: { key: string; value: string }) => { siteConfig[c.key] = c.value; });
          const conf = siteConfig.config ? JSON.parse(siteConfig.config) : {};
          setForm((p) => ({
            ...p,
            salado: conf.salado ?? DEFAULT_CONFIG.salado,
            dulce: conf.dulce ?? DEFAULT_CONFIG.dulce,
            staff: conf.staff ?? DEFAULT_CONFIG.staff,
            decor: conf.decor ?? DEFAULT_CONFIG.decor,
            whatsapp: conf.whatsapp ?? DEFAULT_CONFIG.whatsapp,
            min_invitados: conf.min_invitados ?? DEFAULT_CONFIG.min_invitados,
            max_invitados: conf.max_invitados ?? DEFAULT_CONFIG.max_invitados,
          }));
        }
      } catch (e) {
        console.error("Error loading config:", e);
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    }
    load();
    loadLogs();
    return () => { mountedRef.current = false; };
  }, [loadLogs]);

  const saveConfig = async () => {
    if (!supabase) return;
    setSaving(true);
    setMsg("");
    try {
      const { error: configError } = await supabase.from("configuracion").upsert(
        { id: (await supabase.from("configuracion").select("id").limit(1).single()).data?.id || undefined,
          factor_ajuste: form.factor_ajuste,
          entorno: form.entorno,
          capacidad_diaria_total: form.capacidad_diaria_total,
        },
        { onConflict: "id" }
      );
      if (configError) { setMsg("Error financiero: " + configError.message); return; }

      const { error: siteError } = await supabase.from("site_config").upsert(
        { key: "config", value: JSON.stringify({
            salado: form.salado, dulce: form.dulce, staff: form.staff, decor: form.decor,
            whatsapp: form.whatsapp, min_invitados: form.min_invitados, max_invitados: form.max_invitados,
          })},
        { onConflict: "key" }
      );
      if (siteError) { setMsg("Error sitio: " + siteError.message); return; }

      await supabase.from("admin_logs").insert({
        accion: "configuracion_actualizada",
        detalle: `factor_ajuste=${form.factor_ajuste}, entorno=${form.entorno}, capacidad=${form.capacidad_diaria_total}`,
      });
      setMsg("Configuración guardada correctamente");
      loadLogs();
    } catch (e) {
      console.error("Error saving config:", e);
      setMsg("Error al guardar configuración");
    } finally {
      setSaving(false);
    }
  };

  const update = (key: keyof ConfigForm, value: string | number) => {
    setForm((p) => ({ ...p, [key]: value }));
  };

  const tabs = [
    { id: "financiera" as const, label: "Gestión Financiera", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    { id: "entorno" as const, label: "Entorno", icon: "M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.858 15.355-5.858 21.213 0" },
    { id: "operativa" as const, label: "Gestión Operativa", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
    { id: "logs" as const, label: "Trazabilidad", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  ];

  return (
    <>
      {form.entorno === "prueba" && (
        <div className="mb-6 bg-amber-50 border-2 border-amber-400 rounded-xl px-5 py-4 flex items-center gap-3">
          <span className="text-2xl">🧪</span>
          <div>
            <p className="font-semibold text-amber-800 text-sm">Modo Prueba activo</p>
            <p className="text-xs text-amber-600">Los pagos se procesan en el entorno Sandbox de Mercado Pago. No se están cobrando montos reales.</p>
          </div>
        </div>
      )}
      <h1 className="font-serif text-4xl text-dark-elegant mb-8">Configuración General</h1>

      {loading ? (
        <div className="animate-pulse bg-slate-200 rounded-2xl p-8 h-64" />
      ) : (
      <>
      <div className="flex gap-2 mb-8 border-b border-brand-copper/10 pb-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-t-xl text-sm font-medium transition-colors cursor-pointer ${
              activeTab === t.id ? "bg-white text-brand-copper border-b-2 border-brand-copper shadow-sm" : "text-slate-500 hover:text-dark-elegant"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={t.icon} />
            </svg>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "financiera" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-brand-copper/10">
            <h2 className="font-serif text-2xl text-dark-elegant mb-6">Factor de Ajuste Global</h2>
            <p className="text-sm text-slate-500 mb-4">Multiplica todos los precios del frontend. Ej: 1.25 = +25%.</p>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">factor_ajuste_precio</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={form.factor_ajuste}
                onChange={(e) => update("factor_ajuste", parseFloat(e.target.value) || 1.0)}
                className="w-full max-w-xs bg-cream border border-brand-copper/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-copper"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-brand-copper/10">
            <h2 className="font-serif text-2xl text-dark-elegant mb-6">Precios por Persona</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {([{ key: "salado", label: "Bocados Salados" }, { key: "dulce", label: "Variedad Dulce" }, { key: "staff", label: "Servicio Vajilla & Garzones" }, { key: "decor", label: "Decoración & Montaje" }] as const).map((f) => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">{f.label}</label>
                  <input type="number" value={form[f.key]} onChange={(e) => update(f.key, parseInt(e.target.value) || 0)} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-copper" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "entorno" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-brand-copper/10">
            <h2 className="font-serif text-2xl text-dark-elegant mb-6">Selector de Entorno</h2>
            <p className="text-sm text-slate-500 mb-4">
              Elegí si los pagos se procesan en producción (cobros reales) o en modo prueba (sandbox).
            </p>
            <div className="flex gap-4 mb-6">
              <button
                type="button"
                onClick={() => update("entorno", "produccion")}
                className={`flex-1 p-5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                  form.entorno === "produccion"
                    ? "border-green-500 bg-green-50 shadow-md"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${form.entorno === "produccion" ? "border-green-500" : "border-slate-300"}`}>
                    {form.entorno === "produccion" && <div className="w-2.5 h-2.5 rounded-full bg-green-500" />}
                  </div>
                  <span className="font-semibold text-dark-elegant">Producción</span>
                </div>
                <p className="text-xs text-slate-500 pl-8">Cobros reales con tarjetas y transferencias</p>
              </button>
              <button
                type="button"
                onClick={() => update("entorno", "prueba")}
                className={`flex-1 p-5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                  form.entorno === "prueba"
                    ? "border-amber-400 bg-amber-50 shadow-md"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${form.entorno === "prueba" ? "border-amber-400" : "border-slate-300"}`}>
                    {form.entorno === "prueba" && <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />}
                  </div>
                  <span className="font-semibold text-dark-elegant">Modo Prueba</span>
                </div>
                <p className="text-xs text-slate-500 pl-8">Sandbox — sin movimiento de dinero real</p>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-brand-copper/10">
            <h2 className="font-serif text-2xl text-dark-elegant mb-6">Credenciales de Mercado Pago</h2>
            <p className="text-sm text-slate-500 mb-4">Las credenciales se gestionan exclusivamente desde las Variables de Entorno de Vercel (<code className="bg-cream px-1.5 py-0.5 rounded text-[10px] font-mono">MP_ACCESS_TOKEN</code>, <code className="bg-cream px-1.5 py-0.5 rounded text-[10px] font-mono">MP_ACCESS_TOKEN_TEST</code>, <code className="bg-cream px-1.5 py-0.5 rounded text-[10px] font-mono">NEXT_PUBLIC_MP_PUBLIC_KEY</code>, <code className="bg-cream px-1.5 py-0.5 rounded text-[10px] font-mono">MP_WEBHOOK_SECRET</code>).</p>
            <p className="text-sm text-slate-500">El sistema selecciona automáticamente el token de <strong>producción</strong> o <strong>sandbox</strong> según el entorno elegido arriba.</p>
          </div>
        </div>
      )}

      {activeTab === "operativa" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-brand-copper/10">
            <h2 className="font-serif text-2xl text-dark-elegant mb-6">Capacidad Diaria Total</h2>
            <p className="text-sm text-slate-500 mb-4">Límite global de unidades que se pueden reservar por día. 0 = sin límite.</p>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">capacidad_diaria_total</label>
              <input
                type="number"
                min="0"
                step="1"
                value={form.capacidad_diaria_total}
                onChange={(e) => update("capacidad_diaria_total", parseInt(e.target.value) || 0)}
                className="w-full max-w-xs bg-cream border border-brand-copper/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-copper"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-brand-copper/10">
            <h2 className="font-serif text-2xl text-dark-elegant mb-6">Configuración WhatsApp</h2>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Número de Teléfono</label>
              <input type="text" value={form.whatsapp} onChange={(e) => update("whatsapp", e.target.value)} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-copper" placeholder={WHATSAPP_NUMBER} />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-brand-copper/10">
            <h2 className="font-serif text-2xl text-dark-elegant mb-6">Rango de Invitados</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Mínimo</label>
                <input type="number" value={form.min_invitados} onChange={(e) => update("min_invitados", parseInt(e.target.value) || 20)} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-3 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Máximo</label>
                <input type="number" value={form.max_invitados} onChange={(e) => update("max_invitados", parseInt(e.target.value) || 300)} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-3 text-sm" />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "logs" && (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-brand-copper/10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl text-dark-elegant">Trazabilidad del Sistema</h2>
            <button onClick={loadLogs} className="text-sm text-brand-copper hover:text-brand-copper-light cursor-pointer flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              Actualizar
            </button>
          </div>
          {logs.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 p-3 bg-cream rounded-lg text-sm">
                  <div className="w-2 h-2 mt-1.5 rounded-full shrink-0 bg-brand-copper/50" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-dark-elegant capitalize">{log.accion.replace(/_/g, " ")}</p>
                    {log.detalle && <p className="text-xs text-slate-500 mt-0.5">{log.detalle}</p>}
                    <p className="text-[10px] text-slate-400 mt-1">
                      {new Date(log.created_at).toLocaleString("es-AR")} · {log.usuario_email || "admin"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-sm">No hay eventos registrados aún.</div>
          )}
        </div>
      )}

      <div className="mt-8 flex items-center gap-4">
        <button onClick={saveConfig} disabled={saving} className="bg-brand-copper text-white px-8 py-3 rounded-lg shadow-lg hover:shadow-brand-copper/30 transition-all font-medium cursor-pointer disabled:opacity-50">
          {saving ? "Guardando..." : "Guardar Configuración"}
        </button>
        {msg && <p className={`text-sm ${msg.includes("Error") ? "text-red-500" : "text-green-600"}`} role="alert">{msg}</p>}
      </div>
      </>
      )}
    </>
  );
}
