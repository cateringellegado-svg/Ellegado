"use client";

import { useSiteConfig } from "@/lib/site-config";

const ICON_MAP: Record<string, React.ReactNode> = {
  chef: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3a4 4 0 00-4 4c0 1.5.6 2.8 1.5 3.8A6 6 0 006 16.5h12a6 6 0 00-3.5-5.7A4 4 0 0016 7a4 4 0 00-4-4zM6 16.5v3a1.5 1.5 0 001.5 1.5h9a1.5 1.5 0 001.5-1.5v-3" />
  ),
  sparkles: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h3.75M9 12a3 3 0 01-3-3M9 12a3 3 0 003 3M9 12H5.25M9 12l2.25 2.25M9 12l2.25-2.25M12 3v2.25M12 3a9 9 0 00-9 9m9-9a9 9 0 019 9m-9 9v-2.25M21 12a9 9 0 01-9 9m-9-9a9 9 0 019 9" />
  ),
  heart: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
  ),
  star: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
  ),
};

export default function PorQueElegirnos() {
  const config = useSiteConfig();
  const features = config.features;

  return (
    <section id="elegirnos" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-brand-copper font-medium tracking-[0.4em] uppercase text-xs mb-4 block">
            Nuestra Diferencia
          </span>
          <h2 className="font-serif text-4xl md:text-5xl text-dark-elegant mb-6">
            {features.title}
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.items.map((f) => (
            <div
              key={f.title}
              className="text-center p-6 bg-cream rounded-2xl border border-brand-copper/10 hover:-translate-y-2 transition-transform duration-300"
            >
              <div className="w-16 h-16 bg-brand-copper/10 text-brand-copper rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  {ICON_MAP[f.icon] || ICON_MAP.star}
                </svg>
              </div>
              <h3 className="font-serif text-xl mb-3 text-dark-elegant">{f.title}</h3>
              <p className="text-sm text-slate-500">{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
