-- ====================================================================
-- DIAGNOSTICO Y REPARACION: Bucket menu-images
-- Ejecutar en SQL Editor de Supabase para verificar/reparar
-- ====================================================================

-- 1. Verificar si el bucket existe
SELECT id, name, public FROM storage.buckets WHERE id = 'menu-images';

-- 2. Si NO existe, crearlo:
INSERT INTO storage.buckets (id, name, public) 
VALUES ('menu-images', 'menu-images', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Verificar políticas existentes
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

-- 4. Recrear políticas (asegura que estén correctas)
DROP POLICY IF EXISTS "Public can view menu images" ON storage.objects;
CREATE POLICY "Public can view menu images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'menu-images');

DROP POLICY IF EXISTS "Auth users can upload menu images" ON storage.objects;
CREATE POLICY "Auth users can upload menu images"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'menu-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Auth users can update menu images" ON storage.objects;
CREATE POLICY "Auth users can update menu images"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'menu-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Auth users can delete menu images" ON storage.objects;
CREATE POLICY "Auth users can delete menu images"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'menu-images' AND auth.role() = 'authenticated');

-- 5. Verificar que RLS está habilitado en storage.objects
SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'objects';

-- 6. Ver imágenes subidas (si hay)
SELECT id, name, bucket_id, size, updated_at FROM storage.objects WHERE bucket_id = 'menu-images' ORDER BY updated_at DESC;