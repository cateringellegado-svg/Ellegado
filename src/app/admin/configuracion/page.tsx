"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { WHATSAPP_NUMBER } from "@/lib/constants";

interface ConfigForm {
  salado: number;
  dulce: number;
  staff: number;
  decor: number;
  whatsapp: string;
  min_invitados: number;
  max_invitados: number;
}

const DEFAULT_CONFIG: ConfigForm = {
  salado: 15000,
  dulce: 10000,
  staff: 6000,
  decor: 4000,
  whatsapp: WHATSAPP_NUMBER,
  min_invitados: 20,
  max_invitados: 300,
};

export default function ConfiguracionPage() {
  const [form, setForm] = useState<ConfigForm>(DEFAULT_CONFIG);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    async function load() {
      if (!supabase) return;
      const { data } = await supabase.from("site_config").select("*");
      if (!data) return;
      const config: Record<string, string> = {};
      data.forEach((c: { key: string; value: string }) => { config[c.key] = c.value; });
      const conf = config.config ? JSON.parse(config.config) : {};
      setForm({
        salado: conf.salado ?? DEFAULT_CONFIG.salado,
        dulce: conf.dulce ?? DEFAULT_CONFIG.dulce,
        staff: conf.staff ?? DEFAULT_CONFIG.staff,
        decor: conf.decor ?? DEFAULT_CONFIG.decor,
        whatsapp: conf.whatsapp ?? DEFAULT_CONFIG.whatsapp,
        min_invitados: conf.min_invitados ?? DEFAULT_CONFIG.min_invitados,
        max_invitados: conf.max_invitados ?? DEFAULT_CONFIG.max_invitados,
      });
    }
    load();
  }, []);

  const saveConfig = async () => {
    if (!supabase) return;
    setSaving(true);
    setMsg("");
    const configValue = JSON.stringify(form);
    const { error } = await supabase.from("site_config").upsert(
      { key: "config", value: configValue },
      { onConflict: "key" }
    );
    if (error) {
      setMsg("Error al guardar: " + error.message);
    } else {
      setMsg("Configuración guardada correctamente");
    }
    setSaving(false);
  };

  const update = (key: keyof ConfigForm, value: string | number) => {
    setForm((p) => ({ ...p, [key]: value }));
  };

  return (
    <>
      <h1 className="font-serif text-4xl text-dark-elegant mb-8">Configuración</h1>

      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-brand-copper/10">
          <h2 className="font-serif text-2xl text-dark-elegant mb-6">Precios por Persona</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {([
              { key: "salado", label: "Bocados Salados" },
              { key: "dulce", label: "Variedad Dulce" },
              { key: "staff", label: "Servicio Vajilla & Garzones" },
              { key: "decor", label: "Decoración & Montaje" },
            ] as const).map((f) => (
              <div key={f.key}>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">{f.label}</label>
                <input type="number" value={form[f.key]} onChange={(e) => update(f.key, parseInt(e.target.value) || 0)} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-copper" />
              </div>
            ))}
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

        <button onClick={saveConfig} disabled={saving} className="bg-brand-copper text-white px-8 py-3 rounded-lg shadow-lg hover:shadow-brand-copper/30 transition-all font-medium cursor-pointer disabled:opacity-50">
          {saving ? "Guardando..." : "Guardar Configuración"}
        </button>
        {msg && <p className={`text-sm ${msg.includes("Error") ? "text-red-500" : "text-green-600"}`}>{msg}</p>}
      </div>
    </>
  );
}
