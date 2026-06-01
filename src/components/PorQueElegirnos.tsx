"use client";

import { useSiteConfig } from "@/lib/site-config";
import { getIcon } from "@/lib/icons";

export default function PorQueElegirnos() {
  const config = useSiteConfig();
  const features = config.features;
  const StarIcon = getIcon("star");

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
          {features.items.map((f) => {
            const IconComp = getIcon(f.icon) || StarIcon;
            return (
              <div
                key={f.title}
                className="text-center p-6 bg-cream rounded-2xl border border-brand-copper/10 hover:-translate-y-2 transition-transform duration-300"
              >
                <div className="w-16 h-16 bg-brand-copper/10 text-brand-copper rounded-full flex items-center justify-center mx-auto mb-6">
                  {IconComp && <IconComp className="w-8 h-8" strokeWidth={1.5} />}
                </div>
                <h3 className="font-serif text-xl mb-3 text-dark-elegant">{f.title}</h3>
                <p className="text-sm text-slate-500">{f.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
