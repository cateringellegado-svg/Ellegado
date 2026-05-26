-- ====================================================================
-- CREACIÓN: Bucket site-images y Políticas de Storage
-- Ejecutar en SQL Editor de Supabase
-- ====================================================================

-- 1. Crear bucket si no existe
INSERT INTO storage.buckets (id, name, public) 
VALUES ('site-images', 'site-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Eliminar politicas existentes (si existen)
DROP POLICY IF EXISTS "Public can view site images" ON storage.objects;
DROP POLICY IF EXISTS "Auth users can upload site images" ON storage.objects;
DROP POLICY IF EXISTS "Auth users can update site images" ON storage.objects;
DROP POLICY IF EXISTS "Auth users can delete site images" ON storage.objects;

-- 3. Crear politicas nuevas
CREATE POLICY "Public can view site images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'site-images');

CREATE POLICY "Auth users can upload site images"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'site-images' AND auth.role() = 'authenticated');

CREATE POLICY "Auth users can update site images"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'site-images' AND auth.role() = 'authenticated');

CREATE POLICY "Auth users can delete site images"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'site-images' AND auth.role() = 'authenticated');
