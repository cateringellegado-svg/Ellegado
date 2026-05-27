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

-- Seed 5 combos
INSERT INTO combos (id, nombre, descripcion, items_json, precio, personas_min, personas_max, activo, orden) VALUES
(
  'combo_clasico',
  'Combo Clásico',
  'Los infaltables de toda celebración. Canapés, mini empanadas y mini hamburguesas para compartir.',
  '[{"id":"canapes","nombre":"Canapés","cantidad":50,"precio":500},{"id":"mini_empanadas","nombre":"Mini Empanadas","cantidad":50,"precio":400},{"id":"mini_hamburguesas","nombre":"Mini Hamburguesas","cantidad":50,"precio":760}]',
  83000,
  15,
  25,
  true,
  1
),
(
  'combo_dulce',
  'Combo Dulce',
  'La experiencia dulce que todos esperan. Canastitas, shots variados y tacitas rellenas.',
  '[{"id":"canastitas","nombre":"Canastitas","cantidad":50,"precio":650},{"id":"shots","nombre":"Shots variados","cantidad":50,"precio":850},{"id":"tacitas","nombre":"Tacitas Rellenas","cantidad":50,"precio":700}]',
  110000,
  20,
  30,
  true,
  2
),
(
  'combo_ejecutivo',
  'Combo Ejecutivo',
  'Perfecto para eventos corporativos. Canapés, mini hamburguesas, sándwich de miga y fosforitos.',
  '[{"id":"canapes","nombre":"Canapés","cantidad":50,"precio":500},{"id":"mini_hamburguesas","nombre":"Mini Hamburguesas","cantidad":50,"precio":760},{"id":"sandwich_miga","nombre":"Mini Sándwich de Miga","cantidad":50,"precio":600},{"id":"fosforitos","nombre":"Fosforitos","cantidad":50,"precio":460}]',
  116000,
  20,
  35,
  true,
  3
),
(
  'combo_premium',
  'Combo Premium',
  'Selección exclusiva para paladaores exigentes. Tapaditos, mini pizzas y mini conitos.',
  '[{"id":"tapaditos","nombre":"Tapaditos","cantidad":50,"precio":600},{"id":"mini_pizzas","nombre":"Mini Pizzas","cantidad":50,"precio":560},{"id":"mini_conitos","nombre":"Mini Conitos","cantidad":50,"precio":1440}]',
  130000,
  20,
  30,
  true,
  4
),
(
  'combo_gran_fiesta',
  'Combo Gran Fiesta',
  'El combo más completo para grandes celebraciones. Incluye lo mejor de nuestra experiencia clásica y dulce.',
  '[{"id":"canapes","nombre":"Canapés","cantidad":100,"precio":500},{"id":"mini_empanadas","nombre":"Mini Empanadas","cantidad":100,"precio":400},{"id":"mini_hamburguesas","nombre":"Mini Hamburguesas","cantidad":100,"precio":760},{"id":"sopaipillas","nombre":"Mini Sopaipillas con Pebre","cantidad":50,"precio":400},{"id":"canastitas","nombre":"Canastitas","cantidad":50,"precio":650}]',
  218500,
  40,
  60,
  true,
  5
)
ON CONFLICT (id) DO NOTHING;
