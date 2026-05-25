"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import type { Producto, CotizacionSeleccion } from "@/types";
import { fetchProductsByCategory } from "@/lib/supabase";
import { useToast } from "./Toast";
import CotizacionModal from "./CotizacionModal";

const FALLBACK_CLASICOS: Producto[] = [
  { id: "canapes", nombre: "Canapés", descripcion: "Pan de chips con variantes: pollo pimentón, pollo ciboulette, huevo y tomate cherry", precio: 500, unidad: "unidad", minimo: 50, incremento: 10 },
  { id: "mini_hamburguesas", nombre: "Mini Hamburguesas", descripcion: "3 variantes: Clásico, Aliloy, Gourmet", precio: 760, unidad: "unidad", minimo: 50, incremento: 10 },
  { id: "mini_empanadas", nombre: "Mini Empanadas", descripcion: "4 rellenos: carne, jamón y queso, pollo, caprese", precio: 400, unidad: "unidad", minimo: 50, incremento: 10 },
  { id: "tapaditos", nombre: "Tapaditos", descripcion: "Pan figasa con 3 pastas", precio: 600, unidad: "unidad", minimo: 50, incremento: 10 },
  { id: "mini_pizzas", nombre: "Mini Pizzas", descripcion: "Napolitana: queso, tomate, jamón y aceituna", precio: 560, unidad: "unidad", minimo: 50, incremento: 10 },
  { id: "sopaipillas", nombre: "Mini Sopaipillas con Pebre", descripcion: "Sopaipillas tradicionales con pebre", precio: 400, unidad: "unidad", minimo: 50, incremento: 10 },
  { id: "mini_conitos", nombre: "Mini Conitos", descripcion: "Cono de rapidita rellenos", precio: 1440, unidad: "unidad", minimo: 50, incremento: 10 },
  { id: "sandwich_miga", nombre: "Mini Sándwich de Miga", descripcion: "Jamón y queso decorado", precio: 600, unidad: "unidad", minimo: 50, incremento: 10 },
  { id: "fosforitos", nombre: "Fosforitos", descripcion: "Jamón y queso", precio: 460, unidad: "unidad", minimo: 50, incremento: 10 },
];

import Proximamente from "./Proximamente";

const FALLBACK_DULCES: Producto[] = [
  { id: "canastitas", nombre: "Canastitas", descripcion: "Relleno: crema, dulce de leche y mousse de chocolate", precio: 650, unidad: "unidad", minimo: 50, incremento: 10 },
  { id: "shots", nombre: "Shots variados", descripcion: "Variedad de sabores a elección", precio: 850, unidad: "unidad", minimo: 50, incremento: 10 },
  { id: "tacitas", nombre: "Tacitas Rellenas", descripcion: "Masa de hojaldre con relleno de crema", precio: 700, unidad: "unidad", minimo: 50, incremento: 10 },
];

type TabKey = "clasica" | "premium" | "dulce";

const TABS: { key: TabKey; label: string }[] = [
  { key: "clasica", label: "Experiencia Clásica" },
  { key: "premium", label: "Experiencia Premium" },
  { key: "dulce", label: "Experiencia Dulce" },
];

function formatARS(value: number | null | undefined): string {
  if (value == null) return "Por definir";
  return "$" + value.toLocaleString("es-AR");
}

function getProductCategory(
  id: string,
  clasicos: Producto[],
  premium: Producto[],
  dulces: Producto[]
): string | null {
  if (clasicos.find((p) => p.id === id)) return "clasica";
  if (premium.find((p) => p.id === id)) return "premium";
  if (dulces.find((p) => p.id === id)) return "dulce";
  return null;
}

