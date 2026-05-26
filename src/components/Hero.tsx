"use client";

import Image from "next/image";
import { getWhatsAppUrl } from "@/lib/constants";
import { useSiteConfig } from "@/lib/site-config";

export default function Hero() {
  const config = useSiteConfig();

  function openWhatsApp() {
    window.open(getWhatsAppUrl(config.contact.whatsapp), "_blank", "noopener,noreferrer");
  }

  const heroImage = config.images.hero || "/hero_catering.webp";
  const heroAlt = config.images.hero ? "Hero" : "Fondo de catering elegante";

  return (
    <section
      id="inicio"
      className="min-h-screen flex flex-col justify-center items-center text-center px-6 pt-40 pb-20 relative overflow-hidden"
    >
      <div className="absolute inset-0 -z-10">
        <Image
          src={heroImage}
          alt={heroAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>
      <div className="absolute inset-0 z-0 bg-cream/80 bg-gradient-to-b from-cream via-transparent to-cream" />

      <div className="fade-in max-w-4xl relative z-10">
        <div className="mb-12 flex flex-col items-center">
          <Image
            src={config.images.logo || "/logo.webp"}
            alt="Logo EL LEGADO"
            width={320}
            height={120}
            priority
            className="w-64 md:w-80 h-auto mb-4 logo-glow"
          />
        </div>

        <h1 className="font-serif text-5xl md:text-7xl font-light mb-6 leading-tight">
          {config.hero.title}{" "}
          <br />
          <span className="italic text-brand-copper text-gradient font-medium">
            {config.hero.subtitle}
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-500 font-light mb-12 max-w-2xl mx-auto italic">
          {config.hero.tagline}
        </p>

        <div className="flex justify-center gap-8 mb-12 pb-8 border-b border-brand-copper/20 max-w-lg mx-auto opacity-80">
          {config.hero.stats.map((stat, i) => (
            <div key={i} className="text-center">
              <span className="block font-serif text-3xl text-brand-copper font-bold">
                {stat.value}
              </span>
              <span className="text-[10px] uppercase tracking-widest text-slate-600">
                {stat.label}
              </span>
            </div>
          )).reduce((acc, elem, i, arr) => {
            acc.push(elem);
            if (i < arr.length - 1) {
              acc.push(<div key={`sep-${i}`} className="w-px bg-brand-copper/20" />);
            }
            return acc;
          }, [] as React.ReactNode[])}
        </div>

        <button
          type="button"
          onClick={openWhatsApp}
          className="inline-block px-10 py-5 bg-brand-copper text-white font-semibold rounded-full shadow-xl shadow-brand-copper/30 hover:shadow-brand-copper/50 hover:scale-105 transition-all duration-300 uppercase tracking-widest text-sm cursor-pointer"
          aria-label="Cotizar evento por WhatsApp"
        >
          Cotiza tu Evento por WhatsApp
        </button>
        <p className="text-xs text-slate-400 mt-4 italic">
          Respondemos en menos de 24 horas
        </p>

        <div className="flex flex-wrap justify-center gap-6 mt-8 pt-6 border-t border-brand-copper/10">
          <div className="flex items-center gap-2 text-slate-500">
            <svg
              className="w-5 h-5 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <span className="text-xs font-medium">Pago Seguro</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <svg
              className="w-5 h-5 text-brand-copper"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-xs font-medium">Respuesta en 24h</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <svg
              className="w-5 h-5 text-amber-500"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span className="text-xs font-medium">+200 Eventos</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 animate-bounce">
        <svg
          className="w-6 h-6 text-brand-copper/40"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </section>
  );
}
