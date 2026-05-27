"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface InventoryItem {
  id: string;
  nombre: string;
  descripcion: string | null;
  categoria: string;
  precio: number | null;
  activo: boolean;
  disponible: boolean;
  orden: number;
  minimo: number;
  incremento: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  clasica: "Experiencia Clásica",
  premium: "Experiencia Premium",
  dulce: "Experiencia Dulce",
};

function formatARS(v: number | null) {
  if (v == null) return "Por definir";
  return "$" + v.toLocaleString("es-AR");
}

function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-copper/40 cursor-pointer ${
        checked ? "bg-green-500" : "bg-slate-300"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

export default function InventarioPage() {
  const supabase = createClient();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notif, setNotif] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const mountedRef = useRef(true);

  const showNotif = (msg: string, type: "success" | "error") => {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 4000);
  };

  const load = useCallback(async () => {
    if (!supabase) {
      if (mountedRef.current) setLoading(false);
      return;
    }
    try {
      const { data } = await supabase
        .from("menu_items")
        .select("id, nombre, descripcion, categoria, precio, activo, disponible, orden, minimo, incremento")
        .order("orden");
      setItems(data || []);
    } catch (e) {
      console.error("Error loading inventory:", e);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [supabase]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    mountedRef.current = true;
    load();
    return () => {
      mountedRef.current = false;
    };
  }, [load]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const toggleDisponible = async (id: string, current: boolean) => {
    const newVal = !current;
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, disponible: newVal } : i))
    );
    const { error } = await supabase!
      .from("menu_items")
      .update({ disponible: newVal })
      .eq("id", id);
    if (error) {
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, disponible: current } : i))
      );
      showNotif("Error al actualizar disponibilidad", "error");
    } else {
      showNotif(
        `"${items.find((i) => i.id === id)?.nombre}" ${
          newVal ? "disponible" : "no disponible"
        }`,
        "success"
      );
    }
  };

  const grouped = Object.entries(CATEGORY_LABELS).map(([key, label]) => ({
    key,
    label,
    items: items.filter((i) => i.categoria === key),
  }));

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-serif text-4xl text-dark-elegant">Inventario</h1>
          <p className="text-sm text-slate-500 mt-1">
            Control de disponibilidad de productos
          </p>
        </div>
      </div>

      {notif && (
        <div
          className={`mb-6 px-4 py-3 rounded-lg text-sm font-medium ${
            notif.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {notif.msg}
        </div>
      )}

      {loading ? (
        <div className="animate-pulse bg-slate-200 rounded-2xl p-8 h-64" />
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {grouped.map((group) => (
            <div
              key={group.key}
              className="bg-white rounded-2xl p-6 shadow-lg border border-brand-copper/10"
            >
              <h2 className="font-serif text-2xl text-brand-copper mb-4">
                {group.label}
              </h2>
              {group.items.length > 0 ? (
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-cream border-b border-slate-200">
                        <th className="text-left px-4 py-3 font-medium text-slate-600">
                          Producto
                        </th>
                        <th className="text-left px-4 py-3 font-medium text-slate-600">
                          Precio
                        </th>
                        <th className="text-left px-4 py-3 font-medium text-slate-600">
                          Mín / Inc
                        </th>
                        <th className="text-center px-4 py-3 font-medium text-slate-600">
                          Disponible
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {group.items.map((item) => (
                        <tr
                          key={item.id}
                          className={`hover:bg-cream/50 transition-colors ${
                            !item.activo ? "opacity-40" : ""
                          }`}
                        >
                          <td className="px-4 py-3">
                            <div>
                              <span className="font-medium text-dark-elegant">
                                {item.nombre}
                              </span>
                              {item.descripcion && (
                                <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">
                                  {item.descripcion}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 font-serif text-brand-copper">
                            {formatARS(item.precio)}
                          </td>
                          <td className="px-4 py-3 text-slate-500 text-xs">
                            {item.minimo} / +{item.incremento}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <ToggleSwitch
                                checked={item.disponible}
                                onChange={() =>
                                  toggleDisponible(item.id, item.disponible)
                                }
                                label={`Alternar disponibilidad de ${item.nombre}`}
                              />
                              <span
                                className={`text-[10px] font-medium uppercase tracking-wider ${
                                  item.disponible
                                    ? "text-green-600"
                                    : "text-amber-600"
                                }`}
                              >
                                {item.disponible
                                  ? "Disponible"
                                  : "Próximamente"}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-slate-400 text-sm py-4 text-center">
                  No hay productos en esta categoría
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
