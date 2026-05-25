"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("legado_cookie_consent");
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("legado_cookie_consent", "accepted");
    setVisible(false);
  };

  const reject = () => {
    localStorage.setItem("legado_cookie_consent", "rejected");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-brand-copper/20 shadow-2xl transition-transform duration-500"
      style={{ transform: "translateY(0)" }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="text-sm text-dark-elegant font-medium">
            Utilizamos cookies para mejorar tu experiencia.
          </p>
          <p className="text-xs text-slate-600 mt-1">
            Al continuar navegando, aceptas nuestra{" "}
            <Link
              href="/privacidad"
              className="text-brand-copper underline hover:text-brand-copper-light"
            >
              Política de Privacidad
            </Link>{" "}
            y el uso de cookies conforme a la Ley 25.326.
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={reject}
            className="px-4 py-2 text-xs font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Rechazar
          </button>
          <button
            onClick={accept}
            className="px-4 py-2 text-xs font-medium text-white bg-brand-copper rounded-lg hover:bg-brand-copper-light transition-colors cursor-pointer"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
