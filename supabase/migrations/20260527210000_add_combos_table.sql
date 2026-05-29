-- Migration: Create combos table
-- Stores pre-defined combo packages with fixed pricing

CREATE TABLE IF NOT EXISTS combos (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT NOT NULL DEFAULT '',
  items_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  precio INTEGER NOT NULL DEFAULT 0,
  personas_min INTEGER NOT NULL DEFAULT 1,
  personas_max INTEGER NOT NULL DEFAULT 100,
  activo BOOLEAN NOT NULL DEFAULT true,
  orden INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE combos ENABLE ROW LEVEL SECURITY;

-- Public can view active combos
DROP POLICY IF EXISTS "Public can view combos" ON combos;
CREATE POLICY "Public can view combos"
    ON combos FOR SELECT
    USING (true);

-- Authenticated can manage combos
DROP POLICY IF EXISTS "Authenticated can manage combos" ON combos;
CREATE POLICY "Authenticated can manage combos"
    ON combos FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Seed data is now handled in 20260528235000_update_combo_real_data.sql
