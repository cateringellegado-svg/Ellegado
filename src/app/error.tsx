"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-cream">
      <h1 className="font-serif text-6xl md:text-7xl text-brand-copper font-bold mb-4">
        Oops
      </h1>
      <p className="font-serif text-2xl text-dark-elegant mb-4" role="alert">
        Algo salió mal
      </p>
      <p className="text-slate-500 mb-8 max-w-md">
        Ocurrió un error inesperado. Por favor, intentá de nuevo.
      </p>
      <button
        onClick={reset}
        className="inline-block px-8 py-4 bg-brand-copper text-white font-semibold rounded-full shadow-lg hover:scale-105 transition-all duration-300 uppercase tracking-widest text-sm cursor-pointer"
      >
        Intentar de nuevo
      </button>
    </div>
  );
}
