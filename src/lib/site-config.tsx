"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { createClient } from "./supabase/client";

export interface SiteColors {
  primary: string;
  primaryLight: string;
  background: string;
  text: string;
  textSecondary: string;
}

export interface SiteHero {
  title: string;
  subtitle: string;
  tagline: string;
  ctaText: string;
  stats: { value: string; label: string }[];
}

export interface SiteHeroFeature {
  icon: string;
  text: string;
  color: string;
  style: "outline" | "solid";
}

export interface SiteAbout {
  title: string;
  text: string;
  highlight: string;
}

export interface SiteFestin {
  title: string;
  subtitle: string;
  ctaText: string;
}

export interface SiteFooterSchedule {
  days: string;
  hours: string;
}

export interface SiteFooter {
  text: string;
  copyright: string;
  schedule: SiteFooterSchedule[];
  address: string;
  phone: string;
  mapUrl: string;
}

export interface SocialLink {
  url: string;
  active: boolean;
}

export interface SiteSocial {
  instagram: SocialLink;
  facebook: SocialLink;
  tiktok: SocialLink;
}

export interface SiteContact {
  email: string;
  whatsapp: string;
}

export interface SiteSections {
  hero: boolean;
  about: boolean;
  festin: boolean;
  gallery: boolean;
  testimonials: boolean;
  contact: boolean;
  comingSoon: boolean;
  footer: boolean;
}

export interface SiteImages {
  hero: string;
  about: string;
  festin: string;
  logo: string;
  favicon: string;
  gallery: string[];
}

export interface SiteSEO {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  ogImage: string;
}

export interface SiteFeature {
  icon: string;
  title: string;
  text: string;
}

export interface SiteFeatures {
  title: string;
  items: SiteFeature[];
}

export interface SiteCTA {
  title: string;
  text: string;
  buttonText: string;
}

export interface SiteComingSoonService {
  title: string;
  description: string;
  icon: string;
}

export interface SiteComingSoon {
  title: string;
  items: SiteComingSoonService[];
}

export interface SiteNavbarLink {
  label: string;
  href: string;
}

export interface SiteNavbar {
  logoUrl: string;
  links: SiteNavbarLink[];
}

export interface SiteTestimonial {
  id: string;
  name: string;
  text: string;
  event: string;
  rating: number;
  menu: string;
  active: boolean;
}

export interface SiteConfig {
  colors: SiteColors;
  hero: SiteHero;
  about: SiteAbout;
  festin: SiteFestin;
  footer: SiteFooter;
  social: SiteSocial;
  contact: SiteContact;
  sections: SiteSections;
  images: SiteImages;
  seo: SiteSEO;
  features: SiteFeatures;
  cta: SiteCTA;
  heroFeatures: { items: SiteHeroFeature[] };
  comingSoon: SiteComingSoon;
  navbar: SiteNavbar;
}

const DEFAULT_COLORS: SiteColors = {
  primary: "#8B5E3C",
  primaryLight: "#D9A78B",
  background: "#FAF9F6",
  text: "#1A1A1A",
  textSecondary: "#64748B",
};

const DEFAULT_HERO: SiteHero = {
  title: "El Legado",
  subtitle: "Haz Eterno Cada Momento",
  tagline: "Servicio de catering premium para eventos inolvidables, con la cercanía que tú te mereces.",
  ctaText: "Cotizá tu evento",
  stats: [
    { value: "200+", label: "Eventos" },
    { value: "5", label: "Años Exp." },
    { value: "100%", label: "Dedicación" },
  ],
};

const DEFAULT_ABOUT: SiteAbout = {
  title: "Nuestra Filosofía",
  text: "En El Legado, entendemos que tu evento no es solo una fecha; es la construcción de un recuerdo.",
  highlight: "Nos especializamos en eventos de mediana envergadura, ofreciendo una experiencia gastronómica de alta gama con un trato cercano y profesional.",
};

const DEFAULT_FESTIN: SiteFestin = {
  title: "El Festín",
  subtitle: "Elegí los bocados que harán de tu evento una experiencia inolvidable",
  ctaText: "Cotizá tu evento",
};

