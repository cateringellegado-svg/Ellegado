"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { uploadMenuImage, deleteMenuImage, validateImage } from "@/lib/storage";
import ConfirmDialog from "@/components/ConfirmDialog";

interface MenuItem {
  id: string;
  nombre: string;
  descripcion: string | null;
  categoria: string;
  precio: number | null;
  activo: boolean;
  orden: number;
  minimo: number;
  incremento: number;
  etiquetas: string | null;
  imagen_url: string | null;
}

const CATEGORIES = [
  { key: "clasica", label: "Experiencia Clásica" },
  { key: "premium", label: "Experiencia Premium" },
  { key: "dulce", label: "Experiencia Dulce" },
];

function formatARS(v: number | null) {
  if (v == null) return "Por definir";
  return "$" + v.toLocaleString("es-AR");
}

export default function MenusPage() {
  const supabase = createClient();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [editing, setEditing] = useState<Partial<MenuItem> | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notif, setNotif] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const quickFileRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [quickItemId, setQuickItemId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; imagen_url?: string | null } | null>(null);

  const showNotif = (msg: string, type: "success" | "error") => {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 4000);
  };

  const load = async () => {
    if (!supabase) { if (mountedRef.current) setLoading(false); return; }
    try {
      const { data } = await supabase.from("menu_items").select("*").order("orden");
      setItems(data || []);
    } catch (e) {
      console.error("Error loading menus:", e);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    mountedRef.current = true;
    load();
    return () => { mountedRef.current = false; };
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const toggleActive = async (id: string, activo: boolean) => {
    await supabase?.from("menu_items").update({ activo: !activo }).eq("id", id);
    load();
  };

  const deleteItem = async (id: string, imagen_url?: string | null) => {
    setConfirmDelete({ id, imagen_url });
  };

  const confirmDeleteAction = async () => {
    if (!confirmDelete) return;
    if (confirmDelete.imagen_url) await deleteMenuImage(confirmDelete.imagen_url);
    await supabase?.from("menu_items").delete().eq("id", confirmDelete.id);
    setConfirmDelete(null);
    load();
  };

  const handleImageUpload = useCallback(async (file: File) => {
    const error = validateImage(file);
    if (error) { showNotif(error, "error"); return; }

    setUploading(true);
    try {
      const publicUrl = await uploadMenuImage(file);
      if (publicUrl) {
        setEditing((p) => ({ ...p, imagen_url: publicUrl }));
      }
    } catch (err) {
      showNotif("Error al subir imagen: " + (err instanceof Error ? err.message : "desconocido"), "error");
    } finally {
      setUploading(false);
    }
  }, []);

  const handleQuickUpload = useCallback(async (file: File) => {
    if (!quickItemId) return;
    const error = validateImage(file);
    if (error) { showNotif(error, "error"); return; }

    setUploading(true);
    try {
      const publicUrl = await uploadMenuImage(file);
      if (publicUrl) {
        const { error: updateError } = await supabase!
          .from("menu_items")
          .update({ imagen_url: publicUrl })
          .eq("id", quickItemId);
        if (updateError) throw updateError;
        showNotif("Imagen actualizada", "success");
        load();
      }
    } catch (err) {
      showNotif("Error al subir imagen: " + (err instanceof Error ? err.message : "desconocido"), "error");
    } finally {
      setUploading(false);
      setQuickItemId(null);
    }
  }, [quickItemId]);

  const removeImage = async () => {
    const oldUrl = editing?.imagen_url;
    if (oldUrl) await deleteMenuImage(oldUrl);
    setEditing((p) => ({ ...p, imagen_url: null }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
    if (e.target) e.target.value = "";
  };

  const handleQuickFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleQuickUpload(file);
    if (e.target) e.target.value = "";
  };

  const saveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing || !editing.nombre) return;
    const payload = {
      nombre: editing.nombre,
      descripcion: editing.descripcion || null,
      categoria: editing.categoria || "clasica",
      precio: editing.precio || 0,
      activo: editing.activo ?? true,
      orden: editing.orden || 0,
      minimo: editing.minimo || 50,
      incremento: editing.incremento || 10,
      etiquetas: editing.etiquetas || null,
      imagen_url: editing.imagen_url || null,
    };
    if (editing.id) {
      await supabase?.from("menu_items").update(payload).eq("id", editing.id);
    } else {
      await supabase?.from("menu_items").insert([payload]);
    }
    setShowModal(false);
    setEditing(null);
    load();
  };

  const grouped = CATEGORIES.map((cat) => ({
    ...cat,
    items: items.filter((i) => i.categoria === cat.key),
  }));

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-serif text-4xl text-dark-elegant">Gestión de Menús</h1>
        <button
          onClick={() => { setEditing({ activo: true, categoria: "clasica", minimo: 50, incremento: 10, orden: 0 }); setShowModal(true); }}
          className="bg-brand-copper text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-brand-copper/30 transition-all text-sm font-medium cursor-pointer"
        >
          + Agregar Item
        </button>
      </div>

      {notif && (
        <div className={`mb-6 px-4 py-3 rounded-lg text-sm font-medium ${notif.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {notif.msg}
        </div>
      )}

      {loading ? (
        <div className="animate-pulse bg-slate-200 rounded-2xl p-8 h-64" />
      ) : (
      <div className="grid grid-cols-1 gap-8">
        {grouped.map((group) => (
          <div key={group.key} className="bg-white rounded-2xl p-6 shadow-lg border border-brand-copper/10">
            <h2 className="font-serif text-2xl text-brand-copper mb-4">{group.label}</h2>
            {group.items.length > 0 ? (
              <div className="space-y-3">
                {group.items.map((item) => (
                  <div key={item.id} className={`flex items-center justify-between p-4 rounded-lg ${item.activo ? "bg-cream" : "bg-slate-100 opacity-60"}`}>
                    <div className="flex items-center gap-4 flex-1">
                      <div className="relative group/img w-16 h-16 rounded-lg overflow-hidden bg-white border border-brand-copper/10 shrink-0">
                        {item.imagen_url ? (
                          <Image src={item.imagen_url} alt={item.nombre} width={800} height={600} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          </div>
                        )}
                        <button
                          onClick={() => { setQuickItemId(item.id); quickFileRef.current?.click(); }}
                          className="absolute inset-0 bg-black/0 group-hover/img:bg-black/40 flex items-center justify-center transition-all opacity-0 group-hover/img:opacity-100 cursor-pointer"
                          aria-label="Cambiar imagen"
                        >
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </button>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <p className="font-medium text-dark-elegant truncate">{item.nombre}</p>
                          {item.etiquetas && <span className="text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded-full border shrink-0">{item.etiquetas}</span>}
                        </div>
                        <p className="text-xs text-slate-500 truncate">{item.descripcion}</p>
                        <p className="text-xs text-slate-400">Mín: {item.minimo} / +{item.incremento} &middot; Orden: {item.orden}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="font-serif text-brand-copper">{formatARS(item.precio)}</span>
                      <button
                        onClick={() => toggleActive(item.id, item.activo)}
                        className={`text-xs px-3 py-1 rounded-full border cursor-pointer ${item.activo ? "bg-green-50 text-green-700 border-green-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}
                      >
                        {item.activo ? "Activo" : "Inactivo"}
                      </button>
                      <button
                        onClick={() => { setEditing(item); setShowModal(true); }}
                        className="text-brand-copper hover:text-brand-copper-light cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button onClick={() => deleteItem(item.id, item.imagen_url)} className="text-red-400 hover:text-red-600 cursor-pointer">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-sm py-4 text-center">No hay items en esta categoría</p>
            )}
          </div>
        ))}
      </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6" role="dialog" aria-modal="true" aria-label={editing?.id ? "Editar Item" : "Agregar Item"} onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-serif text-2xl text-dark-elegant">{editing?.id ? "Editar Item" : "Agregar Item"}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-dark-elegant cursor-pointer">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={saveItem} className="space-y-4">
              {/* Image upload */}
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Imagen del producto</label>
                <div
                  ref={dropRef}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleImageUpload(f); }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${dragOver ? "border-brand-copper bg-brand-copper/5" : editing?.imagen_url ? "border-green-300 bg-green-50/30" : "border-brand-copper/20 hover:border-brand-copper/40"}`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {uploading ? (
                    <div className="flex flex-col items-center gap-2 py-4">
                      <div className="w-8 h-8 border-3 border-brand-copper/20 border-t-brand-copper rounded-full animate-spin" />
                      <span className="text-xs text-slate-500">Subiendo imagen...</span>
                    </div>
                  ) : editing?.imagen_url ? (
                    <div className="relative">
                      <Image src={editing.imagen_url} alt="Preview" width={800} height={600} className="w-full h-40 object-cover rounded-lg" />
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/30 flex items-center justify-center gap-3 transition-all rounded-lg group">
                        <span className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">Click para cambiar</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-6">
                      <svg className="w-10 h-10 text-brand-copper/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <span className="text-sm text-slate-400">Arrastrá una imagen o hacé click para subir</span>
                      <span className="text-[10px] text-slate-300">PNG, JPG, WebP — Máx 5MB</span>
                    </div>
                  )}
                </div>

                {editing?.imagen_url && (
                  <button type="button" onClick={removeImage} className="mt-2 text-xs text-red-500 hover:text-red-700 cursor-pointer flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    Eliminar imagen
                  </button>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Nombre *</label>
                <input type="text" required value={editing?.nombre || ""} onChange={(e) => setEditing((p) => ({ ...p, nombre: e.target.value }))} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-copper" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Categoría</label>
                  <select value={editing?.categoria || "clasica"} onChange={(e) => setEditing((p) => ({ ...p, categoria: e.target.value }))} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-copper">
                    {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Precio</label>
                  <input type="number" value={editing?.precio || 0} onChange={(e) => setEditing((p) => ({ ...p, precio: parseInt(e.target.value) || 0 }))} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-copper" min="0" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Descripción</label>
                <textarea rows={2} value={editing?.descripcion || ""} onChange={(e) => setEditing((p) => ({ ...p, descripcion: e.target.value }))} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-copper resize-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Etiquetas</label>
                <input type="text" value={editing?.etiquetas || ""} onChange={(e) => setEditing((p) => ({ ...p, etiquetas: e.target.value }))} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-copper" placeholder="vegano, gluten-free" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Orden</label>
                  <input type="number" value={editing?.orden || 0} onChange={(e) => setEditing((p) => ({ ...p, orden: parseInt(e.target.value) || 0 }))} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-3 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Mínimo</label>
                  <input type="number" value={editing?.minimo || 50} onChange={(e) => setEditing((p) => ({ ...p, minimo: parseInt(e.target.value) || 50 }))} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-3 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Incremento</label>
                  <input type="number" value={editing?.incremento || 10} onChange={(e) => setEditing((p) => ({ ...p, incremento: parseInt(e.target.value) || 10 }))} className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-3 text-sm" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="menu-activo" checked={editing?.activo ?? true} onChange={(e) => setEditing((p) => ({ ...p, activo: e.target.checked }))} className="w-4 h-4 text-brand-copper rounded" />
                  <label htmlFor="menu-activo" className="text-sm text-slate-600">Item activo</label>
                </div>
              </div>
              <button type="submit" className="w-full bg-brand-copper text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-brand-copper/30 transition-all text-sm cursor-pointer">
                {editing?.id ? "Guardar Cambios" : "Crear Item"}
              </button>
            </form>
          </div>
        </div>
      )}

      <input
        ref={quickFileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        onChange={handleQuickFileSelect}
        className="hidden"
      />

      <ConfirmDialog
        open={confirmDelete !== null}
        title="Eliminar Item"
        message="¿Estás seguro de eliminar este item del menú? Esta acción no se puede deshacer."
        onConfirm={confirmDeleteAction}
        onCancel={() => setConfirmDelete(null)}
      />
    </>
  );
}
