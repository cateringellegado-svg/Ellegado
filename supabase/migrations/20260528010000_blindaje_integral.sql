-- ====================================================================
-- Migration: Blindaje Integral — Config + Capacity + Legal
-- ====================================================================

-- 1. Configuración financiera
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

-- 2. Capacidad diaria en combos
ALTER TABLE combos
  ADD COLUMN IF NOT EXISTS capacidad_diaria INTEGER DEFAULT 0;

COMMENT ON COLUMN combos.capacidad_diaria IS '0 = sin límite';

-- 3. Tabla de reservas por fecha para tracking de capacidad
CREATE TABLE IF NOT EXISTS reservas_por_fecha (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  combo_id TEXT REFERENCES combos(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  cantidad_reservada INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (combo_id, fecha)
);

ALTER TABLE reservas_por_fecha ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read reservas_por_fecha" ON reservas_por_fecha;
CREATE POLICY "Public can read reservas_por_fecha"
  ON reservas_por_fecha FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated can manage reservas_por_fecha" ON reservas_por_fecha;
CREATE POLICY "Authenticated can manage reservas_por_fecha"
  ON reservas_por_fecha FOR ALL
  USING (auth.role() = 'authenticated');

-- 4. Actualizar RPC para capacidad diaria
CREATE OR REPLACE FUNCTION check_combo_capacidad(p_combo_id TEXT, p_fecha DATE)
RETURNS TABLE(disponible BOOLEAN, cupo_total INTEGER, cupo_usado INTEGER) AS $$
DECLARE
  v_capacidad INTEGER;
  v_usado INTEGER;
BEGIN
  SELECT COALESCE(capacidad_diaria, 0) INTO v_capacidad
  FROM combos WHERE id = p_combo_id;

  SELECT COALESCE(SUM(cantidad_reservada), 0) INTO v_usado
  FROM reservas_por_fecha
  WHERE combo_id = p_combo_id AND fecha = p_fecha;

  RETURN QUERY
  SELECT
    (v_capacidad = 0 OR v_usado < v_capacidad) AS disponible,
    v_capacidad AS cupo_total,
    v_usado AS cupo_usado;
END;
$$ LANGUAGE plpgsql;

-- 5. RPC para obtener configuración
CREATE OR REPLACE FUNCTION get_configuracion()
RETURNS TABLE(factor_ajuste NUMERIC) AS $$
BEGIN
  RETURN QUERY SELECT c.factor_ajuste FROM configuracion c LIMIT 1;
END;
$$ LANGUAGE plpgsql;