const DEFAULT_FOOTER: SiteFooter = {
  text: "Haz Eterno Cada Momento",
  copyright: "© 2026 El Legado. Todos los derechos reservados.",
  schedule: [
    { days: "Lunes a Viernes", hours: "9:00 – 20:00" },
    { days: "Sábados", hours: "10:00 – 18:00" },
  ],
  address: "Buenos Aires, Argentina",
  phone: "+54 11 7675-3854",
  mapUrl: "https://maps.google.com",
};

const DEFAULT_SOCIAL: SiteSocial = {
  instagram: { url: "https://instagram.com/ellegado.catering", active: true },
  facebook: { url: "https://facebook.com/ellegado.catering", active: true },
  tiktok: { url: "", active: false },
};

const DEFAULT_CONTACT: SiteContact = {
  email: "catering.ellegado@gmail.com",
  whatsapp: "541176753854",
};

const DEFAULT_SECTIONS: SiteSections = {
  hero: true,
  about: true,
  festin: true,
  gallery: true,
  testimonials: true,
  contact: true,
  comingSoon: true,
  footer: true,
};

const DEFAULT_IMAGES: SiteImages = {
  hero: "/hero_catering.webp",
  about: "",
  festin: "/gourmet_canapes.webp",
  logo: "/logo.webp",
  favicon: "/favicon.webp",
  gallery: ["/hero_catering.webp", "/event_vibe.webp", "/gourmet_canapes.webp"],
};

const DEFAULT_SEO: SiteSEO = {
  metaTitle: "EL LEGADO - Catering y Eventos | Haz Eterno Cada Momento",
  metaDescription: "Servicio de catering premium para eventos inolvidables. Bodas, cumpleaños, eventos corporativos y más. Buenos Aires.",
  keywords: ["catering", "eventos", "catering premium", "Buenos Aires", "bodas", "fiestas"],
  ogImage: "/hero_catering.webp",
};

const DEFAULT_FEATURES: SiteFeatures = {
  title: "¿Por Qué Elegirnos?",
  items: [
    { icon: "chef", title: "Cocina Artesanal", text: "Cada bocado es preparado con ingredientes seleccionados y recetas únicas que marcan la diferencia." },
    { icon: "sparkles", title: "Presentación Impecable", text: "El arte de presentar cada plato como una obra maestra visual que cautiva a tus invitados." },
    { icon: "heart", title: "Atención Personalizada", text: "Escuchamos tus ideas y las transformamos en una experiencia gastronómica a tu medida." },
    { icon: "star", title: "Calidad Premium", text: "Estándares de calidad que superan expectativas, con ingredientes frescos y de primera línea." },
  ],
};

const DEFAULT_CTA: SiteCTA = {
  title: "¿Listo para tu evento perfecto?",
  text: "Contactanos hoy y empecemos a planificar juntos el catering que hará inolvidable tu ocasión especial.",
  buttonText: "Cotizá tu Evento",
};

const DEFAULT_COMING_SOON: SiteComingSoon = {
  title: "Próximamente",
  items: [
    { title: "Bowls Saludables", description: "Bowls nutritivos con ingredientes frescos y opciones vegetarianas", icon: "bowl" },
    { title: "Barra de Smoothies", description: "Estación interactiva de smoothies naturales y funcionales", icon: "smoothie" },
    { title: "Noche de Parrilla", description: "Experiencia de parrilla argentina para eventos al aire libre", icon: "grill" },
    { title: "Cheese & Wine", description: "Selección de quesos artesanales maridados con vinos premium", icon: "cheese" },
  ],
};

export const DEFAULT_NAVBAR: SiteNavbar = {
  logoUrl: "/logo.webp",
  links: [
    { label: "Inicio", href: "#inicio" },
    { label: "Elegirnos", href: "#elegirnos" },
    { label: "Filosofía", href: "#filosofia" },
    { label: "Festín", href: "#festin" },
    { label: "Galería", href: "#galeria" },
    { label: "Contacto", href: "#contacto" },
  ],
};

