"use client";

import { useSiteConfig } from "@/lib/site-config";

const ICON_MAP: Record<string, React.ReactNode> = {
  bowl: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10.5h18M3 10.5a9 9 0 0118 0M3 10.5l1.5 9a3 3 0 003 3h9a3 3 0 003-3l1.5-9M9 7.5l1.5-3h3l1.5 3" />
  ),
  smoothie: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 4l.75 2.25M13.5 4l-.75 2.25M7.5 12.75l1.5-9h6l1.5 9m-9 0A2.25 2.25 0 007.5 15h9a2.25 2.25 0 001.5-2.25m-9 0h9M7.5 15l.75 3.75a2.25 2.25 0 002.25 1.86h3a2.25 2.25 0 002.25-1.86L16.5 15" />
  ),
  grill: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 4.5l-1.5 3M12 3l1.5 3m-3 0L12 3m0 0l1.5 3M9 6.75h6M9 6.75a3 3 0 01-3 3m3-3a3 3 0 00-3-3m9 3a3 3 0 013 3m-3-3a3 3 0 00-3-3M5.25 10.5h13.5M5.25 10.5a2.25 2.25 0 01-2.25 2.25M5.25 10.5H3m16.5 0a2.25 2.25 0 012.25 2.25M19.5 10.5H21m-3 6.75l-1.5-3m-9 0l-1.5 3M6 17.25h12" />
  ),
  cheese: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8.5l9-4.5 9 4.5v7l-9 4.5-9-4.5v-7zM12 10.5v3.75M9.75 9l-3.75 1.5m12-1.5l-3.75 1.5M7.5 15.75l1.5-3m7.5 3l-1.5-3M12 17.25v-3" />
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
