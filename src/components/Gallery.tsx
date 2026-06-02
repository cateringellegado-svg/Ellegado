"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSiteConfig } from "@/lib/site-config";

const FALLBACK_IMAGES = [
  "/hero_catering.webp",
  "/event_vibe.webp",
  "/gourmet_canapes.webp",
];

const FALLBACK_ALT = [
  "Evento al aire libre",
  "Detalles de mesa",
  "Bocados premium",
];

export default function Gallery() {
  const config = useSiteConfig();
  const images = config.images.gallery.length > 0 ? config.images.gallery : FALLBACK_IMAGES;
  const [loadedImgs, setLoadedImgs] = useState<Set<number>>(new Set());
  const [prevBtnVisible, setPrevBtnVisible] = useState(false);
  const [nextBtnVisible, setNextBtnVisible] = useState(true);

  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", loop: false });

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setPrevBtnVisible(emblaApi.canScrollPrev());
    setNextBtnVisible(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setPrevBtnVisible(emblaApi.canScrollPrev());
    setNextBtnVisible(emblaApi.canScrollNext());
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <section id="galeria" className="py-24 bg-cream">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-brand-copper font-medium tracking-[0.4em] uppercase text-xs mb-4 block">
            Nuestra Experiencia
          </span>
          <h2 className="font-serif text-4xl md:text-5xl text-dark-elegant mb-6">
            Momentos Inmortalizados
          </h2>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-brand-copper to-transparent mx-auto" />
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-2xl" ref={emblaRef}>
            <div className="flex -ml-4">
              {images.map((src, i) => (
                <div
                  key={i}
                  className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0 pl-4"
                >
                  <div className="relative h-64 md:h-80 overflow-hidden rounded-2xl shadow-lg group">
                    {!loadedImgs.has(i) && (
                      <div className="absolute inset-0 bg-slate-200 animate-pulse rounded-2xl" />
                    )}
                    <Image
                      src={src}
                      alt={FALLBACK_ALT[i] || `Galería ${i + 1}`}
                      width={400}
                      height={500}
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${
                        loadedImgs.has(i) ? "opacity-100" : "opacity-0"
                      }`}
                      onLoad={() => setLoadedImgs((prev) => new Set(prev).add(i))}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {prevBtnVisible && (
            <button
              onClick={scrollPrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 md:-translate-x-5 w-10 h-10 rounded-full bg-white shadow-lg border border-brand-copper/10 flex items-center justify-center text-brand-copper hover:bg-brand-copper hover:text-white transition-all cursor-pointer z-10"
              aria-label="Anterior foto"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          {nextBtnVisible && (
            <button
              onClick={scrollNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 md:translate-x-5 w-10 h-10 rounded-full bg-white shadow-lg border border-brand-copper/10 flex items-center justify-center text-brand-copper hover:bg-brand-copper hover:text-white transition-all cursor-pointer z-10"
              aria-label="Siguiente foto"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>

        {images.length > 1 && emblaApi && (
          <div className="flex justify-center gap-2 mt-8">
            {emblaApi.scrollSnapList().map((_, index) => (
              <button
                key={index}
                onClick={() => emblaApi.scrollTo(index)}
                className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                  emblaApi.selectedScrollSnap() === index
                    ? "bg-brand-copper w-6"
                    : "bg-brand-copper/30 hover:bg-brand-copper/50"
                }`}
                aria-label={`Ir a foto ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
