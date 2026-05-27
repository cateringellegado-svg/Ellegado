"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useToast } from "./Toast";

export default function PaymentStatusHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showToast } = useToast();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    const status = searchParams.get("mp_status");
    if (!status) return;
    handled.current = true;

    switch (status) {
      case "success":
        showToast("¡Tu reserva ha sido confirmada con éxito!", "success");
        localStorage.removeItem("legado_cotizacion");
        break;
      case "failure":
        showToast("El pago no pudo completarse. Podés intentar de nuevo o usar WhatsApp.", "error");
        break;
      case "pending":
        showToast("Tu pago está siendo procesado. Te notificaremos cuando se confirme.", "warning");
        break;
    }

    const url = new URL(window.location.href);
    url.searchParams.delete("mp_status");
    router.replace(url.pathname + url.search, { scroll: false });
  }, [searchParams, router, showToast]);

  return null;
}
