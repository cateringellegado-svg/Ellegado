export interface Producto {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: number | null;
  unidad: string;
  minimo: number;
  incremento: number;
  pendiente?: boolean;
  imagen_url?: string;
}

export interface ProductoConCategoria extends Producto {
  categoria: "clasica" | "premium" | "dulce";
}

export interface CotizacionItem {
  id: string;
  nombre: string;
  cantidad: number;
  precio: number;
  subtotal: number;
}

export type CotizacionSeleccion = Record<string, CotizacionItem>;

export interface SiteConfigRecord {
  key: string;
  value: string;
}

export interface WhatsAppConfig {
  phone: string;
  messageTemplate: (productos: string, total: string, mensajePersonal: string) => string;
}
