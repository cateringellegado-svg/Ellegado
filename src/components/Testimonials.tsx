"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useSiteConfig } from "@/lib/site-config";
import type { SiteTestimonial } from "@/lib/site-config";

export default function Testimonials() {
  const config = useSiteConfig();
  const [testimonials, setTestimonials] = useState<SiteTestimonial[]>([]);

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from("testimonials")
      .select("*")
      .eq("active", true)
      .order("orden", { ascending: true })
      .then(({ data }) => {
        if (data) setTestimonials(data as SiteTestimonial[]);
      });
  }, []);

  if (testimonials.length === 0) return null;

  return (
    <section
      id="testimonios"
      className="py-32 bg-white border-t border-brand-copper/5"
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-24">
          <span className="text-brand-copper font-medium tracking-[0.4em] uppercase text-xs mb-4 block">
            Experiencias Reales
          </span>
          <h2 className="font-serif text-5xl md:text-6xl mb-6">
            Momentos Eternos
          </h2>
          <p className="text-slate-500 font-light italic max-w-xl mx-auto">
            Lo que dicen quienes han confiado su celebración y recuerdos en
            nuestras manos.
          </p>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-brand-copper to-transparent mx-auto mt-6" />
        </div>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 text-left">
          {testimonials.map((t) => (
            <article
              key={t.id}
              className="bg-cream rounded-3xl p-8 border border-brand-copper/10 hover:shadow-xl hover:scale-[1.01] transition-all duration-500 flex flex-col justify-between group"
            >
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-brand-copper/10 pb-4">
                  <div>
                    <h4 className="font-serif text-2xl font-semibold text-brand-copper italic">
                      {t.name}
                    </h4>
                    <span className="text-[10px] text-slate-600 tracking-wider uppercase font-medium">
                      {t.event}
                    </span>
                  </div>
                  <div className="flex text-amber-500 text-sm">
                    {"★".repeat(t.rating)}{"☆".repeat(5 - t.rating)}
                  </div>
                </div>
                <p className="font-serif text-lg text-slate-700 italic leading-relaxed">
                  &ldquo;{t.text}&rdquo;
                </p>
              </div>
              {t.menu && (
                <div className="mt-8 pt-4 border-t border-brand-copper/5 flex items-center justify-between text-[10px] font-semibold text-brand-copper tracking-widest uppercase">
                  <span>Menú: {t.menu}</span>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
