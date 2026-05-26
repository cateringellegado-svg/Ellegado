-- ====================================================================
-- CRM FINANCIERO - El Legado Catering
-- Control de pagos administrativos, facturación simplificada,
-- gastos y presupuestos de eventos
--
-- Ejecutar en SQL Editor de Supabase (orden seguro, todo es idempotente)
-- ====================================================================
-- ====================================================================
-- 1. EXTENDER tabla clientes (datos fiscales y financieros)
-- ====================================================================
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS direccion TEXT DEFAULT '';
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS tipo_documento TEXT DEFAULT 'DNI'
  CHECK (tipo_documento IN ('DNI', 'CUIL', 'CUIT', 'Pasaporte'));
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS numero_documento TEXT DEFAULT '';
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS condicion_iva TEXT DEFAULT 'Consumidor Final'
  CHECK (condicion_iva IN ('Responsable Inscripto', 'Monotributista', 'Consumidor Final', 'Exterior'));
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS moneda_preferida TEXT DEFAULT 'ARS'
  CHECK (moneda_preferida IN ('ARS', 'USD'));
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS notas TEXT DEFAULT '';
-- ====================================================================
-- 2. EXTENDER tabla eventos (datos financieros y FK a clientes)
-- ====================================================================
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL;
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS presupuesto_estimado NUMERIC(12,2) DEFAULT 0
  CHECK (presupuesto_estimado >= 0);
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS presupuesto_final NUMERIC(12,2) DEFAULT 0
  CHECK (presupuesto_final >= 0);
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS moneda TEXT DEFAULT 'ARS'
  CHECK (moneda IN ('ARS', 'USD'));
-- ====================================================================
-- 3. CREAR tabla pagos (registro administrativo de ingresos)
--    No procesa pagos en línea. Solo registro interno de cobros.
-- ====================================================================
CREATE TABLE IF NOT EXISTS pagos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
  cotizacion_id UUID REFERENCES cotizaciones(id) ON DELETE SET NULL,
  evento_id UUID REFERENCES eventos(id) ON DELETE SET NULL,
  monto NUMERIC(12,2) NOT NULL CHECK (monto > 0),
  moneda TEXT NOT NULL DEFAULT 'ARS' CHECK (moneda IN ('ARS', 'USD')),
  tipo_pago TEXT NOT NULL DEFAULT 'completo'
    CHECK (tipo_pago IN ('seña', 'parcial', 'completo', 'saldo')),
  metodo_pago TEXT NOT NULL DEFAULT 'transferencia_mp'
    CHECK (metodo_pago IN ('transferencia_mp', 'efectivo')),
  fecha_pago DATE NOT NULL DEFAULT CURRENT_DATE,
  comprobante_url TEXT DEFAULT '',
  notas TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- ====================================================================
-- 4. CREAR tabla facturas (optimizada para régimen simplificado)
--    Tipo C = Monotributo (local), Tipo E = Exportación (internacional).
--    Sin IVA desglosado: el total incluye impuestos.
-- ====================================================================
CREATE TABLE IF NOT EXISTS facturas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
  evento_id UUID REFERENCES eventos(id) ON DELETE SET NULL,
  numero_factura TEXT NOT NULL UNIQUE,
  tipo_factura TEXT NOT NULL DEFAULT 'C'
    CHECK (tipo_factura IN ('C', 'E')),
  fecha_emision DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_vencimiento DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '30 days'),
  moneda TEXT NOT NULL DEFAULT 'ARS' CHECK (moneda IN ('ARS', 'USD')),
  total NUMERIC(12,2) NOT NULL CHECK (total > 0),
  estado TEXT NOT NULL DEFAULT 'emitida'
    CHECK (estado IN ('emitida', 'pagada', 'vencida', 'anulada')),
  pdf_url TEXT DEFAULT '',
  notas TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- ====================================================================
-- 5. CREAR tabla gastos (egresos asociados a eventos)
-- ====================================================================
CREATE TABLE IF NOT EXISTS gastos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  categoria TEXT NOT NULL DEFAULT 'insumos'
    CHECK (categoria IN ('insumos', 'personal', 'transporte', 'decoracion', 'alquiler', 'otro')),
  descripcion TEXT NOT NULL DEFAULT '',
  monto NUMERIC(12,2) NOT NULL CHECK (monto > 0),
  moneda TEXT NOT NULL DEFAULT 'ARS' CHECK (moneda IN ('ARS', 'USD')),
  proveedor TEXT DEFAULT '',
  fecha_gasto DATE NOT NULL DEFAULT CURRENT_DATE,
  comprobante_url TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- ====================================================================
