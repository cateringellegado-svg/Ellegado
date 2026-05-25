"use client";

import { getWhatsAppUrl } from "@/lib/constants";
import { useSiteConfig } from "@/lib/site-config";

function openWhatsApp() {
  window.open(getWhatsAppUrl(), "_blank", "noopener,noreferrer");
}

export default function CTA() {
  const config = useSiteConfig();

  return (
    <section
      id="contacto"
      className="py-40 bg-brand-copper text-white text-center px-6 relative overflow-hidden"
    >
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
        </svg>
      </div>
      <div className="max-w-3xl mx-auto relative z-10">
        <h2 className="font-serif text-4xl md:text-6xl mb-8">
          {config.cta.title}
        </h2>
        <p className="text-xl mb-12 text-white font-light italic">
          {config.cta.text}
        </p>

        <button
          type="button"
          onClick={openWhatsApp}
          className="inline-block px-12 py-6 bg-white text-brand-copper font-bold text-xl rounded-full shadow-2xl hover:scale-110 hover:shadow-white/20 transition-all duration-300 uppercase tracking-widest cursor-pointer"
          aria-label="Enviar mensaje a WhatsApp"
        >
          {config.cta.buttonText}
        </button>
        <p className="text-sm text-white/70 mt-4 italic">
          Respuesta garantizada en menos de 24 horas
        </p>
      </div>
    </section>
  );
}
