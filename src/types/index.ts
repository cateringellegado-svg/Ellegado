export interface Producto {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: number | null;
  unidad: string;
  minimo: number;
  incremento: number;
  pendiente?: boolean;
  disponible?: boolean;
  imagen_url?: string;
}

export interface ComboItem {
  id: string;
  nombre: string;
  cantidad: number;
  precio: number;
}

export interface Combo {
  id: string;
  nombre: string;
  descripcion: string;
  items_json: ComboItem[];
  precio: number;
  personas_min: number;
  personas_max: number;
  activo?: boolean;
  orden?: number;
  capacidad_diaria?: number;
}

export interface Configuracion {
  id?: string;
  factor_ajuste: number;
  capacidad_diaria_total?: number;
  updated_at?: string;
}

export interface AdminLog {
  id: string;
  accion: string;
  detalle: string;
  usuario_email: string;
  referencia_id: string;
  created_at: string;
}

export interface CotizacionItem {
  id: string;
  nombre: string;
  cantidad: number;
  precio: number;
  subtotal: number;
  esCombo?: boolean;
}

export type CotizacionSeleccion = Record<string, CotizacionItem>;

export interface Lead {
  id: string;
  tipo_evento: string;
  num_invitados: number | null;
  created_at: string;
}


