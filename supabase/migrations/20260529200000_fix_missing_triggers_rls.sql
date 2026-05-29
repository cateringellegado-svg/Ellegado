-- ====================================================================
-- Fix all missing triggers, RLS, and schema gaps
-- Must run AFTER all other migrations
-- ====================================================================

-- ============================================================
-- PART 1: Enable RLS on tables that have policies but no ENABLE RLS
-- ============================================================
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Keep existing policy and add a second for authenticated management
DROP POLICY IF EXISTS "Public can view active menu items" ON menu_items;
CREATE POLICY "Public can view active menu items"
  ON menu_items FOR SELECT
  USING (activo = true);

DROP POLICY IF EXISTS "Authenticated can manage menu_items" ON menu_items;
CREATE POLICY "Authenticated can manage menu_items"
  ON menu_items FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Enable RLS on clientes and eventos (had none)
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PART 2: RLS policies for clientes and eventos
-- ============================================================
DROP POLICY IF EXISTS "Authenticated can manage clientes" ON clientes;
CREATE POLICY "Authenticated can manage clientes"
  ON clientes FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated can manage eventos" ON eventos;
CREATE POLICY "Authenticated can manage eventos"
  ON eventos FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- PART 3: Create missing updated_at triggers on base tables
-- ============================================================
DROP TRIGGER IF EXISTS update_clientes_updated_at ON clientes;
CREATE TRIGGER update_clientes_updated_at
  BEFORE UPDATE ON clientes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_eventos_updated_at ON eventos;
CREATE TRIGGER update_eventos_updated_at
  BEFORE UPDATE ON eventos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cotizaciones_updated_at ON cotizaciones;
CREATE TRIGGER update_cotizaciones_updated_at
  BEFORE UPDATE ON cotizaciones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- PART 4: Wire up orphan trigger functions to cotizaciones
-- ============================================================
DROP TRIGGER IF EXISTS trg_validate_cotizacion ON cotizaciones;
CREATE TRIGGER trg_validate_cotizacion
  BEFORE INSERT ON cotizaciones
  FOR EACH ROW
  EXECUTE FUNCTION validate_cotizacion();

DROP TRIGGER IF EXISTS trg_rate_limit_cotizaciones ON cotizaciones;
CREATE TRIGGER trg_rate_limit_cotizaciones
  BEFORE INSERT ON cotizaciones
  FOR EACH ROW
  EXECUTE FUNCTION rate_limit_cotizaciones();

-- ============================================================
-- PART 5: Create storage buckets
-- (run via pg_catalog to avoid client-side dependency)
-- ============================================================
INSERT INTO storage.buckets (id, name, public, avif_autodetection)
VALUES
  ('menu-images', 'menu-images', true, false),
  ('site-images', 'site-images', true, false)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access on both buckets
DROP POLICY IF EXISTS "Public read menu-images" ON storage.objects;
CREATE POLICY "Public read menu-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'menu-images');

DROP POLICY IF EXISTS "Public read site-images" ON storage.objects;
CREATE POLICY "Public read site-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'site-images');

-- Allow authenticated users full access
DROP POLICY IF EXISTS "Authenticated manage menu-images" ON storage.objects;
CREATE POLICY "Authenticated manage menu-images"
  ON storage.objects FOR ALL
  USING (auth.role() = 'authenticated' AND bucket_id = 'menu-images')
  WITH CHECK (auth.role() = 'authenticated' AND bucket_id = 'menu-images');

DROP POLICY IF EXISTS "Authenticated manage site-images" ON storage.objects;
CREATE POLICY "Authenticated manage site-images"
  ON storage.objects FOR ALL
  USING (auth.role() = 'authenticated' AND bucket_id = 'site-images')
  WITH CHECK (auth.role() = 'authenticated' AND bucket_id = 'site-images');

SELECT '✅ fix_missing_triggers_rls completado' AS resultado;
