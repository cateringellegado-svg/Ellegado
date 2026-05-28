-- ====================================================================
-- Migration: Fix cotizaciones RLS — allow public INSERT
-- ====================================================================
-- El API de cotizaciones usa anon key (sin autenticación) para que
-- los visitantes puedan enviar el formulario público. La política
-- anterior (auth.role() = 'authenticated' para ALL) bloqueaba los
-- inserts porque auth.role() retorna 'anon' con la anon key.
-- 
-- Se reemplaza por políticas granulares:
--   - Public puede INSERT (formulario público)
--   - Authenticated puede SELECT
--   - Authenticated puede UPDATE
--   - Authenticated puede DELETE
-- ====================================================================

-- Drop la política ALL anterior
DROP POLICY IF EXISTS "Authenticated can manage cotizaciones" ON cotizaciones;

-- Public puede insertar (formulario cotizador público)
DROP POLICY IF EXISTS "Public can create cotizaciones" ON cotizaciones;
CREATE POLICY "Public can create cotizaciones"
    ON cotizaciones FOR INSERT
    WITH CHECK (true);

-- Authenticated puede leer
DROP POLICY IF EXISTS "Authenticated can view cotizaciones" ON cotizaciones;
CREATE POLICY "Authenticated can view cotizaciones"
    ON cotizaciones FOR SELECT
    USING (auth.role() = 'authenticated');

-- Authenticated puede actualizar
DROP POLICY IF EXISTS "Authenticated can update cotizaciones" ON cotizaciones;
CREATE POLICY "Authenticated can update cotizaciones"
    ON cotizaciones FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Authenticated puede eliminar
DROP POLICY IF EXISTS "Authenticated can delete cotizaciones" ON cotizaciones;
CREATE POLICY "Authenticated can delete cotizaciones"
    ON cotizaciones FOR DELETE
    USING (auth.role() = 'authenticated');
