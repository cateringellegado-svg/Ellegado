-- ====================================================================
-- PARCHE DE SEGURIDAD: CONTROL DE ACCESO (RLS) - EL LEGADO
-- ====================================================================
-- Este script corrige las políticas públicas excesivamente permisivas
-- en las tablas 'cotizaciones', 'config' y 'menu_items'.
-- 
-- Para aplicar este parche:
-- 1. Copia todo el contenido de este script.
-- 2. Ve a la consola de Supabase -> SQL Editor.
-- 3. Crea una "New Query", pega este código y haz clic en "Run".
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. Asegurar Tabla 'cotizaciones' (leads de clientes)
-- --------------------------------------------------------------------
-- Eliminar políticas públicas antiguas
DROP POLICY IF EXISTS "Allow public select cotizaciones" ON cotizaciones;
DROP POLICY IF EXISTS "Allow public update cotizaciones" ON cotizaciones;

-- Crear políticas seguras (Público solo puede insertar; Lectura/Modificación/Eliminación requiere Login)
CREATE POLICY "Allow auth select cotizaciones" ON cotizaciones FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow auth update cotizaciones" ON cotizaciones FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow auth delete cotizaciones" ON cotizaciones FOR DELETE USING (auth.role() = 'authenticated');

-- --------------------------------------------------------------------
-- 2. Asegurar Tabla 'config' (ajustes y números de WhatsApp del negocio)
-- --------------------------------------------------------------------
-- Eliminar políticas públicas antiguas
DROP POLICY IF EXISTS "Allow public insert config" ON config;
DROP POLICY IF EXISTS "Allow public update config" ON config;

-- Crear políticas seguras (Público solo puede ver configuraciones; Edición/Inserción requiere Login)
CREATE POLICY "Allow auth insert config" ON config FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow auth update config" ON config FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow auth delete config" ON config FOR DELETE USING (auth.role() = 'authenticated');

-- --------------------------------------------------------------------
-- 3. Asegurar Tabla 'menu_items' (platos de la propuesta)
-- --------------------------------------------------------------------
-- Eliminar políticas públicas antiguas
DROP POLICY IF EXISTS "Allow public insert menu_items" ON menu_items;
DROP POLICY IF EXISTS "Allow public update menu_items" ON menu_items;

-- Crear políticas seguras (Público solo puede ver platos; Edición/Inserción requiere Login)
CREATE POLICY "Allow auth insert menu_items" ON menu_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow auth update menu_items" ON menu_items FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow auth delete menu_items" ON menu_items FOR DELETE USING (auth.role() = 'authenticated');

-- ====================================================================
-- ¡Parche aplicado con éxito! Tu base de datos ahora cumple con los
-- estándares de privacidad y seguridad premium.
-- ====================================================================
