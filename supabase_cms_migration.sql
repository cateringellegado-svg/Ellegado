-- ====================================================================
-- CMS SYSTEM: Site Configuration Table + Storage Bucket
-- Ejecutar en SQL Editor de Supabase
-- ====================================================================

-- 1. Crear tabla site_config
CREATE TABLE IF NOT EXISTS site_config (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '{}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Trigger para updated_at
CREATE OR REPLACE FUNCTION update_site_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_site_config_updated_at ON site_config;
CREATE TRIGGER update_site_config_updated_at
    BEFORE UPDATE ON site_config
    FOR EACH ROW
    EXECUTE FUNCTION update_site_config_updated_at();

-- 3. Insertar valores por defecto (coherentes con el sitio actual)
INSERT INTO site_config (key, value) VALUES
('colors', '{
    "primary": "#AF7A54",
    "primaryLight": "#D9A78B",
    "background": "#FAF9F6",
    "text": "#1A1A1A",
    "textSecondary": "#64748B"
}'::jsonb),
('hero', '{
    "title": "El Legado",
    "subtitle": "Catering & Eventos",
    "tagline": "Donde cada evento se convierte en un legado inolvidable",
    "ctaText": "Cotizá tu evento",
    "stats": [
        {"label": "Eventos", "value": "+200"},
        {"label": "Años Exp.", "value": "5+"},
        {"label": "Dedicación", "value": "100%"}
    ]
}'::jsonb),
('about', '{
    "title": "Sobre Nosotros",
    "text": "Somos un equipo apasionado por la gastronomía y la creación de experiencias únicas. Cada evento es una oportunidad para dejar una huella imborrable en nuestros clientes.",
    "highlight": "La excelencia no es un acto, es un hábito."
}'::jsonb),
('festin', '{
    "title": "Armá tu Festín",
    "subtitle": "Armá tu catering personalizado",
    "ctaText": "Empezá a cotizar"
}'::jsonb),
('testimonials', '[
    {
        "name": "María & Juan",
        "text": "El catering fue espectacular. Nuestros invitados no paran de felicitarnos. La atención al detalle y la calidad de la comida superaron todas nuestras expectativas.",
        "event": "Boda",
        "source": "Google Reviews"
    },
    {
        "name": "TechCorp Argentina",
        "text": "Profesionalismo de principio a fin. El evento corporativo fue un éxito gracias a la calidad del servicio y la presentación impecable de cada plato.",
        "event": "Evento Empresarial",
        "source": "LinkedIn"
    }
]'::jsonb),
('footer', '{
    "text": "Haz Eterno Cada Momento",
    "copyright": "El Legado Catering y Eventos"
}'::jsonb),
('social', '{
    "instagram": "#",
    "facebook": "#",
    "tiktok": "#"
}'::jsonb),
('sections', '{
    "hero": true,
    "about": true,
    "festin": true,
    "gallery": true,
    "testimonials": true,
    "contact": true,
    "comingSoon": true,
    "footer": true
}'::jsonb),
('contact', '{
    "email": "catering.ellegado@gmail.com",
    "whatsapp": "541176753854"
}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 4. Crear bucket de storage para imágenes del sitio
INSERT INTO storage.buckets (id, name, public) 
VALUES ('site-images', 'site-images', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Políticas de storage para site-images
DROP POLICY IF EXISTS "Public can view site images" ON storage.objects;
CREATE POLICY "Public can view site images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'site-images');

DROP POLICY IF EXISTS "Auth users can upload site images" ON storage.objects;
CREATE POLICY "Auth users can upload site images"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'site-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Auth users can update site images" ON storage.objects;
CREATE POLICY "Auth users can update site images"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'site-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Auth users can delete site images" ON storage.objects;
CREATE POLICY "Auth users can delete site images"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'site-images' AND auth.role() = 'authenticated');

-- 6. RLS para site_config
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view site config" ON site_config;
CREATE POLICY "Public can view site config"
    ON site_config FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Authenticated can manage site config" ON site_config;
CREATE POLICY "Authenticated can manage site config"
    ON site_config FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- 7. Verificar
SELECT key, jsonb_pretty(value) FROM site_config ORDER BY key;
