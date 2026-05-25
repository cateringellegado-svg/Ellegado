"use client";

import { useSiteConfig } from "@/lib/site-config";

const ICON_MAP: Record<string, React.ReactNode> = {
  bowl: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10.5h18M3 10.5a9 9 0 0118 0M3 10.5l1.5 9a3 3 0 003 3h9a3 3 0 003-3l1.5-9M9 7.5l1.5-3h3l1.5 3" />
  ),
  smoothie: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  ),
  grill: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
  ),
  cheese: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  ),
};

export default function Proximamente() {
  const config = useSiteConfig();
  const comingSoon = config.comingSoon;

  return (
    <div className="mt-24">
      <div className="text-center mb-12">
        <span className="text-brand-copper font-medium tracking-[0.4em] uppercase text-xs mb-4 block">
          Próximamente
        </span>
        <h2 className="font-serif text-4xl md:text-5xl text-dark-elegant">{comingSoon.title}</h2>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {comingSoon.items.map((s) => (
          <div
            key={s.title}
            className="bg-white rounded-2xl p-6 text-center shadow-lg border border-brand-copper/10 hover:shadow-xl transition-shadow"
          >
            <div className="w-16 h-16 bg-brand-copper/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-brand-copper" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {ICON_MAP[s.icon] || ICON_MAP.bowl}
              </svg>
            </div>
            <h3 className="font-serif text-xl text-dark-elegant mb-2">{s.title}</h3>
            <p className="text-slate-600 text-sm">{s.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
