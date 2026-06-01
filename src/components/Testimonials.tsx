"use client";

import { useEffect, useState, useRef, useCallback, startTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import type { SiteTestimonial } from "@/lib/site-config";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Testimonials() {
  const supabase = createClient();
  const [testimonials, setTestimonials] = useState<SiteTestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [prevBtnVisible, setPrevBtnVisible] = useState(false);
  const [nextBtnVisible, setNextBtnVisible] = useState(true);
  const mounted = useRef(true);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: false,
  });

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setPrevBtnVisible(emblaApi.canScrollPrev());
    setNextBtnVisible(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    startTransition(() => {
      setPrevBtnVisible(emblaApi.canScrollPrev());
      setNextBtnVisible(emblaApi.canScrollNext());
    });
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    mounted.current = true;
    const safetyTimer = setTimeout(() => {
      if (mounted.current) {
        setLoading(false);
        setLoadError(true);
      }
    }, 10000);
    (async () => {
      if (!supabase) {
        if (mounted.current) setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from("testimonials")
          .select("*")
          .eq("active", true)
          .order("orden", { ascending: true });
        if (!mounted.current) return;
        clearTimeout(safetyTimer);
        if (error) {
          console.error("Error al cargar testimonios — RLS? tabla no existe?:", error);
          setLoadError(true);
        } else if (data) {
          setTestimonials(data as SiteTestimonial[]);
        }
      } catch (err) {
        console.error("Error al cargar testimonios (catch):", err);
        if (mounted.current) {
          clearTimeout(safetyTimer);
          setLoadError(true);
        }
      } finally {
        if (mounted.current) setLoading(false);
      }
    })();
    return () => {
      mounted.current = false;
      clearTimeout(safetyTimer);
    };
  }, []);

  if (loading) {
    return (
      <section className="py-32 bg-white border-t border-brand-copper/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-center py-12">
            <div className="animate-pulse flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-brand-copper/20 border-t-brand-copper rounded-full animate-spin" />
              <p className="text-slate-500 text-sm">Cargando testimonios...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (loadError) {
    return (
      <section className="py-32 bg-white border-t border-brand-copper/5">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 max-w-md mx-auto">
            <p className="text-sm text-amber-700 font-medium">No se pudieron cargar los testimonios</p>
            <p className="text-xs text-amber-500 mt-1">Intentá de nuevo más tarde.</p>
          </div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) return null;

  return (
    <section
      id="testimonios"
      className="py-32 bg-white border-t border-brand-copper/5"
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
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

        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex -ml-4">
              {testimonials.map((t) => (
                <div
                  key={t.id}
                  className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0 pl-4"
                >
                  <article className="bg-cream rounded-3xl p-8 border border-brand-copper/10 hover:shadow-xl hover:scale-[1.01] transition-all duration-500 flex flex-col justify-between group h-full">
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
                        <div className="flex text-amber-500 text-sm" aria-label={`${t.rating} de 5 estrellas`}>
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
                </div>
              ))}
            </div>
          </div>

          {prevBtnVisible && (
            <button
              onClick={scrollPrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 md:-translate-x-5 w-10 h-10 rounded-full bg-white shadow-lg border border-brand-copper/10 flex items-center justify-center text-brand-copper hover:bg-brand-copper hover:text-white transition-all cursor-pointer z-10"
              aria-label="Anterior testimonio"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          {nextBtnVisible && (
            <button
              onClick={scrollNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 md:translate-x-5 w-10 h-10 rounded-full bg-white shadow-lg border border-brand-copper/10 flex items-center justify-center text-brand-copper hover:bg-brand-copper hover:text-white transition-all cursor-pointer z-10"
              aria-label="Siguiente testimonio"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>

        {testimonials.length > 3 && (
          <div className="flex justify-center gap-2 mt-8">
            {emblaApi && (
              <span className="text-xs text-slate-400">
                {emblaApi.selectedScrollSnap() + 1} / {emblaApi.scrollSnapList().length}
              </span>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
