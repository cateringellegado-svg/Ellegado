"use client";

import { useSiteConfig } from "@/lib/site-config";
import { getIcon } from "@/lib/icons";

export default function Proximamente() {
  const config = useSiteConfig();
  const comingSoon = config.comingSoon;
  const BowlIcon = getIcon("bowl");

  return (
    <div className="mt-24">
      <div className="text-center mb-12">
        <span className="text-brand-copper font-medium tracking-[0.4em] uppercase text-xs mb-4 block">
          Próximamente
        </span>
        <h2 className="font-serif text-4xl md:text-5xl text-dark-elegant">{comingSoon.title}</h2>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {comingSoon.items.map((s) => {
          const IconComp = getIcon(s.icon) || BowlIcon;
          return (
            <div
              key={s.title}
              className="bg-white rounded-2xl p-6 text-center shadow-lg border border-brand-copper/10 hover:shadow-xl transition-shadow"
            >
              <div className="w-16 h-16 bg-brand-copper/10 rounded-full flex items-center justify-center mx-auto mb-4">
                {IconComp && <IconComp className="w-8 h-8 text-brand-copper" strokeWidth={1.5} />}
              </div>
              <h3 className="font-serif text-xl text-dark-elegant mb-2">{s.title}</h3>
              <p className="text-slate-600 text-sm">{s.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
