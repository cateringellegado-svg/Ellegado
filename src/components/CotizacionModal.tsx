"use client";

import { useState, useCallback } from "react";
import type { CotizacionSeleccion } from "@/types";
import { useToast } from "./Toast";
import { WHATSAPP_NUMBER } from "@/lib/constants";
const WHATSAPP_MSG_PREFIX =
  "Hola El Legado, me gustaría solicitar una cotización de catering.";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  cotizacion: CotizacionSeleccion;
  total: number;
}

export default function CotizacionModal({
  isOpen,
  onClose,
  cotizacion,
  total,
}: Props) {
  const { showToast } = useToast();
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitting(true);

      const productos = Object.values(cotizacion).filter(
        (p) => p.cantidad > 0 && p.precio > 0
      );
      const totalFormat = "$" + total.toLocaleString("es-AR");

      const productosTexto = productos
        .map(
          (p) =>
            `• ${p.nombre}: ${p.cantidad} unidades ($${p.subtotal.toLocaleString("es-AR")})`
        )
        .join("\n");

      const mensajePersonal = `Mi nombre es ${nombre}. Quedo atento a su respuesta para coordinar los detalles.`;
      const mensaje = `${WHATSAPP_MSG_PREFIX}\n\n*Productos solicitados:*\n${productosTexto}\n\n*Total estimado:* ${totalFormat}\n\n${mensajePersonal}`;

      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`;

      const res = await fetch("/api/cotizaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          total_unidades: productos.reduce((sum, p) => sum + p.cantidad, 0),
          productos: productos.map((p) => ({
            nombre: p.nombre,
            cantidad: p.cantidad,
          })),
          total,
          cliente_nombre: nombre,
          cliente_telefono: telefono,
          cliente_email: email || "",
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        showToast(err.error || "Error al enviar cotización", "error");
        setSubmitting(false);
        return;
      }

      window.open(waUrl, "_blank", "noopener,noreferrer");
      showToast("Cotización enviada correctamente", "success");
      setSubmitting(false);
      onClose();
    },
    [cotizacion, total, nombre, telefono, email, onClose, showToast]
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-dark-elegant/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-dark-elegant transition-colors cursor-pointer"
          aria-label="Cerrar"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-brand-copper/10 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-copper">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="font-serif text-2xl text-dark-elegant mb-2">
            Casi listo...
          </h3>
          <p className="text-sm text-slate-600">
            Completa tus datos para enviarte la propuesta formal por WhatsApp.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Nombre y Apellido *
            </label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-copper"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Teléfono *
            </label>
            <input
              type="tel"
              required
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="+54 11 1234 5678"
              pattern="[\+]?[0-9\s\-]{7,20}"
              className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-copper"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Opcional"
              className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-copper"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#25D366] text-white font-semibold py-4 rounded-xl shadow-lg shadow-[#25D366]/30 hover:scale-[1.02] transition-all duration-300 uppercase tracking-widest text-sm flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-50"
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.438 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
            </svg>
            {submitting ? "Enviando..." : "Enviar a WhatsApp"}
          </button>
        </form>
      </div>
    </div>
  );
}
