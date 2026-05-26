export interface Pago {
  id: string;
  cliente_id: string;
  cotizacion_id: string | null;
  evento_id: string | null;
  monto: number;
  moneda: "ARS" | "USD";
  tipo_pago: "seña" | "parcial" | "completo" | "saldo";
  metodo_pago: "transferencia_mp" | "efectivo";
  fecha_pago: string;
  comprobante_url: string;
  notas: string;
  created_at: string;
  updated_at: string;
}

export interface Factura {
  id: string;
  cliente_id: string;
  evento_id: string | null;
  numero_factura: string;
  tipo_factura: "C" | "E";
  fecha_emision: string;
  fecha_vencimiento: string;
  moneda: "ARS" | "USD";
  total: number;
  estado: "emitida" | "pagada" | "vencida" | "anulada";
  pdf_url: string;
  notas: string;
  created_at: string;
  updated_at: string;
}

export interface Gasto {
  id: string;
  evento_id: string;
  categoria: "insumos" | "personal" | "transporte" | "decoracion" | "alquiler" | "otro";
  descripcion: string;
  monto: number;
  moneda: "ARS" | "USD";
  proveedor: string;
  fecha_gasto: string;
  comprobante_url: string;
  created_at: string;
}

export interface PresupuestoDetalle {
  id: string;
  evento_id: string;
  concepto: string;
  tipo: "ingreso" | "egreso";
  cantidad: number;
  monto_estimado: number;
  monto_real: number | null;
  moneda: "ARS" | "USD";
  notas: string;
  created_at: string;
  updated_at: string;
}

export type MetodoPago = "transferencia_mp" | "efectivo";
export type TipoPago = "seña" | "parcial" | "completo" | "saldo";
export type Moneda = "ARS" | "USD";
