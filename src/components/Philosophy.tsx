import Image from "next/image";

export default function Philosophy() {
  return (
    <section
      id="filosofia"
      className="py-32 bg-white border-y border-brand-copper/5 relative"
    >
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
        <div className="text-center md:text-left">
          <h2 className="font-serif text-3xl md:text-4xl mb-12 text-brand-copper italic tracking-widest uppercase">
            Nuestra Filosofía
          </h2>
          <p className="text-xl md:text-3xl font-serif leading-relaxed text-slate-800 italic">
            &ldquo;En{" "}
            <span className="font-bold text-brand-copper underline decoration-brand-copper/20 underline-offset-8">
              El Legado
            </span>
            , entendemos que tu evento no es solo una fecha; es la construcción
            de un recuerdo.&rdquo;
          </p>
          <p className="mt-8 text-lg text-slate-600 font-sans tracking-wide">
            Nos especializamos en eventos de mediana envergadura, ofreciendo una
            experiencia gastronómica de alta gama con un trato cercano y
            profesional.
          </p>
        </div>
        <div className="relative group">
          <div className="absolute -inset-4 bg-brand-copper/10 rounded-2xl blur-xl group-hover:bg-brand-copper/20 transition-all" />
          <div className="relative rounded-2xl shadow-2xl border border-brand-copper/10 grayscale-[30%] hover:grayscale-0 transition-all duration-700 overflow-hidden">
            <Image
              src="/event_vibe.webp"
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
