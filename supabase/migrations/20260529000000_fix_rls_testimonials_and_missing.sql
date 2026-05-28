-- Migration: Fix RLS policies, testimonials schema, and missing columns
-- Phase 1 of comprehensive backend audit fix

-- ============================================================
-- PART 1: Fix RLS — Replace is_admin() with auth.role() check
-- ============================================================

-- Drop the broken is_admin() function (depends on unset JWT claim)
DROP FUNCTION IF EXISTS is_admin() CASCADE;

-- Recreate RLS policies for financial tables using auth.role()
-- Drop both old and new policy names (in case of partial previous runs)
-- cotizaciones
DROP POLICY IF EXISTS "Admin can manage cotizaciones" ON cotizaciones;
DROP POLICY IF EXISTS "Authenticated can manage cotizaciones" ON cotizaciones;
CREATE POLICY "Authenticated can manage cotizaciones" ON cotizaciones
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- pagos
DROP POLICY IF EXISTS "Admin can manage pagos" ON pagos;
DROP POLICY IF EXISTS "Authenticated can manage pagos" ON pagos;
CREATE POLICY "Authenticated can manage pagos" ON pagos
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- facturas
DROP POLICY IF EXISTS "Admin can manage facturas" ON facturas;
DROP POLICY IF EXISTS "Authenticated can manage facturas" ON facturas;
CREATE POLICY "Authenticated can manage facturas" ON facturas
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- gastos
DROP POLICY IF EXISTS "Admin can manage gastos" ON gastos;
DROP POLICY IF EXISTS "Authenticated can manage gastos" ON gastos;
CREATE POLICY "Authenticated can manage gastos" ON gastos
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- presupuestos_detalle
DROP POLICY IF EXISTS "Admin can manage presupuestos_detalle" ON presupuestos_detalle;
DROP POLICY IF EXISTS "Authenticated can manage presupuestos_detalle" ON presupuestos_detalle;
CREATE POLICY "Authenticated can manage presupuestos_detalle" ON presupuestos_detalle
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- PART 2: Fix Testimonials — Recreate with correct schema
-- ============================================================

-- Drop old testimonials table entirely
DROP TABLE IF EXISTS testimonials CASCADE;

-- Recreate with correct column names (English, matching frontend)
CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT '',
  text TEXT NOT NULL DEFAULT '',
  event TEXT NOT NULL DEFAULT '',
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  menu TEXT NOT NULL DEFAULT '',
  active BOOLEAN NOT NULL DEFAULT true,
  orden INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Correct RLS policies
DROP POLICY IF EXISTS "Public can read testimonials" ON testimonials;
CREATE POLICY "Public can read testimonials" ON testimonials
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin can insert testimonials" ON testimonials;
DROP POLICY IF EXISTS "Authenticated can insert testimonials" ON testimonials;
CREATE POLICY "Authenticated can insert testimonials" ON testimonials
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin can update testimonials" ON testimonials;
DROP POLICY IF EXISTS "Authenticated can update testimonials" ON testimonials;
CREATE POLICY "Authenticated can update testimonials" ON testimonials
  FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin can delete testimonials" ON testimonials;
DROP POLICY IF EXISTS "Authenticated can delete testimonials" ON testimonials;
CREATE POLICY "Authenticated can delete testimonials" ON testimonials
  FOR DELETE USING (auth.role() = 'authenticated');

-- Also drop old policies that might have been migrated from the broken schema
DROP POLICY IF EXISTS "Admin can manage testimonials" ON testimonials;

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_testimonials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_testimonials_updated_at ON testimonials;
CREATE TRIGGER update_testimonials_updated_at
  BEFORE UPDATE ON testimonials
  FOR EACH ROW EXECUTE FUNCTION update_testimonials_updated_at();

-- Seed some sample testimonials
INSERT INTO testimonials (name, text, event, rating, menu, active, orden) VALUES
  ('María García', 'Excelente servicio, los canapés fueron un éxito en mi evento. Muy recomendables.', 'Cumpleaños', 5, 'Clásico', true, 1),
  ('Juan Pérez', 'La atención y la calidad de la comida superaron nuestras expectativas.', 'Evento Corporativo', 5, 'Ejecutivo', true, 2),
  ('Ana López', 'El combo Gran Fiesta fue perfecto para nuestra celebración familiar. Todos quedaron encantados.', 'Celebración Familiar', 5, 'Gran Fiesta', true, 3);

-- ============================================================
-- PART 3: Add missing column ultimo_contacto on clientes
-- ============================================================

ALTER TABLE clientes ADD COLUMN IF NOT EXISTS ultimo_contacto TIMESTAMPTZ;

-- ============================================================
-- PART 4: Fix site_config RLS to ensure public reads work
-- ============================================================

-- Ensure site_config has proper public read access
DROP POLICY IF EXISTS "Public can read site_config" ON site_config;
DROP POLICY IF EXISTS "Authenticated can read site_config" ON site_config;
CREATE POLICY "Public can read site_config" ON site_config
  FOR SELECT USING (true);

-- ============================================================
-- PART 5: Add footer key to site_config if missing
-- ============================================================

INSERT INTO site_config (key, value)
SELECT 'footer', '{"text":"© 2026 El Legado Catering. Todos los derechos reservados.","copyright":"El Legado Catering","address":"Av. Siempre Viva 123, Santiago","phone":"541176753854","mapUrl":"https://maps.google.com","schedule":[{"days":"Lunes a Viernes","hours":"9:00 – 20:00"},{"days":"Sábados","hours":"10:00 – 18:00"}]}'
WHERE NOT EXISTS (SELECT 1 FROM site_config WHERE key = 'footer');
