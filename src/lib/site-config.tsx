"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { supabase } from "./supabase";

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

export interface SiteFooter {
  text: string;
  copyright: string;
}

export interface SiteSocial {
  instagram: string;
  facebook: string;
  tiktok: string;
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
}

const DEFAULT_COLORS: SiteColors = {
  primary: "#AF7A54",
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
    { value: "100+", label: "Eventos" },
    { value: "5", label: "Años Exp." },
    { value: "100%", label: "Dedicación" },
  ],
};

const DEFAULT_ABOUT: SiteAbout = {
  title: "Nuestra Filosofía",
  text: "Cada evento es una historia única que merece ser contada con los sabores más exquisitos y la atención más cálida.",
  highlight: "",
};

const DEFAULT_FESTIN: SiteFestin = {
  title: "El Festín",
  subtitle: "Elegí los bocados que harán de tu evento una experiencia inolvidable",
  ctaText: "Cotizá tu evento",
};

const DEFAULT_FOOTER: SiteFooter = {
  text: "Haz Eterno Cada Momento",
  copyright: "© 2026 El Legado. Todos los derechos reservados.",
};

const DEFAULT_SOCIAL: SiteSocial = {
  instagram: "https://instagram.com/ellegado.catering",
  facebook: "https://facebook.com/ellegado.catering",
  tiktok: "",
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
  gallery: ["/hero_catering.webp", "/event_vibe.webp", "/gourmet_canapes.webp", "/gourmet_canapes.webp", "/hero_catering.webp", "/event_vibe.webp"],
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
};

function tryParse(val: string | null, fallback: unknown) {
  if (!val) return fallback;
  try { return JSON.parse(val); } catch { return fallback; }
}

export async function fetchSiteConfigFromDB(): Promise<SiteConfig> {
  if (!supabase) return DEFAULT_SITE_CONFIG;
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
    social: tryParse(map.social, DEFAULT_SOCIAL) as SiteSocial,
    contact: tryParse(map.contact, DEFAULT_CONTACT) as SiteContact,
    sections: tryParse(map.sections, DEFAULT_SECTIONS) as SiteSections,
    images: tryParse(map.images, DEFAULT_IMAGES) as SiteImages,
  };
}

// React Context for site config
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
  }, [config.colors]);

  return (
    <SiteConfigContext.Provider value={config}>
      {children}
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfig() {
  return useContext(SiteConfigContext);
}
