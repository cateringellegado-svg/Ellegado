import { describe, it, expect } from "vitest";
import { cotizacionSchema } from "@/lib/schemas";

describe("cotizacionSchema", () => {
  const validData = {
    total_unidades: 10,
    productos: [{ nombre: "Canapés", cantidad: 2 }],
    total: 50000,
    cliente_nombre: "Juan Pérez",
    cliente_email: "juan@example.com",
    cliente_telefono: "54123456789",
  };

  it("validates a correct cotizacion", () => {
    const result = cotizacionSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = cotizacionSchema.safeParse({
      ...validData,
      cliente_email: "invalido",
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative total", () => {
    const result = cotizacionSchema.safeParse({
      ...validData,
      total: -1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty productos", () => {
    const result = cotizacionSchema.safeParse({
      ...validData,
      productos: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty name", () => {
    const result = cotizacionSchema.safeParse({
      ...validData,
      cliente_nombre: "",
    });
    expect(result.success).toBe(false);
  });
});
