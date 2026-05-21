-- ====================================================================
-- REPARACION: Bucket menu-images y Politicas de Storage
-- Ejecutar en SQL Editor de Supabase
-- ====================================================================

-- 1. Crear bucket si no existe
INSERT INTO storage.buckets (id, name, public) 
VALUES ('menu-images', 'menu-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Eliminar politicas existentes (si existen) para recrearlas limpias
DROP POLICY IF EXISTS "Public can view menu images" ON storage.objects;
DROP POLICY IF EXISTS "Auth users can upload menu images" ON storage.objects;
DROP POLICY IF EXISTS "Auth users can update menu images" ON storage.objects;
DROP POLICY IF EXISTS "Auth users can delete menu images" ON storage.objects;

-- 3. Crear politicas nuevas
CREATE POLICY "Public can view menu images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'menu-images');

CREATE POLICY "Auth users can upload menu images"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'menu-images' AND auth.role() = 'authenticated');

CREATE POLICY "Auth users can update menu images"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'menu-images' AND auth.role() = 'authenticated');

CREATE POLICY "Auth users can delete menu images"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'menu-images' AND auth.role() = 'authenticated');

-- 4. Verificar que el bucket se creo correctamente
SELECT id, name, public FROM storage.buckets WHERE id = 'menu-images';

-- 5. Verificar politicas aplicadas
SELECT policyname, cmd FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage' 
AND policyname LIKE '%menu images%'
ORDER BY cmd;
