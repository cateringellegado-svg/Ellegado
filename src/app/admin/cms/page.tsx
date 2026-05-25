"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { WHATSAPP_NUMBER } from "@/lib/constants";
import { uploadSiteImage, deleteSiteImage } from "@/lib/storage";

interface CMSConfig {
  colors: Record<string, string>;
  hero: Record<string, string | { value: string; label: string }[]>;
  about: Record<string, string>;
  festin: Record<string, string>;
  footer: Record<string, string>;
  social: Record<string, string>;
  contact: Record<string, string>;
  sections: Record<string, boolean>;
  images: Record<string, string>;
}

const DEFAULT_CMS: CMSConfig = {
  colors: {
    primary: "#AF7A54",
    primaryLight: "#D9A78B",
    background: "#FAF9F6",
    text: "#1A1A1A",
    textSecondary: "#64748B",
  },
  hero: {
    title: "El Legado",
    ctaText: "Cotizá tu evento",
    stats: [
      { value: "100+", label: "Eventos" },
      { value: "5", label: "Años Exp." },
      { value: "100%", label: "Dedicación" },
    ],
  },
  about: {},
  festin: {},
  footer: {},
  social: {},
  contact: {},
  sections: {
    hero: true,
    about: true,
    festin: true,
    gallery: true,
    testimonials: true,
    contact: true,
    comingSoon: true,
    footer: true,
  },
  images: {},
};

const IMAGE_FIELDS = [
  { key: "logo", label: "Logo" },
  { key: "hero", label: "Hero (Fondo)" },
  { key: "about", label: "Filosofía" },
  { key: "festin", label: "Festín (Banner)" },
  { key: "favicon", label: "Favicon" },
];

