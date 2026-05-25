import Link from "next/link";
import type { Metadata } from "next";

interface Props {
  children: React.ReactNode;
  title: string;
  badge: string;
  lastUpdated?: string;
}

export function generateLegalMetadata(title: string, description: string): Metadata {
  return {
    title: `${title} | EL LEGADO - Catering y Eventos`,
    description,
  };
}

export default function LegalPageShell({
  children,
  title,
  badge,
  lastUpdated = "20 de mayo de 2026",
}: Props) {
  return (
    <div className="bg-cream text-dark-elegant font-sans selection:bg-brand-copper/20 min-h-screen flex flex-col">
      <nav className="w-full bg-white/90 backdrop-blur-md border-b border-brand-copper/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link
            href="/"
            className="flex items-center gap-3 group"
            aria-label="Volver al inicio"
          >
            <div className="w-10 h-10 bg-brand-copper rounded-full flex items-center justify-center text-white font-serif font-bold text-xl">
              L
            </div>
            <span className="font-serif font-semibold text-xl tracking-widest uppercase text-brand-copper group-hover:text-dark-elegant transition-colors">
              EL LEGADO
            </span>
          </Link>
          <Link
            href="/"
            className="text-xs font-medium tracking-widest uppercase text-slate-600 hover:text-brand-copper transition-colors"
          >
            &larr; Volver
          </Link>
        </div>
      </nav>

      <main id="main-content" className="flex-grow py-20 px-6">
        <div className="max-w-3xl mx-auto bg-white rounded-3xl p-10 md:p-16 shadow-xl border border-brand-copper/10">
          <div className="text-center mb-12 border-b border-brand-copper/10 pb-8">
            <span className="text-brand-copper font-medium tracking-[0.4em] uppercase text-xs mb-4 block">
              {badge}
            </span>
            <h1 className="font-serif text-4xl md:text-5xl text-dark-elegant">
              {title}
            </h1>
            <p className="text-slate-500 mt-3 text-sm">
              Última actualización: {lastUpdated}
            </p>
          </div>

          <div className="space-y-8 text-sm md:text-base leading-relaxed text-slate-600">
            {children}
          </div>

          <div className="mt-16 pt-8 border-t border-brand-copper/10 text-xs text-slate-500 text-center">
            <p>El Legado Catering y Eventos &middot; Buenos Aires, Argentina</p>
            <p className="mt-1">
              catering.ellegado@gmail.com &middot; ellegado.vercel.app
            </p>
          </div>
        </div>
      </main>

      <footer className="py-8 bg-white border-t border-brand-copper/10 text-center text-xs text-slate-500 uppercase tracking-widest">
        &copy; 2026 El Legado. Todos los derechos reservados.
      </footer>
    </div>
  );
}
