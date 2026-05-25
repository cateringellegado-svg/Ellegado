-- ====================================================================
-- MIGRACIÓN: CMS COMPLETO - El Legado Catering
-- Nuevas keys en site_config + tabla testimonials
-- ====================================================================

-- 1. Insertar defaults para nuevas keys de site_config
INSERT INTO site_config (key, value) VALUES
('seo', '{
  "metaTitle": "EL LEGADO - Catering y Eventos | Haz Eterno Cada Momento",
  "metaDescription": "Servicio de catering premium para eventos inolvidables. Bodas, cumpleaños, eventos corporativos y más. Buenos Aires.",
  "keywords": ["catering","eventos","catering premium","Buenos Aires","bodas","fiestas"],
  "ogImage": "/hero_catering.webp"
}'::jsonb),
('features', '{
  "title": "¿Por Qué Elegirnos?",
  "items": [
    {"icon": "chef", "title": "Cocina Artesanal", "text": "Cada bocado es preparado con ingredientes seleccionados y recetas únicas que marcan la diferencia."},
    {"icon": "sparkles", "title": "Presentación Impecable", "text": "El arte de presentar cada plato como una obra maestra visual que cautiva a tus invitados."},
    {"icon": "heart", "title": "Atención Personalizada", "text": "Escuchamos tus ideas y las transformamos en una experiencia gastronómica a tu medida."},
    {"icon": "star", "title": "Calidad Premium", "text": "Estándares de calidad que superan expectativas, con ingredientes frescos y de primera línea."}
  ]
}'::jsonb),
('cta', '{
  "title": "¿Listo para tu evento perfecto?",
  "text": "Contactanos hoy y empecemos a planificar juntos el catering que hará inolvidable tu ocasión especial.",
  "buttonText": "Cotizá tu Evento"
}'::jsonb),
('comingSoon', '{
  "title": "Próximamente",
  "items": [
    {"title": "Bowls Saludables", "description": "Bowls nutritivos con ingredientes frescos y opciones vegetarianas", "icon": "bowl"},
    {"title": "Barra de Smoothies", "description": "Estación interactiva de smoothies naturales y funcionales", "icon": "smoothie"},
    {"title": "Noche de Parrilla", "description": "Experiencia de parrilla argentina para eventos al aire libre", "icon": "grill"},
    {"title": "Cheese & Wine", "description": "Selección de quesos artesanales maridados con vinos premium", "icon": "cheese"}
  ]
}'::jsonb),
('navbar', '{
  "logoUrl": "/logo.webp",
  "links": [
    {"label": "Inicio", "href": "#hero"},
    {"label": "Nosotros", "href": "#about"},
    {"label": "Festín", "href": "#festin"},
    {"label": "Galería", "href": "#gallery"},
    {"label": "Contacto", "href": "#contact"}
  ]
}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 2. Actualizar footer con nuevos campos
UPDATE site_config
SET value = value || '{
  "schedule": [{"days": "Lunes a Viernes", "hours": "9:00 – 20:00"}, {"days": "Sábados", "hours": "10:00 – 18:00"}],
  "address": "Buenos Aires, Argentina",
  "phone": "+54 11 7675-3854",
  "mapUrl": "https://maps.google.com"
}'::jsonb
WHERE key = 'footer';

-- 3. Actualizar about con highlight
UPDATE site_config
SET value = value || '{"highlight": "Tradición, calidad y pasión en cada bocado."}'::jsonb
WHERE key = 'about';

-- 4. Tabla testimonials
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT '',
  text TEXT NOT NULL DEFAULT '',
  event TEXT NOT NULL DEFAULT '',
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  menu TEXT NOT NULL DEFAULT '',
  active BOOLEAN NOT NULL DEFAULT true,
  orden INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active testimonials" ON testimonials;
CREATE POLICY "Public can view active testimonials"
  ON testimonials FOR SELECT
  USING (active = true);

DROP POLICY IF EXISTS "Authenticated can manage testimonials" ON testimonials;
CREATE POLICY "Authenticated can manage testimonials"
  ON testimonials FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- 5. Insertar testimonios por defecto
INSERT INTO testimonials (name, text, event, rating, menu, orden, active) VALUES
('María & Carlos', 'El servicio de catering superó todas nuestras expectativas. Nuestros invitados siguen hablando de la comida semanas después de la boda.', 'Boda', 5, 'Experiencia Clásica', 1, true),
('Laura García', 'La presentación de cada plato era una obra de arte. El equipo fue muy profesional y atento a cada detalle.', 'Cumpleaños', 5, 'Experiencia Premium', 2, true)
ON CONFLICT DO NOTHING;

-- 6. Trigger updated_at para testimonials
CREATE OR REPLACE FUNCTION update_testimonials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_testimonials_updated_at ON testimonials;
CREATE TRIGGER update_testimonials_updated_at
  BEFORE UPDATE ON testimonials
  FOR EACH ROW
  EXECUTE FUNCTION update_testimonials_updated_at();