-- 6. CREAR tabla presupuestos_detalle (desglose presupuesto vs real)
--    Cada fila representa una línea de ingreso o egreso del evento.
--    monto_real = NULL significa "pendiente de ejecución".
-- ====================================================================
CREATE TABLE IF NOT EXISTS presupuestos_detalle (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  concepto TEXT NOT NULL DEFAULT '',
  tipo TEXT NOT NULL DEFAULT 'ingreso'
    CHECK (tipo IN ('ingreso', 'egreso')),
  cantidad INTEGER NOT NULL DEFAULT 1 CHECK (cantidad > 0),
  monto_estimado NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (monto_estimado >= 0),
  monto_real NUMERIC(12,2) DEFAULT NULL CHECK (monto_real IS NULL OR monto_real >= 0),
  moneda TEXT NOT NULL DEFAULT 'ARS' CHECK (moneda IN ('ARS', 'USD')),
  notas TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- ====================================================================
-- 7. TRIGGERS updated_at
-- ====================================================================
CREATE OR REPLACE FUNCTION update_crm_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS update_pagos_updated_at ON pagos;
CREATE TRIGGER update_pagos_updated_at
  BEFORE UPDATE ON pagos
  FOR EACH ROW EXECUTE FUNCTION update_crm_updated_at();
DROP TRIGGER IF EXISTS update_facturas_updated_at ON facturas;
CREATE TRIGGER update_facturas_updated_at
  BEFORE UPDATE ON facturas
  FOR EACH ROW EXECUTE FUNCTION update_crm_updated_at();
DROP TRIGGER IF EXISTS update_presupuestos_detalle_updated_at ON presupuestos_detalle;
CREATE TRIGGER update_presupuestos_detalle_updated_at
  BEFORE UPDATE ON presupuestos_detalle
  FOR EACH ROW EXECUTE FUNCTION update_crm_updated_at();
-- ====================================================================
-- 8. ROW LEVEL SECURITY (Solo admin)
-- ====================================================================

-- Helper: verifica que el usuario autenticado tenga claim app_role = 'admin'
-- Requiere configurar custom claim en auth.users (ej: via trigger o edge function)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::jsonb ->> 'app_role',
    ''
  ) = 'admin';
$$;

ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE facturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE presupuestos_detalle ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin can manage pagos" ON pagos;
CREATE POLICY "Admin can manage pagos"
  ON pagos FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admin can manage facturas" ON facturas;
CREATE POLICY "Admin can manage facturas"
  ON facturas FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admin can manage gastos" ON gastos;
CREATE POLICY "Admin can manage gastos"
  ON gastos FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admin can manage presupuestos_detalle" ON presupuestos_detalle;
CREATE POLICY "Admin can manage presupuestos_detalle"
  ON presupuestos_detalle FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ====================================================================
-- 8b. RLS para cotizaciones (estaba expuesta)
-- ====================================================================
ALTER TABLE cotizaciones ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin can manage cotizaciones" ON cotizaciones;
CREATE POLICY "Admin can manage cotizaciones"
  ON cotizaciones FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());
-- ====================================================================
-- 9. ÍNDICES PARA RENDIMIENTO
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_pagos_cliente_id ON pagos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_pagos_evento_id ON pagos(evento_id);
CREATE INDEX IF NOT EXISTS idx_facturas_cliente_id ON facturas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_facturas_numero ON facturas(numero_factura);
CREATE INDEX IF NOT EXISTS idx_gastos_evento_id ON gastos(evento_id);
CREATE INDEX IF NOT EXISTS idx_presupuestos_detalle_evento_id ON presupuestos_detalle(evento_id);
CREATE INDEX IF NOT EXISTS idx_eventos_cliente_id ON eventos(cliente_id);
-- ====================================================================
-- 10. VERIFICACIÓN
-- ====================================================================
SELECT 'CRM FINANCIERO - Migración completada' AS resultado;