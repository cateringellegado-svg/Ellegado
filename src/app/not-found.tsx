import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-cream">
      <h1 className="font-serif text-8xl md:text-9xl text-brand-copper font-bold mb-4">
        404
      </h1>
      <p className="font-serif text-2xl md:text-3xl text-dark-elegant mb-8">
        Página no encontrada
      </p>
      <p className="text-slate-500 mb-12 max-w-md">
        La página que buscas no existe o ha sido movida.
      </p>
      <Link
        href="/"
        className="inline-block px-8 py-4 bg-brand-copper text-white font-semibold rounded-full shadow-lg hover:scale-105 transition-all duration-300 uppercase tracking-widest text-sm"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
