"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { WHATSAPP_NUMBER } from "@/lib/constants";
import { uploadSiteImage, deleteSiteImage } from "@/lib/storage";
import { fetchAllCombosAdmin, updateComboAdmin, createComboAdmin, deleteComboAdmin } from "@/lib/supabase";
import ConfirmDialog from "@/components/ConfirmDialog";
import type { Combo, ComboItem } from "@/types";

interface CMSConfig {
  colors: Record<string, string>;
  hero: Record<string, string | { value: string; label: string }[]>;
  about: Record<string, string>;
  festin: Record<string, string>;
  footer: Record<string, string | { days: string; hours: string }[]>;
  social: Record<string, string>;
  contact: Record<string, string>;
  sections: Record<string, boolean>;
  images: Record<string, string | string[]>;
  seo: Record<string, string | string[]>;
  features: Record<string, string | { icon: string; title: string; text: string }[]>;
  cta: Record<string, string>;
  comingSoon: Record<string, string | { title: string; description: string; icon: string }[]>;
  navbar: Record<string, string | { label: string; href: string }[]>;
  politicas_contratacion: string;
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
    subtitle: "Haz Eterno Cada Momento",
    tagline: "Servicio de catering premium para eventos inolvidables, con la cercanía que tú te mereces.",
    ctaText: "Cotizá tu evento",
    stats: [
      { value: "100+", label: "Eventos" },
      { value: "5", label: "Años Exp." },
      { value: "100%", label: "Dedicación" },
    ],
  },
  about: { title: "Nuestra Filosofía", text: "Cada evento es una historia única que merece ser contada con los sabores más exquisitos y la atención más cálida.", highlight: "Tradición, calidad y pasión en cada bocado." },
  festin: { title: "El Festín", subtitle: "Elegí los bocados que harán de tu evento una experiencia inolvidable", ctaText: "Cotizá tu evento" },
  footer: { text: "Haz Eterno Cada Momento", copyright: "© 2026 El Legado. Todos los derechos reservados.", address: "Buenos Aires, Argentina", phone: "+54 11 7675-3854", mapUrl: "https://maps.google.com", schedule: [{ days: "Lunes a Viernes", hours: "9:00 – 20:00" }, { days: "Sábados", hours: "10:00 – 18:00" }] },
  social: { instagram: "https://instagram.com/ellegado.catering", facebook: "https://facebook.com/ellegado.catering", tiktok: "" },
  contact: { email: "catering.ellegado@gmail.com", whatsapp: "541176753854" },
  sections: { hero: true, about: true, festin: true, gallery: true, testimonials: true, contact: true, comingSoon: true, footer: true },
  images: { hero: "/hero_catering.webp", about: "", festin: "/gourmet_canapes.webp", logo: "/logo.webp", favicon: "/favicon.webp", gallery: ["/hero_catering.webp", "/event_vibe.webp", "/gourmet_canapes.webp"] },
  seo: { metaTitle: "EL LEGADO - Catering y Eventos | Haz Eterno Cada Momento", metaDescription: "Servicio de catering premium para eventos inolvidables.", keywords: ["catering", "eventos", "premium"], ogImage: "/hero_catering.webp" },
  features: { title: "¿Por Qué Elegirnos?", items: [{ icon: "chef", title: "Cocina Artesanal", text: "Cada bocado es preparado con ingredientes seleccionados." }, { icon: "sparkles", title: "Presentación Impecable", text: "Cada plato como una obra maestra visual." }, { icon: "heart", title: "Atención Personalizada", text: "Escuchamos tus ideas." }, { icon: "star", title: "Calidad Premium", text: "Estándares que superan expectativas." }] },
  cta: { title: "¿Listo para tu evento perfecto?", text: "Contactanos hoy y empecemos a planificar juntos.", buttonText: "Cotizá tu Evento" },
  comingSoon: { title: "Próximamente", items: [{ title: "Bowls Saludables", description: "Bowls nutritivos", icon: "bowl" }, { title: "Barra de Smoothies", description: "Estación interactiva", icon: "smoothie" }, { title: "Noche de Parrilla", description: "Experiencia de parrilla", icon: "grill" }, { title: "Cheese & Wine", description: "Selección de quesos", icon: "cheese" }] },
  navbar: { logoUrl: "/logo.webp", links: [{ label: "Inicio", href: "#hero" }, { label: "Nosotros", href: "#about" }, { label: "Festín", href: "#festin" }, { label: "Galería", href: "#gallery" }, { label: "Contacto", href: "#contact" }] },
  politicas_contratacion: "",
};

const IMAGE_FIELDS = [
  { key: "logo", label: "Logo" },
  { key: "hero", label: "Hero (Fondo)" },
  { key: "about", label: "Filosofía" },
  { key: "festin", label: "Festín (Banner)" },
  { key: "favicon", label: "Favicon" },
];

const ICON_OPTIONS = [
  { value: "chef", label: "Chef" },
  { value: "sparkles", label: "Sparkles" },
  { value: "heart", label: "Heart" },
  { value: "star", label: "Star" },
  { value: "bowl", label: "Bowl" },
  { value: "smoothie", label: "Smoothie" },
  { value: "grill", label: "Grill" },
  { value: "cheese", label: "Cheese" },
];

const tryParse = (val: string, fallback: unknown) => {
  try { return JSON.parse(val); } catch { return fallback; }
};

function sanitize(val: string) {
  return val.replace(/<[^>]*>/g, "").replace(/[<>]/g, "");
}

