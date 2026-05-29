-- ============================================================
-- 00_create_base_tables.sql
-- Correr ANTES que cualquier migración existente.
-- Crea las 4 tablas base que las migraciones esperan existir.
-- ============================================================

-- 1. menu_items
CREATE TABLE IF NOT EXISTS menu_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio NUMERIC NOT NULL DEFAULT 0,
  categoria TEXT NOT NULL DEFAULT 'clasica',
  activo BOOLEAN NOT NULL DEFAULT true,
  orden INTEGER NOT NULL DEFAULT 0,
  disponible BOOLEAN NOT NULL DEFAULT true,
  imagen_url TEXT,
  unidad TEXT NOT NULL DEFAULT 'unidad',
  minimo INTEGER NOT NULL DEFAULT 50,
  incremento INTEGER NOT NULL DEFAULT 10,
  etiquetas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. clientes
CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  email TEXT,
  telefono TEXT,
  direccion TEXT DEFAULT '',
  tipo_documento TEXT DEFAULT 'DNI'
    CHECK (tipo_documento IN ('DNI', 'CUIL', 'CUIT', 'Pasaporte')),
  numero_documento TEXT DEFAULT '',
  condicion_iva TEXT DEFAULT 'Consumidor Final'
    CHECK (condicion_iva IN ('Responsable Inscripto', 'Monotributista', 'Consumidor Final', 'Exterior')),
  moneda_preferida TEXT DEFAULT 'ARS'
    CHECK (moneda_preferida IN ('ARS', 'USD')),
  notas TEXT DEFAULT '',
  ultimo_contacto TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. eventos
CREATE TABLE IF NOT EXISTS eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  fecha DATE NOT NULL,
  tipo TEXT,
  cliente TEXT,
  estado TEXT NOT NULL DEFAULT 'pendiente',
  invitados INTEGER DEFAULT 0,
  menu TEXT,
  notas TEXT,
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  presupuesto_estimado NUMERIC(12,2) DEFAULT 0
    CHECK (presupuesto_estimado >= 0),
  presupuesto_final NUMERIC(12,2) DEFAULT 0
    CHECK (presupuesto_final >= 0),
  moneda TEXT DEFAULT 'ARS'
    CHECK (moneda IN ('ARS', 'USD')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. cotizaciones
CREATE TABLE IF NOT EXISTS cotizaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_nombre TEXT,
  cliente_email TEXT,
  cliente_telefono TEXT,
  tipo_evento TEXT,
  num_invitados INTEGER DEFAULT 0,
  modo TEXT DEFAULT 'personalizar',
  combo_id TEXT,
  servicios JSONB DEFAULT '[]'::jsonb,
  presupuesto INTEGER DEFAULT 0,
  anticipo INTEGER DEFAULT 0,
  fecha_entrega DATE,
  horario_entrega TEXT,
  estado TEXT NOT NULL DEFAULT 'nueva',
  pago_metodo TEXT DEFAULT '',
  pago_status TEXT DEFAULT 'pending',
  reserva_manual BOOLEAN DEFAULT false,
  mp_preference_id TEXT,
  mp_payment_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

SELECT '✅ 00_create_base_tables completado' AS resultado;
