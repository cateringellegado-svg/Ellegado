"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Image from "next/image";
import type { Producto, CotizacionSeleccion, Combo } from "@/types";
import { fetchProductsByCategory, fetchCombos, fetchConfiguracion } from "@/lib/supabase";
import ConsultantWizard from "./ConsultantWizard";
import ComboSelector from "./ComboSelector";
import { COMBO_MINIMUMS } from "@/lib/constants";
import SalesSummary from "./SalesSummary";
import type { WizardResult } from "./ConsultantWizard";
import { useToast } from "./Toast";
import { useSiteConfig } from "@/lib/site-config";
import { ChefHat, Star, CakeSlice } from "lucide-react";

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

const FALLBACK_COMBOS: Combo[] = [
  { id: "combo_clasico", nombre: "Combo Clásico", descripcion: "Los infaltables de toda celebración. Canapés, mini empanadas y mini hamburguesas.", items_json: [{ id: "canapes", nombre: "Canapés", cantidad: 50, precio: 500 }, { id: "mini_empanadas", nombre: "Mini Empanadas", cantidad: 50, precio: 400 }, { id: "mini_hamburguesas", nombre: "Mini Hamburguesas", cantidad: 50, precio: 760 }], precio: 83000, personas_min: 15, personas_max: 25 },
  { id: "combo_dulce", nombre: "Combo Dulce", descripcion: "La experiencia dulce que todos esperan. Canastitas, shots variados y tacitas rellenas.", items_json: [{ id: "canastitas", nombre: "Canastitas", cantidad: 50, precio: 650 }, { id: "shots", nombre: "Shots variados", cantidad: 50, precio: 850 }, { id: "tacitas", nombre: "Tacitas Rellenas", cantidad: 50, precio: 700 }], precio: 110000, personas_min: 20, personas_max: 30 },
  { id: "combo_ejecutivo", nombre: "Combo Ejecutivo", descripcion: "Perfecto para eventos corporativos. Canapés, mini hamburguesas, sándwich de miga y fosforitos.", items_json: [{ id: "canapes", nombre: "Canapés", cantidad: 50, precio: 500 }, { id: "mini_hamburguesas", nombre: "Mini Hamburguesas", cantidad: 50, precio: 760 }, { id: "sandwich_miga", nombre: "Mini Sándwich de Miga", cantidad: 50, precio: 600 }, { id: "fosforitos", nombre: "Fosforitos", cantidad: 50, precio: 460 }], precio: 116000, personas_min: 20, personas_max: 35 },
  { id: "combo_premium", nombre: "Combo Premium", descripcion: "Selección exclusiva para paladares exigentes. Tapaditos, mini pizzas y mini conitos.", items_json: [{ id: "tapaditos", nombre: "Tapaditos", cantidad: 50, precio: 600 }, { id: "mini_pizzas", nombre: "Mini Pizzas", cantidad: 50, precio: 560 }, { id: "mini_conitos", nombre: "Mini Conitos", cantidad: 50, precio: 1440 }], precio: 130000, personas_min: 20, personas_max: 30 },
  { id: "combo_gran_fiesta", nombre: "Combo Gran Fiesta", descripcion: "El combo más completo para grandes celebraciones. Incluye lo mejor de nuestra experiencia clásica y dulce.", items_json: [{ id: "canapes", nombre: "Canapés", cantidad: 100, precio: 500 }, { id: "mini_empanadas", nombre: "Mini Empanadas", cantidad: 100, precio: 400 }, { id: "mini_hamburguesas", nombre: "Mini Hamburguesas", cantidad: 100, precio: 760 }, { id: "sopaipillas", nombre: "Mini Sopaipillas con Pebre", cantidad: 50, precio: 400 }, { id: "canastitas", nombre: "Canastitas", cantidad: 50, precio: 650 }], precio: 218500, personas_min: 40, personas_max: 60 },
];

type TabKey = "clasica" | "premium" | "dulce";
type ModoType = "combo" | "personalizar";

const TABS: { key: TabKey; label: string }[] = [
  { key: "clasica", label: "Experiencia Clásica" },
  { key: "premium", label: "Experiencia Premium" },
  { key: "dulce", label: "Experiencia Dulce" },
];

const CATEGORY_ICONS: Record<TabKey, React.ElementType> = {
  clasica: ChefHat,
  premium: Star,
  dulce: CakeSlice,
};

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

function calcAnticipo(total: number): number {
  return Math.round(total * 0.5);
}