export default function Festin() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabKey>("clasica");
  const [clasicos, setClasicos] = useState<Producto[]>([]);
  const [premium, setPremium] = useState<Producto[]>([]);
  const [dulces, setDulces] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [cotizacion, setCotizacion] = useState<CotizacionSeleccion>(() => {
    try {
      return JSON.parse(localStorage.getItem("legado_cotizacion") || "{}");
    } catch {
      return {};
    }
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [rateLimit, setRateLimit] = useState<number[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("legado_rate_limit") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      const [clasicosData, premiumData, dulcesData] = await Promise.all([
        fetchProductsByCategory("clasica"),
        fetchProductsByCategory("premium"),
        fetchProductsByCategory("dulce"),
      ]);
      setClasicos(clasicosData ?? FALLBACK_CLASICOS);
      setPremium(premiumData ?? []);
      setDulces(dulcesData ?? FALLBACK_DULCES);
      setLoading(false);
    }
    loadProducts();
  }, []);

  useEffect(() => {
    localStorage.setItem("legado_cotizacion", JSON.stringify(cotizacion));
  }, [cotizacion]);

  const selectedProducts = useMemo(
    () => Object.values(cotizacion).filter((p) => p.cantidad > 0 && p.precio > 0),
    [cotizacion]
  );

  const categories = useMemo(() => {
    const cats = new Set<string>();
    selectedProducts.forEach((p) => {
      const cat = getProductCategory(p.id, clasicos, premium, dulces);
      if (cat) cats.add(cat);
    });
    return cats;
  }, [selectedProducts, clasicos, premium, dulces]);

  const hasConflict = categories.has("clasica") && categories.has("premium");
  const total = useMemo(
    () => selectedProducts.reduce((sum, p) => sum + p.subtotal, 0),
    [selectedProducts]
  );

  const handleQuantityChange = useCallback(
    (producto: Producto, value: string) => {
      const cantidad = parseInt(value) || 0;
      if (cantidad > 0 && producto.precio) {
        const precio = producto.precio;
        setCotizacion((prev) => ({
          ...prev,
          [producto.id]: {
            id: producto.id,
            nombre: producto.nombre,
            cantidad,
            precio,
            subtotal: cantidad * precio,
          },
        }));
      } else {
        setCotizacion((prev) => {
          const { [producto.id]: _, ...rest } = prev;
          return rest;
        });
      }
    },
    []
  );

  const adjustQuantity = useCallback(
    (producto: Producto, delta: number) => {
      const current = cotizacion[producto.id]?.cantidad || 0;
      const min = producto.minimo || 50;
      const step = producto.incremento || 10;
      let newVal: number;
      if (current === 0 && delta > 0) {
        newVal = min;
      } else {
        newVal = current + delta * step;
      }
      if (newVal < min) {
        setCotizacion((prev) => {
          const { [producto.id]: _, ...rest } = prev;
          return rest;
        });
        return;
      }
      if (producto.precio) {
        const precio = producto.precio;
        setCotizacion((prev) => ({
          ...prev,
          [producto.id]: {
            id: producto.id,
            nombre: producto.nombre,
            cantidad: newVal,
            precio,
            subtotal: newVal * precio,
          },
        }));
        showToast(`${producto.nombre} ${delta > 0 ? "agregado" : "actualizado"} (${newVal} u.)`, "success");
      }
    },
    [cotizacion, showToast]
  );

  const handleCotizarClick = useCallback(() => {
    if (selectedProducts.length === 0) {
      showToast("Por favor selecciona al menos un producto con cantidad válida", "warning");
      return;
    }
    const now = Date.now();
    const recent = rateLimit.filter((t) => now - t < 3600000);
    if (recent.length >= 5) {
      showToast("Demasiadas solicitudes. Esperá unos minutos antes de intentar nuevamente.", "warning");
      return;
    }
    recent.push(now);
    setRateLimit(recent);
    localStorage.setItem("legado_rate_limit", JSON.stringify(recent));
    setModalOpen(true);
  }, [selectedProducts, rateLimit, showToast]);

  const renderProductCard = (producto: Producto, isPremium: boolean) => {
    const disabled = producto.pendiente;
    const qty = cotizacion[producto.id]?.cantidad || 0;

    return (
      <div
        key={producto.id}
        className={`relative rounded-2xl border transition-all duration-300 flex flex-col h-full group ${
          disabled
            ? "opacity-60 grayscale-[50%]"
            : "hover:shadow-xl hover:-translate-y-1"
        } ${
          isPremium
            ? "bg-slate-800/50 backdrop-blur-sm border-brand-copper/20 hover:border-brand-copper/40"
            : "bg-white border-brand-copper/20 hover:border-brand-copper/40"
        }`}
      >
        {disabled && (
          <span className="absolute top-3 right-3 text-[10px] bg-amber-100/80 text-amber-700 px-3 py-1 rounded-full font-medium tracking-wider uppercase border border-amber-200 backdrop-blur-sm z-10">
            Próximamente
          </span>
        )}
        {producto.imagen_url && (
          <div className="mb-3 rounded-xl overflow-hidden h-32 border border-brand-copper/5">
            <Image
              src={producto.imagen_url}
              alt={producto.nombre}
              width={300}
              height={200}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="p-5 flex flex-col flex-1">
          <div className="mb-3 flex gap-3 items-start">
            <div
              className={`p-2 rounded-xl border border-brand-copper/5 group-hover:bg-brand-copper/5 transition-colors flex-shrink-0 ${
                isPremium ? "bg-brand-copper/20" : "bg-cream"
              }`}
            >
              <svg
                className="w-5 h-5 text-brand-copper/60"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
            </div>
            <h4
              className={`font-serif text-lg font-medium leading-tight ${
                isPremium ? "text-slate-100" : "text-dark-elegant"
              }`}
            >
              {producto.nombre}
            </h4>
          </div>
          <p
            className={`text-xs mb-5 flex-grow font-light leading-relaxed ${
              isPremium ? "text-slate-400" : "text-slate-600"
            }`}
          >
            {producto.descripcion || ""}
          </p>

          <div className="flex justify-between items-end mt-auto pt-4 border-t border-brand-copper/5">
            <div>
              <span className="text-[9px] text-slate-600 font-medium uppercase tracking-widest block mb-1">
                Valor Unitario
              </span>
              <span className="font-sans text-sm text-brand-copper font-bold">
                {formatARS(producto.precio)}
              </span>
            </div>

            {!disabled && (
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center bg-cream border border-brand-copper/20 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => adjustQuantity(producto, -1)}
                    className="px-2 py-1 text-brand-copper hover:bg-brand-copper/10 transition-colors cursor-pointer"
                    aria-label={`Reducir cantidad de ${producto.nombre}`}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={qty || ""}
                    onChange={(e) => handleQuantityChange(producto, e.target.value)}
                    min={producto.minimo}
                    step={producto.incremento}
                    className="w-12 text-center bg-transparent border-x border-brand-copper/10 py-1 text-sm font-medium text-dark-elegant focus:outline-none appearance-none"
                    placeholder="0"
                    aria-label={`Cantidad de ${producto.nombre}`}
                  />
                  <button
                    type="button"
                    onClick={() => adjustQuantity(producto, 1)}
                    className="px-2 py-1 text-brand-copper hover:bg-brand-copper/10 transition-colors cursor-pointer"
                    aria-label={`Aumentar cantidad de ${producto.nombre}`}
                  >
                    +
                  </button>
                </div>
                <span className="text-[9px] text-slate-600 italic">
                  Mín: {producto.minimo} / +{producto.incremento}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const currentProducts =
    activeTab === "clasica"
      ? clasicos
      : activeTab === "premium"
        ? premium
        : dulces;

  const isPremiumTab = activeTab === "premium";

  return (
    <section id="festin" className="py-32 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <span className="text-brand-copper font-medium tracking-[0.4em] uppercase text-xs mb-4 block">
          Propuesta Gastronómica
        </span>
        <h2 className="font-serif text-5xl md:text-6xl mb-6">El Festín</h2>
        <div className="w-24 h-px bg-gradient-to-r from-transparent via-brand-copper to-transparent mx-auto mb-12" />
      </div>

      <div className="mb-16 rounded-3xl overflow-hidden h-[400px] shadow-2xl border border-brand-copper/10">
        <Image
          src="/gourmet_canapes.webp"
          alt="Variedad de Canapés Gourmet"
          width={1200}
          height={400}
          sizes="(max-width: 1280px) 100vw, 1200px"
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
        />
      </div>

      <div className="flex flex-wrap justify-center gap-3 mb-12">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-6 py-3 rounded-full transition-all duration-300 shadow-md font-semibold cursor-pointer ${
              activeTab === tab.key
                ? "bg-brand-copper text-white border border-brand-copper"
                : "border border-brand-copper/20 text-dark-elegant hover:text-brand-copper hover:border-brand-copper"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-pulse flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-brand-copper/20 border-t-brand-copper rounded-full animate-spin" />
            <p className="text-slate-500 text-sm">Cargando productos...</p>
          </div>
        </div>
      ) : (
        <>
          <div
            className={`rounded-3xl p-8 mb-12 ${
              isPremiumTab
                ? "bg-gradient-to-br from-dark-elegant to-slate-900 border border-brand-copper/30"
                : "bg-white shadow-2xl border border-brand-copper/10"
            }`}
          >
            <div className="text-center mb-8">
              <p
                className={`font-light italic ${
                  isPremiumTab ? "text-slate-300" : "text-slate-500"
                }`}
              >
                {activeTab === "dulce"
                  ? "Delicias dulces independientes. Mínimo 50 unidades por producto."
                  : "Armá tu catering personalizado. Mínimo 50 unidades por producto."}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentProducts.map((p) => renderProductCard(p, isPremiumTab))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-xl border border-brand-copper/10 max-w-lg mx-auto">
            <h3 className="font-serif text-2xl text-dark-elegant mb-4 text-center border-b border-brand-copper/10 pb-4">
              Tu Cotización
            </h3>
            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-2">
              {selectedProducts.length === 0 ? (
                <p className="text-slate-600 text-sm text-center py-4">
                  Selecciona los productos arriba para agregarlos a tu cuenta
                </p>
              ) : (
                selectedProducts.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 py-2 border-b border-brand-copper/5"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-dark-elegant block truncate">
                        {p.nombre}
                      </span>
                      <span className="text-xs text-slate-600">
                        {p.cantidad} u. x {formatARS(p.precio)}
                      </span>
                    </div>
                    <span className="text-sm text-brand-copper font-medium flex-shrink-0">
                      {formatARS(p.subtotal)}
                    </span>
                  </div>
                ))
              )}
            </div>
            {hasConflict && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4 text-center font-medium">
                No se pueden mezclar productos de Experiencia Clásica con
                Premium
              </div>
            )}
            <div className="border-t-2 border-brand-copper/20 pt-4">
              <div className="flex justify-between items-center mb-6">
                <span className="text-slate-700 font-medium">
                  Total Estimado:
                </span>
                <span className="font-serif text-3xl text-brand-copper font-bold">
                  {formatARS(total)}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCotizarClick}
                disabled={hasConflict || selectedProducts.length === 0}
                className={`block text-center w-full px-6 py-3 bg-brand-copper text-white text-sm font-semibold rounded-full shadow-lg hover:shadow-brand-copper/40 hover:-translate-y-0.5 transition-all duration-300 uppercase tracking-[0.2em] cursor-pointer ${
                  hasConflict || selectedProducts.length === 0
                    ? "opacity-50 pointer-events-none"
                    : ""
                }`}
              >
                Cotizar por WhatsApp
              </button>
              <p className="text-center text-[9px] text-slate-500 mt-3 uppercase tracking-widest">
                Valores referenciales. El precio final se confirmará por
                WhatsApp.
              </p>
            </div>
          </div>
        </>
      )}

      <Proximamente />

      <CotizacionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        cotizacion={cotizacion}
        total={total}
      />
    </section>
  );
}
