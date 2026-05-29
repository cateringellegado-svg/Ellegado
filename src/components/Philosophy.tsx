"use client";

import Image from "next/image";
import { useSiteConfig } from "@/lib/site-config";

function highlightBrand(text: string): React.ReactNode[] {
  const parts = text.split(/(El Legado)/g);
  return parts.map((part, i) =>
    part === "El Legado"
      ? <span key={i} className="font-bold text-brand-copper underline decoration-brand-copper/20 underline-offset-8">{part}</span>
      : part
  );
}

export default function Philosophy() {
  const config = useSiteConfig();
  const about = config.about;
  const aboutImage = config.images.about || "/event_vibe.webp";

  return (
    <section
      id="momentos-eternos"
      className="py-32 bg-white border-y border-brand-copper/5 relative"
    >
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
        <div className="text-center md:text-left">
          <h2 className="font-serif text-3xl md:text-4xl mb-12 text-brand-copper italic tracking-widest uppercase">
            {about.title}
          </h2>
          <p className="text-xl md:text-3xl font-serif leading-relaxed text-slate-800 italic">
            &ldquo;{highlightBrand(about.text)}&rdquo;
          </p>
          {about.highlight && (
            <p className="mt-8 text-lg text-slate-600 font-sans tracking-wide">
              {about.highlight}
            </p>
          )}
        </div>
        <div className="relative group">
          <div className="absolute -inset-4 bg-brand-copper/10 rounded-2xl blur-xl group-hover:bg-brand-copper/20 transition-all" />
          <div className="relative rounded-2xl shadow-2xl border border-brand-copper/10 grayscale-[30%] hover:grayscale-0 transition-all duration-700 overflow-hidden">
            <Image
              src={aboutImage}
              alt="Atmósfera elegante de evento al aire libre"
              width={600}
              height={450}
              sizes="(max-width: 768px) 100vw, 50vw"
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