export default function Festin() {
  const { showToast } = useToast();
  const siteConfig = useSiteConfig();
  const [modo, setModo] = useState<ModoType | null>(null);
  const [selectedCombo, setSelectedCombo] = useState<Combo | null>(null);
  const [combos, setCombos] = useState<Combo[]>([]);
  const [wizardEventType, setWizardEventType] = useState<string | null>(null);
  const [wizardGuestCount, setWizardGuestCount] = useState(0);
  const [fechaEntrega, setFechaEntrega] = useState("");
  const [horarioEntrega, setHorarioEntrega] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("clasica");
  const [clasicos, setClasicos] = useState<Producto[]>([]);
  const [premium, setPremium] = useState<Producto[]>([]);
  const [dulces, setDulces] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [factorAjuste, setFactorAjuste] = useState(1);
  const factorRef = useRef(1);
  const mounted = useRef(true);
  const [cotizacion, setCotizacion] = useState<CotizacionSeleccion>(() => {
    if (typeof window === "undefined") return {};
    try {
      return JSON.parse(localStorage.getItem("legado_cotizacion") || "{}");
    } catch {
      return {};
    }
  });

  useEffect(() => {
    mounted.current = true;
    const safetyTimer = setTimeout(() => {
      if (mounted.current) {
        setLoading(false);
        setLoadError(true);
      }
    }, 15000);
    async function loadData() {
      setLoading(true);
      try {
        const [clasicosData, premiumData, dulcesData, combosData, configData] = await Promise.all([
          fetchProductsByCategory("clasica"),
          fetchProductsByCategory("premium"),
          fetchProductsByCategory("dulce"),
          fetchCombos(),
          fetchConfiguracion(),
        ]);
        if (!mounted.current) return;
        clearTimeout(safetyTimer);
        const factor = configData?.factor_ajuste ?? 1;
        setFactorAjuste(factor);
        factorRef.current = factor;
        setClasicos(clasicosData ?? FALLBACK_CLASICOS);
        setPremium(premiumData ?? []);
        setDulces(dulcesData ?? FALLBACK_DULCES);
        setCombos(combosData ?? FALLBACK_COMBOS);
        setLoadError(false);
      } catch (err) {
        console.error("Error cargando datos Festin:", err);
        if (!mounted.current) return;
        clearTimeout(safetyTimer);
        setClasicos(FALLBACK_CLASICOS);
        setDulces(FALLBACK_DULCES);
        setCombos(FALLBACK_COMBOS);
        setLoadError(true);
      } finally {
        if (mounted.current) setLoading(false);
      }
    }
    loadData();
    return () => {
      mounted.current = false;
      clearTimeout(safetyTimer);
    };
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

  const filteredCombos = useMemo(
    () =>
      wizardGuestCount > 0
        ? combos.filter(
            (c) => wizardGuestCount >= (COMBO_MINIMUMS[c.id] ?? c.personas_min) && wizardGuestCount <= c.personas_max
          )
        : combos,
    [combos, wizardGuestCount]
  );

  const total = useMemo(
    () => (modo === "combo" && selectedCombo
      ? Math.round(selectedCombo.precio * factorAjuste)
      : selectedProducts.reduce((sum, p) => sum + p.subtotal, 0)),
    [selectedProducts, modo, selectedCombo, factorAjuste]
  );

  const anticipo = useMemo(() => calcAnticipo(total), [total]);

  const handleWizardComplete = useCallback(
    (result: WizardResult) => {
      setWizardEventType(result.eventType);
      setWizardGuestCount(result.guestCount);
      setFechaEntrega(result.fechaEntrega);
      setHorarioEntrega(result.horarioEntrega);
      setModo(result.mode);
    },
    []
  );

  const handleWizardSkip = useCallback(() => {
    setModo("personalizar");
  }, []);

  const goBackToWizard = useCallback(() => {
    setModo(null);
    setSelectedCombo(null);
    setCotizacion({});
  }, []);

  const switchToPersonalizar = useCallback(() => {
    setModo("personalizar");
  }, []);

  const switchToCombo = useCallback(() => {
    setModo("combo");
  }, []);

  const seleccionarCombo = useCallback(
    (combo: Combo) => {
      const minCap = COMBO_MINIMUMS[combo.id] ?? combo.personas_min;
      if (wizardGuestCount < minCap) {
        showToast(`Para este combo, el mínimo es de ${minCap} personas`, "warning");
        return;
      }
      const factor = factorAjuste;
      const items: CotizacionSeleccion = {};
      combo.items_json.forEach((item) => {
        const precioAjustado = Math.round(item.precio * factor);
        items[item.id] = {
          id: item.id,
          nombre: item.nombre,
          cantidad: item.cantidad,
          precio: precioAjustado,
          subtotal: item.cantidad * precioAjustado,
          esCombo: true,
        };
      });
      setSelectedCombo(combo);
      setCotizacion(items);
      showToast(`Combo "${combo.nombre}" seleccionado`, "success");
    },
    [showToast, factorAjuste, wizardGuestCount]
  );

  const quitarCombo = useCallback(() => {
    setSelectedCombo(null);
    setCotizacion({});
    showToast("Combo quitado. Podés personalizar tu menú.", "info");
  }, [showToast]);

  const handleQuantityChange = useCallback(
    (producto: Producto, value: string) => {
      let cantidad = parseInt(value) || 0;
      if (cantidad > 0 && producto.precio) {
        if (cantidad < (producto.minimo || 50) || cantidad < 50) cantidad = Math.max(producto.minimo || 50, 50);
        const step = producto.incremento || 10;
        cantidad = Math.round(cantidad / step) * step;
        if (cantidad < 50) cantidad = 50;
        if (cantidad < (producto.minimo || 50)) cantidad = producto.minimo || 50;
        const precio = Math.round(producto.precio * factorRef.current);
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
      const min = Math.max(producto.minimo || 50, 50);
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
        const precio = Math.round(producto.precio * factorRef.current);
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

  const solicitarLote = useCallback(
    (producto: Producto) => {
      const precioBase = producto.precio;
      if (!precioBase) return;
      const precio = Math.round(precioBase * factorRef.current);
      const min = Math.max(producto.minimo || 50, 50);
      setCotizacion((prev) => ({
        ...prev,
        [producto.id]: {
          id: producto.id,
          nombre: producto.nombre,
          cantidad: min,
          precio,
          subtotal: min * precio,
        },
      }));
      showToast(`Lote de ${min} ${producto.nombre} solicitado`, "success");
    },
    [showToast]
  );

  const renderProductCard = (producto: Producto, categoryIcon: React.ElementType) => {
    const noDisponible = producto.disponible === false;
    const qty = cotizacion[producto.id]?.cantidad || 0;
    const IconComponent = categoryIcon;

    return (
      <div
        key={producto.id}
        className={`relative rounded-2xl border transition-all duration-300 flex flex-col h-full group ${
          noDisponible
            ? "opacity-60 grayscale-[50%]"
            : "hover:shadow-xl hover:-translate-y-1"
        } ${
          activeTab === "premium"
            ? "bg-slate-800/50 backdrop-blur-sm border-brand-copper/20 hover:border-brand-copper/40"
            : "bg-white border-brand-copper/20 hover:border-brand-copper/40"
        }`}
      >
        {noDisponible && (
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
                activeTab === "premium" ? "bg-brand-copper/20" : "bg-cream"
              }`}
            >
              <IconComponent className="w-5 h-5 text-brand-copper/60" strokeWidth={1.5} />
            </div>
            <h4
              className={`font-serif text-lg font-medium leading-tight ${
                activeTab === "premium" ? "text-slate-100" : "text-dark-elegant"
              }`}
            >
              {producto.nombre}
            </h4>
          </div>
          <p
            className={`text-xs mb-5 flex-grow font-light leading-relaxed ${
              activeTab === "premium" ? "text-slate-400" : "text-slate-600"
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
                {formatARS(producto.precio ? Math.round(producto.precio * factorRef.current) : 0)}
              </span>
            </div>

            {noDisponible ? (
              <span className="text-[10px] text-amber-600 font-medium uppercase tracking-wider bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
                Próximamente
              </span>
            ) : qty === 0 ? (
              <button
                type="button"
                onClick={() => solicitarLote(producto)}
                className="px-4 py-2 bg-brand-copper text-white text-xs font-semibold rounded-full shadow hover:shadow-brand-copper/30 hover:-translate-y-0.5 transition-all cursor-pointer uppercase tracking-wider"
              >
                Solicitar Lote de 50
              </button>
            ) : (
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
                    min={50}
                    step={10}
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
                  Mín: 50 / +10
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
        <h2 className="font-serif text-5xl md:text-6xl mb-6">{siteConfig.festin.title}</h2>
        <p className="text-lg md:text-xl text-slate-500 font-light italic max-w-2xl mx-auto mb-12">{siteConfig.festin.subtitle}</p>
        <div className="w-24 h-px bg-gradient-to-r from-transparent via-brand-copper to-transparent mx-auto mb-12" />
      </div>

      <div className="mb-16 rounded-3xl overflow-hidden h-[400px] shadow-2xl border border-brand-copper/10">
        <Image
          src={siteConfig.images.festin || "/gourmet_canapes.webp"}
          alt="Variedad de Canapés Gourmet"
          width={1200}
          height={400}
          sizes="(max-width: 1280px) 100vw, 1200px"
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-pulse flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-brand-copper/20 border-t-brand-copper rounded-full animate-spin" />
            <p className="text-slate-500 text-sm">Cargando productos...</p>
          </div>
        </div>
      ) : modo === null ? (
        <ConsultantWizard onComplete={handleWizardComplete} onSkip={handleWizardSkip} />
      ) : (
        <>
          {modo === "combo" && !selectedCombo && (
            <ComboSelector
              combos={combos}
              filteredCombos={filteredCombos}
              wizardGuestCount={wizardGuestCount}
              factorAjuste={factorAjuste}
              onSelect={seleccionarCombo}
              onBack={goBackToWizard}
              onPersonalizar={switchToPersonalizar}
            />
          )}

          {modo === "combo" && selectedCombo && (
            <div className="mb-12">
              <div className="bg-gradient-to-br from-brand-copper/5 to-amber-50 rounded-3xl p-8 border border-brand-copper/20 mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="font-serif text-2xl text-dark-elegant">
                    {selectedCombo.nombre}
                  </h3>
                </div>
                <p className="text-sm text-slate-600 mb-4">{selectedCombo.descripcion}</p>
                <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                  <span className="bg-white/80 px-3 py-1 rounded-full">
                    {selectedCombo.personas_min}–{selectedCombo.personas_max} personas
                  </span>
                  <span className="bg-white/80 px-3 py-1 rounded-full">
                    {selectedCombo.items_json.length} productos incluidos
                  </span>
                </div>
              </div>
              <SalesSummary
                cotizacion={cotizacion}
                total={total}
                anticipo={anticipo}
                modo={modo}
                selectedCombo={selectedCombo}
                hasConflict={hasConflict}
                selectedProducts={selectedProducts}
                fechaEntrega={fechaEntrega}
                horarioEntrega={horarioEntrega}
                onBack={goBackToWizard}
                onQuitarCombo={quitarCombo}
              />
            </div>
          )}

          {modo === "personalizar" && (
            <>
              <div className="flex items-center justify-center gap-4 mb-6">
                <button
                  type="button"
                  onClick={goBackToWizard}
                  className="text-xs text-slate-500 hover:text-brand-copper underline cursor-pointer"
                >
                  ← Volver
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={switchToCombo}
                  className="text-xs text-slate-500 hover:text-brand-copper underline cursor-pointer"
                >
                  Ver combos →
                </button>
              </div>

              <div className="flex flex-wrap justify-center gap-3 mb-12" role="tablist" aria-label="Categorías de menú">
                {TABS.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === tab.key}
                    aria-controls={`tabpanel-${tab.key}`}
                    id={`tab-${tab.key}`}
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

              {loadError && (
                <div className="text-center py-8 mb-12 bg-amber-50 border border-amber-200 rounded-2xl px-6">
                  <p className="text-amber-700 text-sm font-medium">
                    No se pudieron cargar todos los productos desde el servidor. Mostrando productos por defecto.
                  </p>
                </div>
              )}

              <div
                role="tabpanel"
                aria-labelledby={`tab-${activeTab}`}
                id={`tabpanel-${activeTab}`}
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
                  {currentProducts.map((p) => renderProductCard(p, CATEGORY_ICONS[activeTab]))}
                </div>
              </div>

              <SalesSummary
                cotizacion={cotizacion}
                total={total}
                anticipo={anticipo}
                modo={modo}
                selectedCombo={selectedCombo}
                hasConflict={hasConflict}
                selectedProducts={selectedProducts}
                fechaEntrega={fechaEntrega}
                horarioEntrega={horarioEntrega}
                onBack={goBackToWizard}
                onQuitarCombo={quitarCombo}
              />
            </>
          )}
        </>
      )}

      <Proximamente />
    </section>
  );
}
