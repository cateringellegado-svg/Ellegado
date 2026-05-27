-- ====================================================================
-- Migration: Admin Dashboard Full — Config + Combos CMS + Logs + Webhook
-- ====================================================================

-- 0. Asegurar que la tabla configuracion existe (defensivo: migración previa
--    20260528010000_blindaje_integral.sql debería haberla creado)
CREATE TABLE IF NOT EXISTS configuracion (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  factor_ajuste NUMERIC DEFAULT 1.0 NOT NULL CHECK (factor_ajuste > 0),
  updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO configuracion (factor_ajuste) VALUES (1.0)
ON CONFLICT DO NOTHING;

ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read configuracion" ON configuracion;
CREATE POLICY "Public can read configuracion"
  ON configuracion FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated can manage configuracion" ON configuracion;
CREATE POLICY "Authenticated can manage configuracion"
  ON configuracion FOR ALL
  USING (auth.role() = 'authenticated');

-- 1. Extender configuracion con nuevos campos
ALTER TABLE configuracion
  ADD COLUMN IF NOT EXISTS mp_access_token TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS capacidad_diaria_total INTEGER DEFAULT 0;

COMMENT ON COLUMN configuracion.mp_access_token IS 'Mercado Pago access token (admin-configurable)';
COMMENT ON COLUMN configuracion.capacidad_diaria_total IS 'Límite global de unidades por día (0 = sin límite)';

ALTER TABLE configuracion
  ADD COLUMN IF NOT EXISTS entorno TEXT DEFAULT 'produccion' CHECK (entorno IN ('produccion', 'prueba')),
  ADD COLUMN IF NOT EXISTS mp_access_token_test TEXT DEFAULT '';

COMMENT ON COLUMN configuracion.entorno IS 'produccion | prueba — controla si se usa token prod o test';
COMMENT ON COLUMN configuracion.mp_access_token_test IS 'Mercado Pago access token para sandbox/test';

-- 2. Admin logs para trazabilidad
CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  accion TEXT NOT NULL,
  detalle TEXT DEFAULT '',
  usuario_email TEXT DEFAULT '',
  referencia_id TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_logs_accion ON admin_logs(accion);

ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can read admin_logs" ON admin_logs;
CREATE POLICY "Authenticated can read admin_logs"
  ON admin_logs FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated can insert admin_logs" ON admin_logs;
CREATE POLICY "Authenticated can insert admin_logs"
  ON admin_logs FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- 3. Agregar columna pago_metodo a cotizaciones
ALTER TABLE cotizaciones
  ADD COLUMN IF NOT EXISTS pago_metodo TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS pago_status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS reserva_manual BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS fecha_entrega DATE;

COMMENT ON COLUMN cotizaciones.pago_metodo IS 'mp | manual';
COMMENT ON COLUMN cotizaciones.pago_status IS 'pending | paid | reserved';
COMMENT ON COLUMN cotizaciones.reserva_manual IS 'true si fue marcada manualmente como reservada';

-- 4. RPC para logging admin
CREATE OR REPLACE FUNCTION log_admin_action(
  p_accion TEXT,
  p_detalle TEXT DEFAULT '',
  p_usuario_email TEXT DEFAULT '',
  p_referencia_id TEXT DEFAULT ''
) RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO admin_logs (accion, detalle, usuario_email, referencia_id)
  VALUES (p_accion, p_detalle, p_usuario_email, p_referencia_id)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. RPC para obtener configuracion completa
DROP FUNCTION IF EXISTS get_configuracion_completa();
CREATE OR REPLACE FUNCTION get_configuracion_completa()
RETURNS TABLE(
  factor_ajuste NUMERIC,
  mp_access_token TEXT,
  capacidad_diaria_total INTEGER,
  entorno TEXT,
  mp_access_token_test TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT c.factor_ajuste, COALESCE(c.mp_access_token, ''), COALESCE(c.capacidad_diaria_total, 0),
         COALESCE(c.entorno, 'produccion'), COALESCE(c.mp_access_token_test, '')
  FROM configuracion c LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- 6. RPC para actualizar configuracion
DROP FUNCTION IF EXISTS update_configuracion();
CREATE OR REPLACE FUNCTION update_configuracion(
  p_factor_ajuste NUMERIC DEFAULT NULL,
  p_mp_access_token TEXT DEFAULT NULL,
  p_capacidad_diaria_total INTEGER DEFAULT NULL,
  p_entorno TEXT DEFAULT NULL,
  p_mp_access_token_test TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE configuracion SET
    factor_ajuste = COALESCE(p_factor_ajuste, factor_ajuste),
    mp_access_token = COALESCE(p_mp_access_token, mp_access_token),
    capacidad_diaria_total = COALESCE(p_capacidad_diaria_total, capacidad_diaria_total),
    entorno = COALESCE(p_entorno, entorno),
    mp_access_token_test = COALESCE(p_mp_access_token_test, mp_access_token_test),
    updated_at = now()
  WHERE id = (SELECT id FROM configuracion LIMIT 1);
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