export default function CMSPage() {
  const supabase = createClient();
  const [config, setConfig] = useState<CMSConfig>(DEFAULT_CMS);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [uploading, setUploading] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("general");
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [activeSection, setActiveSection] = useState("colors");
  const [combos, setCombos] = useState<Combo[]>([]);
  const [comboSaving, setComboSaving] = useState<string | null>(null);
  const [comboMsg, setComboMsg] = useState("");
  const [showNewCombo, setShowNewCombo] = useState(false);
  const [newCombo, setNewCombo] = useState<Partial<Combo>>({});
  const [newComboItems, setNewComboItems] = useState<ComboItem[]>([]);
  const [confirmDeleteCombo, setConfirmDeleteCombo] = useState<string | null>(null);

  useEffect(() => {
    fetchAllCombosAdmin().then((d) => { if (d) setCombos(d); });
  }, []);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    async function load() {
      if (!supabase) { if (mountedRef.current) setLoading(false); return; }
      try {
        const { data } = await supabase.from("site_config").select("*");
        if (!data) return;
        const map: Record<string, string> = {};
        data.forEach((c: { key: string; value: string }) => { map[c.key] = c.value; });
        const keys = ["colors", "hero", "about", "festin", "footer", "social", "contact", "sections", "images", "seo", "features", "cta", "comingSoon", "navbar", "politicas_contratacion"] as const;
        keys.forEach((k) => {
          if (map[k]) setConfig((p) => ({ ...p, [k]: tryParse(map[k], p[k]) }));
        });
      } catch (e) {
        console.error("Error loading CMS config:", e);
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    }
    load();
    return () => { mountedRef.current = false; };
  }, []);

  const save = async (key: string, value: unknown) => {
    if (!supabase) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("site_config").upsert(
        { key, value: JSON.stringify(value) },
        { onConflict: "key" }
      );
      if (error) setMsg("Error: " + error.message);
      else setMsg(`"${key}" guardado`);
    } catch (e) {
      console.error("Error saving CMS config:", e);
      setMsg("Error al guardar configuración");
    } finally {
      setSaving(false);
    }
  };

  const saveAll = async () => {
    setSaving(true);
    setMsg("");
    try {
      const keys: (keyof CMSConfig)[] = ["colors", "hero", "about", "festin", "footer", "social", "contact", "sections", "images", "seo", "features", "cta", "comingSoon", "navbar", "politicas_contratacion"];
      const errors: string[] = [];
      for (const key of keys) {
        const { error } = await supabase?.from("site_config").upsert({ key, value: JSON.stringify(config[key]) }, { onConflict: "key" }) ?? {};
        if (error) errors.push(`${key}: ${error.message}`);
      }
      setMsg(errors.length ? "Error en: " + errors.join(", ") : "Configuración guardada correctamente");
    } catch (e) {
      console.error("Error saving all CMS config:", e);
      setMsg("Error al guardar toda la configuración");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (key: string, file: File) => {
    setUploading(key);
    try {
      const oldUrl = config.images[key] as string;
      if (oldUrl && oldUrl.startsWith("http")) await deleteSiteImage(oldUrl);
      const publicUrl = await uploadSiteImage(file);
      if (publicUrl) setConfig((p) => ({ ...p, images: { ...p.images, [key]: publicUrl } }));
    } catch (err) {
      setMsg("Error al subir imagen: " + (err instanceof Error ? err.message : "desconocido"));
    } finally { setUploading(null); }
  };

  const removeImage = async (key: string) => {
    const oldUrl = config.images[key] as string;
    if (oldUrl && oldUrl.startsWith("http")) await deleteSiteImage(oldUrl);
    setConfig((p) => ({ ...p, images: { ...p.images, [key]: "" } }));
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading("gallery");
    try {
      const publicUrl = await uploadSiteImage(file);
      if (publicUrl) {
        const gallery = config.images.gallery as string[] || [];
        setConfig((p) => ({ ...p, images: { ...p.images, gallery: [...gallery, publicUrl] } }));
      }
    } catch (err) {
      setMsg("Error al subir imagen de galería");
    } finally { setUploading(null); }
    if (e.target) e.target.value = "";
  };

  const removeGalleryImage = (index: number) => {
    const gallery = config.images.gallery as string[] || [];
    setConfig((p) => ({ ...p, images: { ...p.images, gallery: gallery.filter((_, i) => i !== index) } }));
  };

  const sections: { id: string; label: string }[] = [
    { id: "colors", label: "Colores" },
    { id: "images", label: "Imágenes" },
    { id: "seo", label: "SEO" },
    { id: "hero", label: "Hero" },
    { id: "about", label: "Filosofía" },
    { id: "festin", label: "Festín" },
    { id: "features", label: "Por Qué Elegirnos" },
    { id: "cta", label: "CTA" },
    { id: "comingSoon", label: "Próximamente" },
    { id: "navbar", label: "Navegación" },
    { id: "footer", label: "Footer" },
    { id: "social", label: "Redes Sociales" },
    { id: "contact", label: "Contacto" },
    { id: "sections", label: "Secciones" },
    { id: "combos", label: "Combos" },
    { id: "legal", label: "Legal" },
  ];

  return (
    <>
      {loading ? (
        <div className="animate-pulse bg-slate-200 rounded-2xl p-8 h-64" />
      ) : (
      <>
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-serif text-4xl text-dark-elegant">CMS del Sitio</h1>
        <button onClick={saveAll} disabled={saving} className="bg-brand-copper text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-brand-copper/30 transition-all text-sm font-medium cursor-pointer disabled:opacity-50">
          {saving ? "Guardando..." : "Guardar Todo"}
        </button>
      </div>

      {msg && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${msg.includes("Error") ? "bg-red-50 text-red-600 border border-red-200" : "bg-green-50 text-green-600 border border-green-200"}`} role="alert">
          <div className="flex justify-between items-center">
            <span>{msg}</span>
            <button onClick={() => setMsg("")} className="ml-4 text-current opacity-50 hover:opacity-100 cursor-pointer">×</button>
          </div>
        </div>
      )}

      <div className="flex gap-6">
        <nav className="w-56 shrink-0 space-y-1">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors cursor-pointer ${
                activeSection === s.id ? "bg-brand-copper text-white font-medium" : "text-slate-600 hover:bg-brand-copper/10"
              }`}
            >
              {s.label}
            </button>
          ))}
        </nav>

        <div className="flex-1 space-y-8">
          {activeSection === "colors" && (
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
                      <input type="color" value={config.colors[c.key] || "#000000"} onChange={(e) => setConfig((p) => ({ ...p, colors: { ...p.colors, [c.key]: e.target.value } }))} className="w-12 h-12 rounded-lg border-2 border-brand-copper/20 cursor-pointer" />
                      <input type="text" value={config.colors[c.key] || ""} readOnly className="flex-1 bg-cream border border-brand-copper/20 rounded-lg px-3 py-2 text-sm font-mono" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-6 bg-cream rounded-xl border-2" style={{ backgroundColor: config.colors.background, borderColor: config.colors.primary + "33" }}>
                <p className="font-serif text-2xl mb-2" style={{ color: config.colors.primary }}>Vista Previa</p>
                <p style={{ color: config.colors.text }} className="text-sm">Así se verán los colores en el sitio público.</p>
                <button className="mt-3 px-4 py-2 rounded-lg text-sm text-white" style={{ backgroundColor: config.colors.primary }}>Botón de ejemplo</button>
              </div>
            </div>
          )}

          {activeSection === "images" && (
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-brand-copper/10">
              <h2 className="font-serif text-2xl text-dark-elegant mb-6">Imágenes del Sitio</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {IMAGE_FIELDS.map((f) => (
                  <div key={f.key}>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">{f.label}</label>
                    <div onClick={() => fileRefs.current[f.key]?.click()} className="relative border-2 border-dashed border-brand-copper/20 rounded-xl overflow-hidden cursor-pointer hover:border-brand-copper/40 transition-all h-32 flex items-center justify-center bg-cream">
                      <input ref={(el) => { fileRefs.current[f.key] = el; }} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleImageUpload(f.key, file); if (e.target) e.target.value = ""; }} className="hidden" />
                      {uploading === f.key ? (
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-8 h-8 border-3 border-brand-copper/20 border-t-brand-copper rounded-full animate-spin" />
                          <span className="text-xs text-slate-400">Subiendo...</span>
                        </div>
                      ) : config.images[f.key] ? (
                        <div className="relative w-full h-full group">
                          <Image src={config.images[f.key] as string} alt={f.label} width={800} height={600} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-all"><span className="text-white text-xs opacity-0 group-hover:opacity-100">Click para cambiar</span></div>
                          <button onClick={(e) => { e.stopPropagation(); removeImage(f.key); }} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-all cursor-pointer" aria-label={`Eliminar ${f.label}`}>×</button>
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
              <div className="mt-8">
                <h3 className="font-serif text-xl text-dark-elegant mb-4">Galería de Imágenes</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {(config.images.gallery as string[] || []).map((url, i) => (
                    <div key={url + '-' + i} className="relative group rounded-xl overflow-hidden aspect-[4/3] border border-brand-copper/10">
                      <Image src={url} alt={`Galería ${i + 1}`} width={800} height={600} className="w-full h-full object-cover" />
                      <button onClick={() => removeGalleryImage(i)} className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-all cursor-pointer" aria-label="Eliminar imagen">×</button>
                    </div>
                  ))}
                  <label className="border-2 border-dashed border-brand-copper/20 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-brand-copper/40 transition-all aspect-[4/3] bg-cream">
                    <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" onChange={handleGalleryUpload} className="hidden" />
                    {uploading === "gallery" ? (
                      <div className="w-8 h-8 border-3 border-brand-copper/20 border-t-brand-copper rounded-full animate-spin" />
                    ) : (
                      <>
                        <svg className="w-8 h-8 text-slate-300 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>
                        <span className="text-xs text-slate-400">Agregar</span>
                      </>
                    )}
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeSection === "seo" && (
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-brand-copper/10">
              <h2 className="font-serif text-2xl text-dark-elegant mb-6">SEO & Meta Tags</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Meta Título</label>
                  <input type="text" value={config.seo.metaTitle as string || ""} onChange={(e) => setConfig((p) => ({ ...p, seo: { ...p.seo, metaTitle: sanitize(e.target.value) } }))} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-3 text-sm" />
                  <p className="text-[10px] text-slate-400 mt-1">{(config.seo.metaTitle as string || "").length}/60 caracteres</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Meta Descripción</label>
                  <textarea rows={3} value={config.seo.metaDescription as string || ""} onChange={(e) => setConfig((p) => ({ ...p, seo: { ...p.seo, metaDescription: sanitize(e.target.value) } }))} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-3 text-sm resize-none" />
                  <p className="text-[10px] text-slate-400 mt-1">{(config.seo.metaDescription as string || "").length}/160 caracteres</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Keywords (separadas por coma)</label>
                  <input type="text" value={(config.seo.keywords as string[] || []).join(", ")} onChange={(e) => setConfig((p) => ({ ...p, seo: { ...p.seo, keywords: e.target.value.split(",").map((k) => k.trim()).filter(Boolean) } }))} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-3 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">OG Image URL</label>
                  <input type="url" value={config.seo.ogImage as string || ""} onChange={(e) => setConfig((p) => ({ ...p, seo: { ...p.seo, ogImage: e.target.value } }))} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-3 text-sm" />
                </div>
              </div>
            </div>
          )}

          {activeSection === "hero" && (
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-brand-copper/10">
              <h2 className="font-serif text-2xl text-dark-elegant mb-6">Sección Hero</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Título</label>
                  <input type="text" value={config.hero.title as string || ""} onChange={(e) => setConfig((p) => ({ ...p, hero: { ...p.hero, title: sanitize(e.target.value) } }))} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-3 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Subtítulo</label>
                  <input type="text" value={config.hero.subtitle as string || ""} onChange={(e) => setConfig((p) => ({ ...p, hero: { ...p.hero, subtitle: sanitize(e.target.value) } }))} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-3 text-sm" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Tagline</label>
                  <textarea rows={2} value={config.hero.tagline as string || ""} onChange={(e) => setConfig((p) => ({ ...p, hero: { ...p.hero, tagline: sanitize(e.target.value) } }))} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-3 text-sm italic resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Texto CTA</label>
                  <input type="text" value={config.hero.ctaText as string || ""} onChange={(e) => setConfig((p) => ({ ...p, hero: { ...p.hero, ctaText: sanitize(e.target.value) } }))} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-3 text-sm" />
                </div>
              </div>
              <div className="mt-6">
                <h3 className="font-serif text-lg text-dark-elegant mb-4">Estadísticas del Hero</h3>
                {(config.hero.stats as { value: string; label: string }[] || []).map((stat, i) => (
                  <div key={stat.label + '-' + i} className="flex items-center gap-4 mb-3 p-3 bg-cream rounded-lg">
                    <input type="text" value={stat.value} onChange={(e) => { const stats = [...config.hero.stats as { value: string; label: string }[]]; stats[i] = { ...stats[i], value: e.target.value }; setConfig((p) => ({ ...p, hero: { ...p.hero, stats } })); }} className="w-24 bg-white border border-brand-copper/20 rounded-lg px-3 py-2 text-sm text-center" placeholder="Valor" />
                    <input type="text" value={stat.label} onChange={(e) => { const stats = [...config.hero.stats as { value: string; label: string }[]]; stats[i] = { ...stats[i], label: e.target.value }; setConfig((p) => ({ ...p, hero: { ...p.hero, stats } })); }} className="flex-1 bg-white border border-brand-copper/20 rounded-lg px-3 py-2 text-sm" placeholder="Label" />
                    <button onClick={() => { const stats = (config.hero.stats as { value: string; label: string }[] || []).filter((_, j) => j !== i); setConfig((p) => ({ ...p, hero: { ...p.hero, stats } })); }} className="text-red-400 hover:text-red-600 cursor-pointer" aria-label="Eliminar estadística">×</button>
                  </div>
                ))}
                <button onClick={() => { const stats = [...config.hero.stats as { value: string; label: string }[] || [], { value: "", label: "" }]; setConfig((p) => ({ ...p, hero: { ...p.hero, stats } })); }} className="text-sm text-brand-copper hover:text-brand-copper-light cursor-pointer">+ Agregar estadística</button>
              </div>
            </div>
          )}

          {activeSection === "about" && (
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-brand-copper/10">
              <h2 className="font-serif text-2xl text-dark-elegant mb-6">Sección Nuestra Filosofía</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Título</label>
                  <input type="text" value={config.about.title || ""} onChange={(e) => setConfig((p) => ({ ...p, about: { ...p.about, title: sanitize(e.target.value) } }))} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-3 text-sm" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Frase Principal</label>
                  <textarea rows={2} value={config.about.text || ""} onChange={(e) => setConfig((p) => ({ ...p, about: { ...p.about, text: sanitize(e.target.value) } }))} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-3 text-sm italic resize-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Frase Destacada (highlight)</label>
                  <textarea rows={2} value={config.about.highlight || ""} onChange={(e) => setConfig((p) => ({ ...p, about: { ...p.about, highlight: sanitize(e.target.value) } }))} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-3 text-sm resize-none" />
                </div>
              </div>
            </div>
          )}

          {activeSection === "festin" && (
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-brand-copper/10">
              <h2 className="font-serif text-2xl text-dark-elegant mb-6">Sección El Festín</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Título</label>
                  <input type="text" value={config.festin.title || ""} onChange={(e) => setConfig((p) => ({ ...p, festin: { ...p.festin, title: sanitize(e.target.value) } }))} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-3 text-sm" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Subtítulo</label>
                  <textarea rows={2} value={config.festin.subtitle || ""} onChange={(e) => setConfig((p) => ({ ...p, festin: { ...p.festin, subtitle: sanitize(e.target.value) } }))} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-3 text-sm resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Texto CTA</label>
                  <input type="text" value={config.festin.ctaText || ""} onChange={(e) => setConfig((p) => ({ ...p, festin: { ...p.festin, ctaText: sanitize(e.target.value) } }))} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-3 text-sm" />
                </div>
              </div>
            </div>
          )}

          {activeSection === "features" && (
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-brand-copper/10">
              <h2 className="font-serif text-2xl text-dark-elegant mb-6">¿Por Qué Elegirnos?</h2>
              <div className="mb-6">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Título de la Sección</label>
                <input type="text" value={config.features.title as string || ""} onChange={(e) => setConfig((p) => ({ ...p, features: { ...p.features, title: sanitize(e.target.value) } }))} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-3 text-sm" />
              </div>
              <div className="space-y-4">
                {(config.features.items as { icon: string; title: string; text: string }[] || []).map((item, i) => (
                  <div key={item.title + '-' + i} className="p-4 bg-cream rounded-xl border border-brand-copper/10">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-semibold text-slate-500 uppercase">Feature #{i + 1}</span>
                      <button onClick={() => { const items = (config.features.items as { icon: string; title: string; text: string }[]).filter((_, j) => j !== i); setConfig((p) => ({ ...p, features: { ...p.features, items } })); }} className="text-red-400 hover:text-red-600 text-sm cursor-pointer">Eliminar</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <select value={item.icon} onChange={(e) => { const items = [...config.features.items as { icon: string; title: string; text: string }[]]; items[i] = { ...items[i], icon: e.target.value }; setConfig((p) => ({ ...p, features: { ...p.features, items } })); }} className="bg-white border border-brand-copper/20 rounded-lg px-3 py-2 text-sm">
                        {ICON_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                      <input type="text" value={item.title} onChange={(e) => { const items = [...config.features.items as { icon: string; title: string; text: string }[]]; items[i] = { ...items[i], title: sanitize(e.target.value) }; setConfig((p) => ({ ...p, features: { ...p.features, items } })); }} className="bg-white border border-brand-copper/20 rounded-lg px-3 py-2 text-sm" placeholder="Título" />
                      <input type="text" value={item.text} onChange={(e) => { const items = [...config.features.items as { icon: string; title: string; text: string }[]]; items[i] = { ...items[i], text: sanitize(e.target.value) }; setConfig((p) => ({ ...p, features: { ...p.features, items } })); }} className="bg-white border border-brand-copper/20 rounded-lg px-3 py-2 text-sm" placeholder="Descripción" />
                    </div>
                  </div>
                ))}
                <button onClick={() => { const items = [...config.features.items as { icon: string; title: string; text: string }[] || [], { icon: "star", title: "", text: "" }]; setConfig((p) => ({ ...p, features: { ...p.features, items } })); }} className="text-sm text-brand-copper hover:text-brand-copper-light cursor-pointer">+ Agregar feature</button>
              </div>
            </div>
          )}

          {activeSection === "cta" && (
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-brand-copper/10">
              <h2 className="font-serif text-2xl text-dark-elegant mb-6">Sección CTA (Call to Action)</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Título</label>
                  <input type="text" value={config.cta.title || ""} onChange={(e) => setConfig((p) => ({ ...p, cta: { ...p.cta, title: sanitize(e.target.value) } }))} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-3 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Texto Descriptivo</label>
                  <textarea rows={2} value={config.cta.text || ""} onChange={(e) => setConfig((p) => ({ ...p, cta: { ...p.cta, text: sanitize(e.target.value) } }))} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-3 text-sm resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Texto del Botón</label>
                  <input type="text" value={config.cta.buttonText || ""} onChange={(e) => setConfig((p) => ({ ...p, cta: { ...p.cta, buttonText: sanitize(e.target.value) } }))} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-3 text-sm" />
                </div>
              </div>
            </div>
          )}

          {activeSection === "comingSoon" && (
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-brand-copper/10">
              <h2 className="font-serif text-2xl text-dark-elegant mb-6">Sección Próximamente</h2>
              <div className="mb-6">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Título de la Sección</label>
                <input type="text" value={config.comingSoon.title as string || ""} onChange={(e) => setConfig((p) => ({ ...p, comingSoon: { ...p.comingSoon, title: sanitize(e.target.value) } }))} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-3 text-sm" />
              </div>
              <div className="space-y-4">
                {(config.comingSoon.items as { title: string; description: string; icon: string }[] || []).map((item, i) => (
                  <div key={item.title + '-' + i} className="p-4 bg-cream rounded-xl border border-brand-copper/10">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-semibold text-slate-500 uppercase">Servicio #{i + 1}</span>
                      <button onClick={() => { const items = (config.comingSoon.items as { title: string; description: string; icon: string }[]).filter((_, j) => j !== i); setConfig((p) => ({ ...p, comingSoon: { ...p.comingSoon, items } })); }} className="text-red-400 hover:text-red-600 text-sm cursor-pointer">Eliminar</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <select value={item.icon} onChange={(e) => { const items = [...config.comingSoon.items as { title: string; description: string; icon: string }[]]; items[i] = { ...items[i], icon: e.target.value }; setConfig((p) => ({ ...p, comingSoon: { ...p.comingSoon, items } })); }} className="bg-white border border-brand-copper/20 rounded-lg px-3 py-2 text-sm">
                        {ICON_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                      <input type="text" value={item.title} onChange={(e) => { const items = [...config.comingSoon.items as { title: string; description: string; icon: string }[]]; items[i] = { ...items[i], title: sanitize(e.target.value) }; setConfig((p) => ({ ...p, comingSoon: { ...p.comingSoon, items } })); }} className="bg-white border border-brand-copper/20 rounded-lg px-3 py-2 text-sm" placeholder="Título" />
                      <input type="text" value={item.description} onChange={(e) => { const items = [...config.comingSoon.items as { title: string; description: string; icon: string }[]]; items[i] = { ...items[i], description: sanitize(e.target.value) }; setConfig((p) => ({ ...p, comingSoon: { ...p.comingSoon, items } })); }} className="bg-white border border-brand-copper/20 rounded-lg px-3 py-2 text-sm" placeholder="Descripción" />
                    </div>
                  </div>
                ))}
                <button onClick={() => { const items = [...config.comingSoon.items as { title: string; description: string; icon: string }[] || [], { title: "", description: "", icon: "bowl" }]; setConfig((p) => ({ ...p, comingSoon: { ...p.comingSoon, items } })); }} className="text-sm text-brand-copper hover:text-brand-copper-light cursor-pointer">+ Agregar servicio</button>
              </div>
            </div>
          )}

          {activeSection === "navbar" && (
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-brand-copper/10">
              <h2 className="font-serif text-2xl text-dark-elegant mb-6">Navegación (Navbar)</h2>
              <div className="mb-6">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">URL del Logo</label>
                <input type="text" value={config.navbar.logoUrl as string || ""} onChange={(e) => setConfig((p) => ({ ...p, navbar: { ...p.navbar, logoUrl: e.target.value } }))} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-3 text-sm" />
              </div>
              <h3 className="font-serif text-lg text-dark-elegant mb-4">Links de Navegación</h3>
              {(config.navbar.links as { label: string; href: string }[] || []).map((link, i) => (
                <div key={link.label + '-' + i} className="flex items-center gap-4 mb-3 p-3 bg-cream rounded-lg">
                  <input type="text" value={link.label} onChange={(e) => { const links = [...config.navbar.links as { label: string; href: string }[]]; links[i] = { ...links[i], label: e.target.value }; setConfig((p) => ({ ...p, navbar: { ...p.navbar, links } })); }} className="flex-1 bg-white border border-brand-copper/20 rounded-lg px-3 py-2 text-sm" placeholder="Label" />
                  <input type="text" value={link.href} onChange={(e) => { const links = [...config.navbar.links as { label: string; href: string }[]]; links[i] = { ...links[i], href: e.target.value }; setConfig((p) => ({ ...p, navbar: { ...p.navbar, links } })); }} className="flex-1 bg-white border border-brand-copper/20 rounded-lg px-3 py-2 text-sm font-mono text-xs" placeholder="#seccion" />
                  <button onClick={() => { const links = (config.navbar.links as { label: string; href: string }[]).filter((_, j) => j !== i); setConfig((p) => ({ ...p, navbar: { ...p.navbar, links } })); }} className="text-red-400 hover:text-red-600 cursor-pointer">×</button>
                </div>
              ))}
              <button onClick={() => { const links = [...config.navbar.links as { label: string; href: string }[] || [], { label: "", href: "" }]; setConfig((p) => ({ ...p, navbar: { ...p.navbar, links } })); }} className="text-sm text-brand-copper hover:text-brand-copper-light cursor-pointer">+ Agregar link</button>
            </div>
          )}

          {activeSection === "footer" && (
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-brand-copper/10">
              <h2 className="font-serif text-2xl text-dark-elegant mb-6">Footer (Pie de Página)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Frase Central</label>
                  <input type="text" value={config.footer.text as string || ""} onChange={(e) => setConfig((p) => ({ ...p, footer: { ...p.footer, text: sanitize(e.target.value) } }))} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-3 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Copyright</label>
                  <input type="text" value={config.footer.copyright as string || ""} onChange={(e) => setConfig((p) => ({ ...p, footer: { ...p.footer, copyright: sanitize(e.target.value) } }))} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-3 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Dirección</label>
                  <input type="text" value={config.footer.address as string || ""} onChange={(e) => setConfig((p) => ({ ...p, footer: { ...p.footer, address: sanitize(e.target.value) } }))} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-3 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Teléfono</label>
                  <input type="text" value={config.footer.phone as string || ""} onChange={(e) => setConfig((p) => ({ ...p, footer: { ...p.footer, phone: sanitize(e.target.value) } }))} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-3 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">URL Mapa</label>
                  <input type="url" value={config.footer.mapUrl as string || ""} onChange={(e) => setConfig((p) => ({ ...p, footer: { ...p.footer, mapUrl: e.target.value } }))} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-3 text-sm" />
                </div>
              </div>
              <h3 className="font-serif text-lg text-dark-elegant mb-4">Horarios</h3>
              {(config.footer.schedule as { days: string; hours: string }[] || []).map((s, i) => (
                <div key={s.days + '-' + i} className="flex items-center gap-4 mb-3 p-3 bg-cream rounded-lg">
                  <input type="text" value={s.days} onChange={(e) => { const schedule = [...config.footer.schedule as { days: string; hours: string }[]]; schedule[i] = { ...schedule[i], days: e.target.value }; setConfig((p) => ({ ...p, footer: { ...p.footer, schedule } })); }} className="flex-1 bg-white border border-brand-copper/20 rounded-lg px-3 py-2 text-sm" placeholder="Días" />
                  <input type="text" value={s.hours} onChange={(e) => { const schedule = [...config.footer.schedule as { days: string; hours: string }[]]; schedule[i] = { ...schedule[i], hours: e.target.value }; setConfig((p) => ({ ...p, footer: { ...p.footer, schedule } })); }} className="flex-1 bg-white border border-brand-copper/20 rounded-lg px-3 py-2 text-sm" placeholder="Horarios" />
                  <button onClick={() => { const schedule = (config.footer.schedule as { days: string; hours: string }[]).filter((_, j) => j !== i); setConfig((p) => ({ ...p, footer: { ...p.footer, schedule } })); }} className="text-red-400 hover:text-red-600 cursor-pointer">×</button>
                </div>
              ))}
              <button onClick={() => { const schedule = [...config.footer.schedule as { days: string; hours: string }[] || [], { days: "", hours: "" }]; setConfig((p) => ({ ...p, footer: { ...p.footer, schedule } })); }} className="text-sm text-brand-copper hover:text-brand-copper-light cursor-pointer">+ Agregar horario</button>
            </div>
          )}

          {activeSection === "social" && (
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-brand-copper/10">
              <h2 className="font-serif text-2xl text-dark-elegant mb-6">Redes Sociales</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {["instagram", "facebook", "tiktok"].map((platform) => (
                  <div key={platform}>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">{platform.charAt(0).toUpperCase() + platform.slice(1)} URL</label>
                    <input type="url" value={config.social[platform] || ""} onChange={(e) => setConfig((p) => ({ ...p, social: { ...p.social, [platform]: e.target.value } }))} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-3 text-sm" placeholder={`https://${platform}.com/...`} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === "contact" && (
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-brand-copper/10">
              <h2 className="font-serif text-2xl text-dark-elegant mb-6">Contacto</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Email</label>
                  <input type="email" value={config.contact.email || ""} onChange={(e) => setConfig((p) => ({ ...p, contact: { ...p.contact, email: e.target.value } }))} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-3 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">WhatsApp (solo números, ej: 541176753854)</label>
                  <input type="tel" value={config.contact.whatsapp || ""} onChange={(e) => setConfig((p) => ({ ...p, contact: { ...p.contact, whatsapp: e.target.value.replace(/\D/g, "") } }))} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-3 text-sm" placeholder={WHATSAPP_NUMBER} />
                </div>
              </div>
            </div>
          )}

          {activeSection === "combos" && (
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-brand-copper/10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-2xl text-dark-elegant">Gestión de Combos</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setShowNewCombo(!showNewCombo); setNewCombo({}); setNewComboItems([]); }}
                    className="text-sm bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    + Nuevo Combo
                  </button>
                  <button
                    onClick={async () => {
                      const d = await fetchAllCombosAdmin();
                      if (d) setCombos(d);
                      setComboMsg("Combos actualizados");
                      setTimeout(() => setComboMsg(""), 2000);
                    }}
                    className="text-sm text-brand-copper hover:text-brand-copper-light cursor-pointer flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    Recargar
                  </button>
                </div>
              </div>
              {comboMsg && <div className="mb-4 px-4 py-2 bg-green-50 text-green-600 text-sm rounded-lg border border-green-200">{comboMsg}</div>}

              {showNewCombo && (
                <div className="mb-6 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                  <h3 className="font-serif text-lg text-dark-elegant mb-4">Nuevo Combo</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">ID único</label>
                      <input type="text" value={newCombo.id || ""} onChange={(e) => setNewCombo((p) => ({ ...p, id: e.target.value }))} className="w-full bg-white border border-brand-copper/20 rounded-lg px-3 py-2 text-sm font-mono" placeholder="ej: combo_nuevo" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Nombre</label>
                      <input type="text" value={newCombo.nombre || ""} onChange={(e) => setNewCombo((p) => ({ ...p, nombre: e.target.value }))} className="w-full bg-white border border-brand-copper/20 rounded-lg px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Precio ($)</label>
                      <input type="number" min="0" value={newCombo.precio || ""} onChange={(e) => setNewCombo((p) => ({ ...p, precio: parseInt(e.target.value) || 0 }))} className="w-full bg-white border border-brand-copper/20 rounded-lg px-3 py-2 text-sm" />
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Descripción</label>
                      <input type="text" value={newCombo.descripcion || ""} onChange={(e) => setNewCombo((p) => ({ ...p, descripcion: e.target.value }))} className="w-full bg-white border border-brand-copper/20 rounded-lg px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Personas mín</label>
                      <input type="number" min="1" value={newCombo.personas_min || ""} onChange={(e) => setNewCombo((p) => ({ ...p, personas_min: parseInt(e.target.value) || 1 }))} className="w-full bg-white border border-brand-copper/20 rounded-lg px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Personas máx</label>
                      <input type="number" min="1" value={newCombo.personas_max || ""} onChange={(e) => setNewCombo((p) => ({ ...p, personas_max: parseInt(e.target.value) || 100 }))} className="w-full bg-white border border-brand-copper/20 rounded-lg px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Orden</label>
                      <input type="number" min="0" value={newCombo.orden ?? ""} onChange={(e) => setNewCombo((p) => ({ ...p, orden: parseInt(e.target.value) || 0 }))} className="w-full bg-white border border-brand-copper/20 rounded-lg px-3 py-2 text-sm" />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Productos del Combo</label>
                    {newComboItems.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 mb-2 p-2 bg-white rounded-lg border border-brand-copper/10">
                        <input type="text" value={item.id} onChange={(e) => { const items = [...newComboItems]; items[i] = { ...items[i], id: e.target.value }; setNewComboItems(items); }} className="w-28 bg-cream border border-brand-copper/20 rounded px-2 py-1 text-xs font-mono" placeholder="ID producto" />
                        <input type="text" value={item.nombre} onChange={(e) => { const items = [...newComboItems]; items[i] = { ...items[i], nombre: e.target.value }; setNewComboItems(items); }} className="flex-1 bg-cream border border-brand-copper/20 rounded px-2 py-1 text-xs" placeholder="Nombre" />
                        <input type="number" min="0" value={item.cantidad} onChange={(e) => { const items = [...newComboItems]; items[i] = { ...items[i], cantidad: parseInt(e.target.value) || 0 }; setNewComboItems(items); }} className="w-16 bg-cream border border-brand-copper/20 rounded px-2 py-1 text-xs text-center" placeholder="Cant" />
                        <input type="number" min="0" value={item.precio} onChange={(e) => { const items = [...newComboItems]; items[i] = { ...items[i], precio: parseInt(e.target.value) || 0 }; setNewComboItems(items); }} className="w-20 bg-cream border border-brand-copper/20 rounded px-2 py-1 text-xs text-center" placeholder="Precio u." />
                        <button onClick={() => setNewComboItems((prev) => prev.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 text-sm cursor-pointer">×</button>
                      </div>
                    ))}
                    <button onClick={() => setNewComboItems((prev) => [...prev, { id: "", nombre: "", cantidad: 0, precio: 0 }])} className="text-sm text-brand-copper hover:text-brand-copper-light cursor-pointer">+ Agregar producto</button>
                  </div>
                  <button
                    onClick={async () => {
                      if (!newCombo.id || !newCombo.nombre) { setComboMsg("Error: ID y nombre son obligatorios"); return; }
                      const { error } = await createComboAdmin({
                        id: newCombo.id,
                        nombre: newCombo.nombre || "",
                        descripcion: newCombo.descripcion || "",
                        items_json: newComboItems,
                        precio: newCombo.precio || 0,
                        personas_min: newCombo.personas_min || 1,
                        personas_max: newCombo.personas_max || 100,
                        activo: true,
                        orden: newCombo.orden || 0,
                      });
                      if (error) setComboMsg("Error: " + error.message);
                      else {
                        setComboMsg("Combo creado exitosamente");
                        setShowNewCombo(false);
                        setNewCombo({});
                        setNewComboItems([]);
                        const d = await fetchAllCombosAdmin();
                        if (d) setCombos(d);
                      }
                      setTimeout(() => setComboMsg(""), 3000);
                    }}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 transition-colors cursor-pointer"
                  >
                    Crear Combo
                  </button>
                </div>
              )}

              {combos.length > 0 ? (
                <div className="space-y-4">
                  {combos.map((combo) => (
                    <div key={combo.id} className="p-4 bg-cream rounded-xl border border-brand-copper/10">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Nombre</label>
                          <input type="text" value={combo.nombre} onChange={(e) => setCombos((prev) => prev.map((c) => c.id === combo.id ? { ...c, nombre: e.target.value } : c))} className="w-full bg-white border border-brand-copper/20 rounded-lg px-3 py-2 text-sm" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Descripción</label>
                          <input type="text" value={combo.descripcion} onChange={(e) => setCombos((prev) => prev.map((c) => c.id === combo.id ? { ...c, descripcion: e.target.value } : c))} className="w-full bg-white border border-brand-copper/20 rounded-lg px-3 py-2 text-sm" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Precio ($)</label>
                          <input type="number" min="0" value={combo.precio} onChange={(e) => setCombos((prev) => prev.map((c) => c.id === combo.id ? { ...c, precio: parseInt(e.target.value) || 0 } : c))} className="w-full bg-white border border-brand-copper/20 rounded-lg px-3 py-2 text-sm" />
                        </div>
                        <div className="flex items-end gap-2">
                          <label className="flex items-center gap-2 px-3 py-2 bg-white border border-brand-copper/20 rounded-lg cursor-pointer">
                            <input type="checkbox" checked={combo.activo ?? true} onChange={(e) => setCombos((prev) => prev.map((c) => c.id === combo.id ? { ...c, activo: e.target.checked } : c))} className="w-4 h-4 text-brand-copper accent-brand-copper" />
                            <span className="text-xs text-slate-600">Activo</span>
                          </label>
                          <button
                              onClick={async () => {
                              setComboSaving(combo.id);
                              const { error } = await updateComboAdmin(combo.id, {
                                nombre: combo.nombre,
                                descripcion: combo.descripcion,
                                precio: combo.precio,
                                activo: combo.activo,
                                orden: combo.orden,
                                personas_min: combo.personas_min,
                                personas_max: combo.personas_max,
                                capacidad_diaria: combo.capacidad_diaria,
                                items_json: combo.items_json,
                              });
                              setComboSaving(null);
                              if (error) setComboMsg("Error: " + error.message);
                              else setComboMsg("Combo actualizado");
                              setTimeout(() => setComboMsg(""), 2000);
                            }}
                            disabled={comboSaving === combo.id}
                            className="px-4 py-2 bg-brand-copper text-white rounded-lg text-xs font-medium hover:bg-brand-copper-light transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            {comboSaving === combo.id ? "..." : "Guardar"}
                          </button>
                          <button
                            onClick={() => setConfirmDeleteCombo(combo.id)}
                            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200 transition-colors cursor-pointer"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Personas mín</label>
                          <input type="number" min="1" value={combo.personas_min} onChange={(e) => setCombos((prev) => prev.map((c) => c.id === combo.id ? { ...c, personas_min: parseInt(e.target.value) || 1 } : c))} className="w-full bg-white border border-brand-copper/20 rounded-lg px-3 py-2 text-sm" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Personas máx</label>
                          <input type="number" min="1" value={combo.personas_max} onChange={(e) => setCombos((prev) => prev.map((c) => c.id === combo.id ? { ...c, personas_max: parseInt(e.target.value) || 100 } : c))} className="w-full bg-white border border-brand-copper/20 rounded-lg px-3 py-2 text-sm" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Orden</label>
                          <input type="number" min="0" value={combo.orden ?? 0} onChange={(e) => setCombos((prev) => prev.map((c) => c.id === combo.id ? { ...c, orden: parseInt(e.target.value) || 0 } : c))} className="w-full bg-white border border-brand-copper/20 rounded-lg px-3 py-2 text-sm" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Capacidad diaria (0 = ilimitado)</label>
                          <input type="number" min="0" value={combo.capacidad_diaria ?? 0} onChange={(e) => setCombos((prev) => prev.map((c) => c.id === combo.id ? { ...c, capacidad_diaria: parseInt(e.target.value) || 0 } : c))} className="w-full bg-white border border-brand-copper/20 rounded-lg px-3 py-2 text-sm" />
                        </div>
                      </div>
                      <div className="border-t border-brand-copper/10 pt-3 mt-3">
                        <details className="group">
                          <summary className="text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-brand-copper transition-colors [&::-webkit-details-marker]:hidden list-none flex items-center gap-2">
                            <svg className="w-3 h-3 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            Productos ({combo.items_json?.length || 0})
                          </summary>
                          <div className="mt-2 space-y-2">
                            {combo.items_json?.map((item, i) => (
                              <div key={item.id + '-' + i} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-brand-copper/10">
                                <input type="text" value={item.id} onChange={(e) => setCombos((prev) => prev.map((c) => c.id === combo.id ? { ...c, items_json: c.items_json?.map((it, j) => j === i ? { ...it, id: e.target.value } : it) } : c))} className="w-20 bg-cream border border-brand-copper/20 rounded px-2 py-1 text-[10px] font-mono" placeholder="ID" />
                                <input type="text" value={item.nombre} onChange={(e) => setCombos((prev) => prev.map((c) => c.id === combo.id ? { ...c, items_json: c.items_json?.map((it, j) => j === i ? { ...it, nombre: e.target.value } : it) } : c))} className="flex-1 bg-cream border border-brand-copper/20 rounded px-2 py-1 text-xs" placeholder="Nombre" />
                                <input type="number" min="0" value={item.cantidad} onChange={(e) => setCombos((prev) => prev.map((c) => c.id === combo.id ? { ...c, items_json: c.items_json?.map((it, j) => j === i ? { ...it, cantidad: parseInt(e.target.value) || 0 } : it) } : c))} className="w-16 bg-cream border border-brand-copper/20 rounded px-2 py-1 text-xs text-center" placeholder="Cant" />
                                <input type="number" min="0" value={item.precio} onChange={(e) => setCombos((prev) => prev.map((c) => c.id === combo.id ? { ...c, items_json: c.items_json?.map((it, j) => j === i ? { ...it, precio: parseInt(e.target.value) || 0 } : it) } : c))} className="w-20 bg-cream border border-brand-copper/20 rounded px-2 py-1 text-xs text-center" placeholder="$" />
                                <button onClick={() => setCombos((prev) => prev.map((c) => c.id === combo.id ? { ...c, items_json: c.items_json?.filter((_, j) => j !== i) } : c))} className="text-red-400 hover:text-red-600 text-sm cursor-pointer">×</button>
                              </div>
                            ))}
                            <button onClick={() => setCombos((prev) => prev.map((c) => c.id === combo.id ? { ...c, items_json: [...(c.items_json || []), { id: "", nombre: "", cantidad: 0, precio: 0 }] } : c))} className="text-sm text-brand-copper hover:text-brand-copper-light cursor-pointer">+ Agregar producto</button>
                          </div>
                        </details>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 text-sm">No hay combos registrados.</div>
              )}

              <ConfirmDialog
                open={confirmDeleteCombo !== null}
                title="Eliminar Combo"
                message="¿Estás seguro de eliminar este combo? Esta acción no se puede deshacer."
                onConfirm={async () => {
                  if (!confirmDeleteCombo) return;
                  const { error } = await deleteComboAdmin(confirmDeleteCombo);
                  if (error) setComboMsg("Error: " + error.message);
                  else {
                    setComboMsg("Combo eliminado");
                    setCombos((prev) => prev.filter((c) => c.id !== confirmDeleteCombo));
                  }
                  setConfirmDeleteCombo(null);
                  setTimeout(() => setComboMsg(""), 2000);
                }}
                onCancel={() => setConfirmDeleteCombo(null)}
              />
            </div>
          )}

          {activeSection === "legal" && (
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-brand-copper/10">
              <h2 className="font-serif text-2xl text-dark-elegant mb-6">Políticas de Contratación</h2>
              <p className="text-xs text-slate-500 mb-4">Edita el contenido HTML de las políticas de contratación. Se muestra en la página /politicas-contratacion y en el modal de cotización.</p>
              <textarea
                rows={20}
                value={config.politicas_contratacion || ""}
                onChange={(e) => setConfig((p) => ({ ...p, politicas_contratacion: e.target.value }))}
                className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-3 text-sm font-mono resize-y"
              />
              <div className="mt-4 flex gap-3">
                <button onClick={() => save("politicas_contratacion", config.politicas_contratacion)} disabled={saving} className="px-4 py-2 bg-brand-copper text-white rounded-lg text-xs font-medium hover:bg-brand-copper-light transition-colors cursor-pointer disabled:opacity-50">
                  {saving ? "Guardando..." : "Guardar"}
                </button>
                <span className="text-[10px] text-slate-400 self-center">Soporta HTML básico (h2, p, ul, li, strong)</span>
              </div>
            </div>
          )}

          {activeSection === "sections" && (
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-brand-copper/10">
              <h2 className="font-serif text-2xl text-dark-elegant mb-6">Mostrar/Ocultar Secciones</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(config.sections).map(([key, val]) => (
                  <label key={key} className="flex items-center gap-3 p-4 bg-cream rounded-xl cursor-pointer hover:bg-cream/80 transition-colors border border-brand-copper/10 hover:border-brand-copper/30">
                    <input type="checkbox" checked={val} onChange={() => setConfig((p) => ({ ...p, sections: { ...p.sections, [key]: !p.sections[key] } }))} className="w-5 h-5 text-brand-copper rounded accent-brand-copper" />
                    <span className="text-sm text-dark-elegant capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      </>
      )}
    </>
  );
}
