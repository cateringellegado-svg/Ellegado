import { z } from "zod";

const productoItemSchema = z.object({
  nombre: z.string().min(1, "Nombre del producto requerido"),
  cantidad: z.number().int().positive("Cantidad debe ser positiva"),
});

const cotizacionProductoItemSchema = z.object({
  nombre: z.string().min(1),
  cantidad: z.number().int().positive(),
});

export const cotizacionSchema = z.object({
  total_unidades: z.number().int().positive("Debe haber al menos una unidad"),
  productos: z
    .array(productoItemSchema)
    .min(1, "Debe seleccionar al menos un producto"),
  total: z.number().nonnegative("El total no puede ser negativo"),
  fecha_entrega: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha de entrega inválida (YYYY-MM-DD)"),
  cliente_nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre es demasiado largo"),
  cliente_email: z
    .string()
    .email("Email inválido")
    .optional()
    .or(z.literal("")),
  cliente_telefono: z
    .string()
    .min(7, "Teléfono inválido")
    .max(20, "Teléfono demasiado largo"),
});

export const menuItemSchema = z.object({
  nombre: z.string().min(1, "Nombre requerido"),
  descripcion: z.string().optional().nullable(),
  categoria: z.enum(["clasica", "premium", "dulce"]),
  precio: z.number().nonnegative().optional().nullable(),
  activo: z.boolean().default(true),
  orden: z.number().int().nonnegative().default(0),
  minimo: z.number().int().positive().default(50),
  incremento: z.number().int().positive().default(10),
  etiquetas: z.string().optional().nullable(),
  imagen_url: z.string().url().optional().nullable().or(z.literal("")),
});

export type CotizacionInput = z.infer<typeof cotizacionSchema>;
export type MenuItemInput = z.infer<typeof menuItemSchema>;
