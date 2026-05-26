export type Moneda = "ARS" | "USD";
export type TipoPago = "seña" | "parcial" | "completo" | "saldo";
export type TipoFactura = "C" | "E";
export type EstadoFactura = "emitida" | "pagada" | "vencida" | "anulada";

export interface PagoInput {
  monto: number;
  moneda: Moneda;
  tipo_pago: TipoPago;
}

export interface FacturaInput {
  tipo_factura: TipoFactura;
  total: number;
  moneda: Moneda;
  cliente_id: string;
  numero_factura: string;
  fecha_emision?: string;
  fecha_vencimiento?: string;
}

export function calcularSaldoPendiente(
  presupuestoTotal: number,
  pagosRealizados: PagoInput[],
  moneda: Moneda
): number {
  const totalPagado = pagosRealizados
    .filter((p) => p.moneda === moneda)
    .reduce((sum, p) => sum + p.monto, 0);
  return Math.max(0, presupuestoTotal - totalPagado);
}

export function calcularTotalesPorMoneda(
  items: { monto: number; moneda: Moneda }[]
): { ARS: number; USD: number } {
  return items.reduce(
    (acc, item) => {
      acc[item.moneda] += item.monto;
      return acc;
    },
    { ARS: 0, USD: 0 }
  );
}

export function validarFacturaTipoC(
  input: FacturaInput & { iva_desglosado?: number }
): { valid: true } | { valid: false; error: string } {
  if (input.tipo_factura === "C" && input.iva_desglosado != null && input.iva_desglosado > 0) {
    return { valid: false, error: "Las facturas Tipo C (Monotributo) no deben desglosar IVA" };
  }

  if (input.tipo_factura === "C" && input.total <= 0) {
    return { valid: false, error: "El total debe ser mayor a cero" };
  }

  return { valid: true };
}

export function canAccessFinancialModule(userRole: string | null): boolean {
  return userRole === "admin";
}