export default function CMSPage() {
  const [config, setConfig] = useState<CMSConfig>(DEFAULT_CMS);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [uploading, setUploading] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleImageUpload = async (key: string, file: File) => {
    setUploading(key);
    try {
      const oldUrl = config.images[key];
      if (oldUrl) await deleteSiteImage(oldUrl);
      const publicUrl = await uploadSiteImage(file);
      if (publicUrl) {
        setConfig((p) => ({ ...p, images: { ...p.images, [key]: publicUrl } }));
      }
    } catch (err) {
      setMsg("Error al subir imagen: " + (err instanceof Error ? err.message : "desconocido"));
    } finally {
      setUploading(null);
    }
  };

  const removeImage = async (key: string) => {
    const oldUrl = config.images[key];
    if (oldUrl) await deleteSiteImage(oldUrl);
    setConfig((p) => ({ ...p, images: { ...p.images, [key]: "" } }));
  };

  useEffect(() => {
    async function load() {
      if (!supabase) return;
      const { data } = await supabase.from("site_config").select("*");
      if (!data) return;
      const map: Record<string, string> = {};
      data.forEach((c: { key: string; value: string }) => { map[c.key] = c.value; });
      if (map.colors) setConfig((p) => ({ ...p, colors: tryParse(map.colors, p.colors) }));
      if (map.hero) setConfig((p) => ({ ...p, hero: tryParse(map.hero, p.hero) }));
      if (map.about) setConfig((p) => ({ ...p, about: tryParse(map.about, p.about) }));
      if (map.festin) setConfig((p) => ({ ...p, festin: tryParse(map.festin, p.festin) }));
      if (map.footer) setConfig((p) => ({ ...p, footer: tryParse(map.footer, p.footer) }));
      if (map.social) setConfig((p) => ({ ...p, social: tryParse(map.social, p.social) }));
      if (map.contact) setConfig((p) => ({ ...p, contact: tryParse(map.contact, p.contact) }));
      if (map.sections) setConfig((p) => ({ ...p, sections: tryParse(map.sections, p.sections) }));
      if (map.images) setConfig((p) => ({ ...p, images: tryParse(map.images, p.images) }));
    }
    load();
  }, []);

  const tryParse = (val: string, fallback: unknown) => {
    try { return JSON.parse(val); } catch { return fallback; }
  };

  const save = async (key: string, value: unknown) => {
    if (!supabase) return;
    setSaving(true);
    const { error } = await supabase.from("site_config").upsert(
      { key, value: JSON.stringify(value) },
      { onConflict: "key" }
    );
    if (error) setMsg("Error: " + error.message);
    else setMsg(`"${key}" guardado`);
    setSaving(false);
  };

  const saveAll = async () => {
    setSaving(true);
    setMsg("");
    const entries = [
      ["colors", config.colors],
      ["hero", config.hero],
      ["about", config.about],
      ["festin", config.festin],
      ["footer", config.footer],
      ["social", config.social],
      ["contact", config.contact],
      ["sections", config.sections],
      ["images", config.images],
    ] as const;
    for (const [key, val] of entries) {
      await supabase?.from("site_config").upsert({ key, value: JSON.stringify(val) }, { onConflict: "key" });
    }
    setMsg("Toda la configuración guardada");
    setSaving(false);
  };

  const setColor = (key: string, val: string) => setConfig((p) => ({ ...p, colors: { ...p.colors, [key]: val } }));
  const setHero = (key: string, val: string) => setConfig((p) => ({ ...p, hero: { ...p.hero, [key]: val } }));
  const setAbout = (key: string, val: string) => setConfig((p) => ({ ...p, about: { ...p.about, [key]: val } }));
  const setFestin = (key: string, val: string) => setConfig((p) => ({ ...p, festin: { ...p.festin, [key]: val } }));
  const setSocial = (key: string, val: string) => setConfig((p) => ({ ...p, social: { ...p.social, [key]: val } }));
  const setContact = (key: string, val: string) => setConfig((p) => ({ ...p, contact: { ...p.contact, [key]: val } }));
  const toggleSection = (key: string) => setConfig((p) => ({ ...p, sections: { ...p.sections, [key]: !p.sections[key] } }));

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-serif text-4xl text-dark-elegant">CMS del Sitio</h1>
        <button onClick={saveAll} disabled={saving} className="bg-brand-copper text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-brand-copper/30 transition-all text-sm font-medium cursor-pointer disabled:opacity-50">
          {saving ? "Guardando..." : "Guardar Todo"}
        </button>
      </div>

      {msg && <p className={`mb-4 text-sm ${msg.includes("Error") ? "text-red-500" : "text-green-600"}`}>{msg}</p>}

      <div className="space-y-8">
        {/* Colors */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-brand-copper/10">
          <h2 className="font-serif text-2xl text-dark-elegant mb-6">Apariencia y Colores</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { key: "primary", label: "Color Primario" },
              { key: "primaryLight", label: "Color Primario Claro" },
              { key: "background", label: "Color de Fondo" },
              { key: "text", label: "Color de Texto" },
              { key: "textSecondary", label: "Color Texto Secundario" },
            ].map((c) => (
              <div key={c.key}>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">{c.label}</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={config.colors[c.key] || "#000000"} onChange={(e) => setColor(c.key, e.target.value)} className="w-12 h-12 rounded-lg border-2 border-brand-copper/20 cursor-pointer" />
                  <input type="text" value={config.colors[c.key] || ""} readOnly className="flex-1 bg-cream border border-brand-copper/20 rounded-lg px-3 py-2 text-sm font-mono" />
                </div>
              </div>
            ))}
          </div>
          <div id="cms-color-preview" className="mt-6 p-6 bg-cream rounded-xl border-2 border-brand-copper/20" style={{ backgroundColor: config.colors.background, borderColor: config.colors.primary + "33" }}>
            <p className="font-serif text-2xl mb-2" style={{ color: config.colors.primary }}>Vista Previa</p>
            <p style={{ color: config.colors.text }} className="text-sm">Así se verán los colores en el sitio público.</p>
            <button className="mt-3 px-4 py-2 rounded-lg text-sm text-white" style={{ backgroundColor: config.colors.primary }}>Botón de ejemplo</button>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-brand-copper/10">
          <h2 className="font-serif text-2xl text-dark-elegant mb-6">Imágenes del Sitio</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {IMAGE_FIELDS.map((f) => (
              <div key={f.key}>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">{f.label}</label>
                <div
                  onClick={() => fileRefs.current[f.key]?.click()}
                  className="relative border-2 border-dashed border-brand-copper/20 rounded-xl overflow-hidden cursor-pointer hover:border-brand-copper/40 transition-all h-32 flex items-center justify-center bg-cream"
                >
                  <input
                    ref={(el) => { fileRefs.current[f.key] = el; }}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(f.key, file);
                      if (e.target) e.target.value = "";
                    }}
                    className="hidden"
                  />
                  {uploading === f.key ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-3 border-brand-copper/20 border-t-brand-copper rounded-full animate-spin" />
                      <span className="text-xs text-slate-400">Subiendo...</span>
                    </div>
                  ) : config.images[f.key] ? (
                    <div className="relative w-full h-full group">
                      <img src={config.images[f.key]} alt={f.label} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-all">
                        <span className="text-white text-xs opacity-0 group-hover:opacity-100">Click para cambiar</span>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeImage(f.key); }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                        aria-label={`Eliminar ${f.label}`}
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-slate-300">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <span className="text-xs">Subir imagen</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hero */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-brand-copper/10">
          <h2 className="font-serif text-2xl text-dark-elegant mb-6">Sección Hero</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Título</label>
              <input type="text" value={(config.hero.title as string) || ""} onChange={(e) => setHero("title", e.target.value)} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-copper" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Subtítulo</label>
              <input type="text" value={(config.hero.subtitle as string) || ""} onChange={(e) => setHero("subtitle", e.target.value)} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-3 text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Tagline (debajo del título)</label>
              <textarea rows={2} value={(config.hero.tagline as string) || ""} onChange={(e) => setHero("tagline", e.target.value)} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-3 text-sm italic resize-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Texto CTA</label>
              <input type="text" value={(config.hero.ctaText as string) || ""} onChange={(e) => setHero("ctaText", e.target.value)} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-3 text-sm" />
            </div>
          </div>
        </div>

        {/* About */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-brand-copper/10">
          <h2 className="font-serif text-2xl text-dark-elegant mb-6">Sección Nuestra Filosofía</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Título</label>
              <input type="text" value={config.about.title || ""} onChange={(e) => setAbout("title", e.target.value)} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-3 text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Frase Principal</label>
              <textarea rows={2} value={config.about.text || ""} onChange={(e) => setAbout("text", e.target.value)} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-3 text-sm italic resize-none" />
            </div>
          </div>
        </div>

        {/* Social */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-brand-copper/10">
          <h2 className="font-serif text-2xl text-dark-elegant mb-6">Redes Sociales</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {["instagram", "facebook", "tiktok"].map((platform) => (
              <div key={platform}>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">{platform.charAt(0).toUpperCase() + platform.slice(1)} URL</label>
                <input type="url" value={config.social[platform] || ""} onChange={(e) => setSocial(platform, e.target.value)} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-3 text-sm" placeholder={`https://${platform}.com/...`} />
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-brand-copper/10">
          <h2 className="font-serif text-2xl text-dark-elegant mb-6">Contacto</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Email</label>
              <input type="email" value={config.contact.email || ""} onChange={(e) => setContact("email", e.target.value)} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-3 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">WhatsApp</label>
              <input type="tel" value={config.contact.whatsapp || ""} onChange={(e) => setContact("whatsapp", e.target.value)} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-3 text-sm" placeholder={WHATSAPP_NUMBER} />
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-brand-copper/10">
          <h2 className="font-serif text-2xl text-dark-elegant mb-6">Mostrar/Ocultar Secciones</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(config.sections).map(([key, val]) => (
              <label key={key} className="flex items-center gap-3 p-3 bg-cream rounded-lg cursor-pointer hover:bg-cream/80 transition-colors">
                <input type="checkbox" checked={val} onChange={() => toggleSection(key)} className="w-4 h-4 text-brand-copper rounded" />
                <span className="text-sm text-dark-elegant capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
