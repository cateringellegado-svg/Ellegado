"use client";

import Image from "next/image";
import { useSiteConfig } from "@/lib/site-config";

const FALLBACK_IMAGES = [
  "/hero_catering.webp",
  "/event_vibe.webp",
  "/gourmet_canapes.webp",
  "/gourmet_canapes.webp",
  "/hero_catering.webp",
  "/event_vibe.webp",
];

const FALLBACK_ALT = [
  "Evento al aire libre",
  "Detalles de mesa",
  "Bocados premium",
  "Canapés dulces",
  "Celebración corporativa",
  "Ambiente elegante",
];

export default function Gallery() {
  const config = useSiteConfig();
  const images = config.images.gallery.length >= 6 ? config.images.gallery : FALLBACK_IMAGES;

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

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {images.map((src, i) => (
            <div
              key={`${src}-${i}`}
              className="rounded-2xl overflow-hidden shadow-lg h-64 md:h-80 group"
            >
              <Image
                src={src}
                alt={FALLBACK_ALT[i] || ""}
                width={400}
                height={500}
                sizes="(max-width: 768px) 50vw, 33vw"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
