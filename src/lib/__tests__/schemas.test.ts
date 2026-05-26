import { describe, it, expect } from "vitest";
import { cotizacionSchema, menuItemSchema } from "@/lib/schemas";

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

describe("menuItemSchema", () => {
  const validItem = {
    nombre: "Canapés de Salmón",
    categoria: "premium" as const,
    precio: 1200,
    activo: true,
    orden: 1,
    minimo: 50,
    incremento: 10,
  };

  it("validates a correct menu item", () => {
    const result = menuItemSchema.safeParse(validItem);
    expect(result.success).toBe(true);
  });

  it("rejects empty nombre", () => {
    const result = menuItemSchema.safeParse({ ...validItem, nombre: "" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid categoria", () => {
    const result = menuItemSchema.safeParse({ ...validItem, categoria: "invalida" });
    expect(result.success).toBe(false);
  });

  it("rejects negative precio", () => {
    const result = menuItemSchema.safeParse({ ...validItem, precio: -100 });
    expect(result.success).toBe(false);
  });

  it("rejects minimo menor a 1", () => {
    const result = menuItemSchema.safeParse({ ...validItem, minimo: 0 });
    expect(result.success).toBe(false);
  });

  it("accepts optional fields as null", () => {
    const result = menuItemSchema.safeParse({
      ...validItem,
      descripcion: null,
      imagen_url: null,
    });
    expect(result.success).toBe(true);
  });

  it("applies default values for activo, orden, minimo, incremento", () => {
    const result = menuItemSchema.safeParse({
      nombre: "Test",
      categoria: "dulce",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.activo).toBe(true);
      expect(result.data.orden).toBe(0);
      expect(result.data.minimo).toBe(50);
      expect(result.data.incremento).toBe(10);
    }
  });
});
