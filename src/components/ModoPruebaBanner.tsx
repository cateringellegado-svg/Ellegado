"use client";

import { useEffect, useState } from "react";

export default function ModoPruebaBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function check() {
      try {
        const res = await fetch("/api/configuracion");
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) setShow(data.entorno === "prueba");
        }
      } catch {}
    }
    check();
    return () => { cancelled = true; };
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-xs bg-amber-50 border border-amber-300 rounded-xl px-4 py-3 shadow-lg">
      <p className="text-xs font-semibold text-amber-800 flex items-center gap-1.5">
        <span>🧪</span> Modo Prueba — Sin cobros reales
      </p>
      <p className="text-[10px] text-amber-600 mt-0.5">
        Los pagos se procesan en Sandbox
      </p>
    </div>
  );
}
