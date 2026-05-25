-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES - EL LEGADO CATERING
-- Ejecutar en SQL Editor de Supabase
-- ====================================================================

-- 1. Habilitar RLS en todas las tablas
ALTER TABLE cotizaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE config ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;

-- ====================================================================
-- 2. POLITICAS PARA menu_items
-- Public puede leer items activos (sitio publico)
-- Authenticated puede CRUD completo (admin panel)
-- ====================================================================

DROP POLICY IF EXISTS "Public can view active menu items" ON menu_items;
CREATE POLICY "Public can view active menu items"
    ON menu_items FOR SELECT
    USING (activo = true);

DROP POLICY IF EXISTS "Authenticated can manage menu items" ON menu_items;
CREATE POLICY "Authenticated can manage menu items"
    ON menu_items FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- ====================================================================
-- 3. POLITICAS PARA cotizaciones
-- Public puede insertar (formulario cotizador)
-- Authenticated puede leer y actualizar (admin panel)
-- Nadie puede eliminar (preservar historial)
-- ====================================================================

DROP POLICY IF EXISTS "Public can create cotizaciones" ON cotizaciones;
CREATE POLICY "Public can create cotizaciones"
    ON cotizaciones FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated can view cotizaciones" ON cotizaciones;
CREATE POLICY "Authenticated can view cotizaciones"
    ON cotizaciones FOR SELECT
    USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated can update cotizaciones" ON cotizaciones;
CREATE POLICY "Authenticated can update cotizaciones"
    ON cotizaciones FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated can delete cotizaciones" ON cotizaciones;
CREATE POLICY "Authenticated can delete cotizaciones"
    ON cotizaciones FOR DELETE
    USING (auth.role() = 'authenticated');

-- ====================================================================
-- 4. POLITICAS PARA clientes
-- Authenticated puede CRUD completo (admin panel)
-- Public no tiene acceso directo
-- ====================================================================

DROP POLICY IF EXISTS "Authenticated can manage clientes" ON clientes;
CREATE POLICY "Authenticated can manage clientes"
    ON clientes FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- ====================================================================
-- 5. POLITICAS PARA config
-- Public puede leer (sitio publico necesita precios)
-- Authenticated puede CRUD completo (admin panel)
-- ====================================================================

DROP POLICY IF EXISTS "Public can view config" ON config;
CREATE POLICY "Public can view config"
    ON config FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Authenticated can manage config" ON config;
CREATE POLICY "Authenticated can manage config"
    ON config FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- ====================================================================
-- 5b. POLITICAS PARA site_config (CMS)
-- Public puede leer (necesario para que el sitio público funcione)
-- Authenticated puede CRUD completo (admin panel CMS)
-- ====================================================================

DROP POLICY IF EXISTS "Public can view site_config" ON site_config;
CREATE POLICY "Public can view site_config"
    ON site_config FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Authenticated can manage site_config" ON site_config;
CREATE POLICY "Authenticated can manage site_config"
    ON site_config FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- ====================================================================
-- 6. POLITICAS PARA eventos
-- Authenticated puede CRUD completo (admin panel)
-- Public no tiene acceso directo
-- ====================================================================

DROP POLICY IF EXISTS "Authenticated can manage eventos" ON eventos;
CREATE POLICY "Authenticated can manage eventos"
    ON eventos FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- ====================================================================
-- 7. VERIFICAR POLITICAS APLICADAS
-- ====================================================================
SELECT schemaname, tablename, policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
