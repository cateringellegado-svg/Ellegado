import { describe, it, expect } from "vitest";
import {
  calcularSaldoPendiente,
  calcularTotalesPorMoneda,
  validarFacturaTipoC,
  canAccessFinancialModule,
} from "@/lib/financiero";

describe("Seguridad de Bóveda (RLS)", () => {
  it("rejects null/unauthenticated user", () => {
    expect(canAccessFinancialModule(null)).toBe(false);
    expect(canAccessFinancialModule(undefined as unknown as string)).toBe(false);
  });

  it("rejects authenticated but non-admin user", () => {
    expect(canAccessFinancialModule("authenticated")).toBe(false);
    expect(canAccessFinancialModule("user")).toBe(false);
    expect(canAccessFinancialModule("editor")).toBe(false);
  });

  it("allows only admin user", () => {
    expect(canAccessFinancialModule("admin")).toBe(true);
  });
});

describe("Cálculos Matemáticos — Pago Parcial", () => {
  it("saldo pendiente igual al presupuesto cuando no hay pagos", () => {
    const saldo = calcularSaldoPendiente(100000, [], "ARS");
    expect(saldo).toBe(100000);
  });

  it("resta una seña del presupuesto total", () => {
    const saldo = calcularSaldoPendiente(100000, [
      { monto: 25000, moneda: "ARS", tipo_pago: "seña" },
    ], "ARS");
    expect(saldo).toBe(75000);
  });

  it("acumula pagos parciales correctamente", () => {
    const saldo = calcularSaldoPendiente(100000, [
      { monto: 20000, moneda: "ARS", tipo_pago: "seña" },
      { monto: 30000, moneda: "ARS", tipo_pago: "parcial" },
      { monto: 10000, moneda: "ARS", tipo_pago: "parcial" },
    ], "ARS");
    expect(saldo).toBe(40000);
  });

  it("saldo cero cuando se paga el total exacto", () => {
    const saldo = calcularSaldoPendiente(50000, [
      { monto: 50000, moneda: "ARS", tipo_pago: "completo" },
    ], "ARS");
    expect(saldo).toBe(0);
  });

  it("saldo nunca es negativo aunque se pague de más", () => {
    const saldo = calcularSaldoPendiente(50000, [
      { monto: 60000, moneda: "ARS", tipo_pago: "completo" },
    ], "ARS");
    expect(saldo).toBe(0);
  });

  it("no mezcla pagos en ARS con el cálculo en USD", () => {
    const saldo = calcularSaldoPendiente(1000, [
      { monto: 50000, moneda: "ARS", tipo_pago: "parcial" },
    ], "USD");
    expect(saldo).toBe(1000);
  });
});

describe("Legalidad Fiscal — Factura Tipo C sin IVA", () => {
  const baseFacturaC = {
    tipo_factura: "C" as const,
    total: 50000,
    moneda: "ARS" as const,
    cliente_id: "abc-123",
    numero_factura: "C-0001-2026",
  };

  it("acepta factura Tipo C sin campo iva_desglosado", () => {
    const result = validarFacturaTipoC(baseFacturaC);
    expect(result.valid).toBe(true);
  });

  it("acepta factura Tipo C con iva_desglosado = 0", () => {
    const result = validarFacturaTipoC({ ...baseFacturaC, iva_desglosado: 0 });
    expect(result.valid).toBe(true);
  });

  it("rechaza factura Tipo C con iva_desglosado > 0", () => {
    const result = validarFacturaTipoC({ ...baseFacturaC, iva_desglosado: 10500 });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("no deben desglosar IVA");
  });

  it("rechaza factura Tipo C con total cero o negativo", () => {
    const r1 = validarFacturaTipoC({ ...baseFacturaC, total: 0 });
    expect(r1.valid).toBe(false);
    const r2 = validarFacturaTipoC({ ...baseFacturaC, total: -100 });
    expect(r2.valid).toBe(false);
  });
});

describe("Integridad Multimoneda — ARS vs USD", () => {
  it("separa montos en ARS y USD sin mezclarlos", () => {
    const items = [
      { monto: 100000, moneda: "ARS" as const },
      { monto: 500, moneda: "USD" as const },
      { monto: 50000, moneda: "ARS" as const },
      { monto: 200, moneda: "USD" as const },
    ];
    const totales = calcularTotalesPorMoneda(items);
    expect(totales.ARS).toBe(150000);
    expect(totales.USD).toBe(700);
  });

  it("devuelve cero para moneda sin registros", () => {
    const items = [
      { monto: 100000, moneda: "ARS" as const },
    ];
    const totales = calcularTotalesPorMoneda(items);
    expect(totales.ARS).toBe(100000);
    expect(totales.USD).toBe(0);
  });

  it("suma correctamente con array vacío", () => {
    const totales = calcularTotalesPorMoneda([]);
    expect(totales.ARS).toBe(0);
    expect(totales.USD).toBe(0);
  });

  it("no redondea incorrectamente montos con decimales", () => {
    const items = [
      { monto: 99.99, moneda: "USD" as const },
      { monto: 0.01, moneda: "USD" as const },
    ];
    const totales = calcularTotalesPorMoneda(items);
    expect(totales.USD).toBe(100);
  });
});