const DEFAULT_HERO_FEATURES: { items: SiteHeroFeature[] } = {
  items: [
    { icon: "shield_check", text: "Pago Seguro", color: "#16a34a", style: "outline" },
    { icon: "clock", text: "Respuesta en 24h", color: "#AF7A54", style: "outline" },
    { icon: "star", text: "+200 Eventos", color: "#d97706", style: "solid" },
  ],
};

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  colors: DEFAULT_COLORS,
  hero: DEFAULT_HERO,
  about: DEFAULT_ABOUT,
  festin: DEFAULT_FESTIN,
  footer: DEFAULT_FOOTER,
  social: DEFAULT_SOCIAL,
  contact: DEFAULT_CONTACT,
  sections: DEFAULT_SECTIONS,
  images: DEFAULT_IMAGES,
  seo: DEFAULT_SEO,
  features: DEFAULT_FEATURES,
  cta: DEFAULT_CTA,
  heroFeatures: DEFAULT_HERO_FEATURES,
  comingSoon: DEFAULT_COMING_SOON,
  navbar: DEFAULT_NAVBAR,
};

function tryParse(val: string | null, fallback: unknown) {
  if (!val) return fallback;
  try { return JSON.parse(val); } catch { return fallback; }
}

export function sanitizeText(val: string): string {
  return val.replace(/<[^>]*>/g, "").replace(/[<>]/g, "");
}

function migrateSocial(raw: unknown): SiteSocial {
  const data = (raw || {}) as Record<string, unknown>;
  const keys = ["instagram", "facebook", "tiktok"] as const;
  const result: Record<string, SocialLink> = {};
  for (const key of keys) {
    const v = data[key];
    if (v && typeof v === "object" && "url" in (v as object)) {
      const o = v as Record<string, unknown>;
      result[key] = { url: String(o.url ?? ""), active: Boolean(o.active ?? !!o.url) };
    } else {
      const url = typeof v === "string" ? v : "";
      result[key] = { url, active: !!url };
    }
  }
  return result as unknown as SiteSocial;
}

export async function fetchSiteConfigFromDB(): Promise<SiteConfig> {
  const supabase = createClient();
  const { data } = await supabase.from("site_config").select("*");
  if (!data) return DEFAULT_SITE_CONFIG;

  const map: Record<string, string> = {};
  data.forEach((c: { key: string; value: string }) => { map[c.key] = c.value; });

  return {
    colors: tryParse(map.colors, DEFAULT_COLORS) as SiteColors,
    hero: tryParse(map.hero, DEFAULT_HERO) as SiteHero,
    about: tryParse(map.about, DEFAULT_ABOUT) as SiteAbout,
    festin: tryParse(map.festin, DEFAULT_FESTIN) as SiteFestin,
    footer: tryParse(map.footer, DEFAULT_FOOTER) as SiteFooter,
    social: migrateSocial(tryParse(map.social, DEFAULT_SOCIAL)),
    contact: tryParse(map.contact, DEFAULT_CONTACT) as SiteContact,
    sections: tryParse(map.sections, DEFAULT_SECTIONS) as SiteSections,
    images: tryParse(map.images, DEFAULT_IMAGES) as SiteImages,
    seo: tryParse(map.seo, DEFAULT_SEO) as SiteSEO,
    features: tryParse(map.features, DEFAULT_FEATURES) as SiteFeatures,
    cta: tryParse(map.cta, DEFAULT_CTA) as SiteCTA,
    heroFeatures: tryParse(map.heroFeatures, DEFAULT_HERO_FEATURES) as { items: SiteHeroFeature[] },
    comingSoon: tryParse(map.comingSoon, DEFAULT_COMING_SOON) as SiteComingSoon,
    navbar: tryParse(map.navbar, DEFAULT_NAVBAR) as SiteNavbar,
  };
}

const SiteConfigContext = createContext<SiteConfig>(DEFAULT_SITE_CONFIG);

export function SiteConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_SITE_CONFIG);

  useEffect(() => {
    fetchSiteConfigFromDB().then(setConfig);
  }, []);

  useEffect(() => {
    if (config.colors) {
      document.documentElement.style.setProperty("--color-brand-copper", config.colors.primary);
      document.documentElement.style.setProperty("--color-brand-copper-light", config.colors.primaryLight);
      document.documentElement.style.setProperty("--color-cream", config.colors.background);
      document.documentElement.style.setProperty("--color-dark-elegant", config.colors.text);
    }
    const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (favicon && config.images.favicon) {
      favicon.href = config.images.favicon;
    }
  }, [config.colors, config.images.favicon]);

  return (
    <SiteConfigContext.Provider value={config}>
      {children}
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfig() {
  return useContext(SiteConfigContext);
}
