-- ====================================================================
-- PATCH FINAL: Categorias, Bucket, Datos de Productos
-- ====================================================================
-- Ejecutar en SQL Editor de Supabase
-- ====================================================================

-- 1. Asegurar columnas existen
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS descripcion TEXT DEFAULT '';
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS imagen_url TEXT DEFAULT '';
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS pendiente BOOLEAN DEFAULT false;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS minimo INTEGER DEFAULT 50;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS incremento INTEGER DEFAULT 10;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Migrar datos existentes: 'salado' -> 'clasica'
UPDATE menu_items SET categoria = 'clasica' WHERE categoria = 'salado';

-- 3. Actualizar constraint de categoria para incluir 'premium'
ALTER TABLE menu_items DROP CONSTRAINT IF EXISTS menu_items_categoria_check;
ALTER TABLE menu_items ADD CONSTRAINT menu_items_categoria_check CHECK (categoria IN ('clasica', 'premium', 'dulce'));

-- 4. Eliminar datos duplicados viejos y limpiar
DELETE FROM menu_items WHERE nombre IN ('Canapés premium', 'Mini Churrascos', 'Mini Empanaditas', 'Mini Pizzas', 'Mini Sopaipillas con Pebre', 'Mini Sándwiches de Miga', 'Fosforitos', 'Piononos', 'Brochetas saladas', 'Mini Conitos de Fajita', 'Grisines con Tofu artesanal', 'Mini Hamburguesitas Gourmet', 'Canastitas', 'Shots variados', 'Tacitas rellenas', 'Conitos dulces', 'Galletas artesanales', 'Mini Donas bañadas en chocolate');

-- 5. Insertar datos correctos con descripciones completas
-- EXPERIENCIA CLASICA (salados)
INSERT INTO menu_items (nombre, categoria, precio, descripcion, etiquetas, orden, minimo, incremento, pendiente) VALUES
('Canapés', 'clasica', 500, 'Pan de chips con variantes: pollo pimentón, pollo ciboulette, huevo y tomate cherry, choclo y morrón, palmito y morrón, salame y aceituna negra, aceituna verde', '{}', 1, 50, 10, false),
('Mini Hamburguesas', 'clasica', 760, '3 variantes: Clásico (carne, mayo, lechuga, tomate), Aliloy (carne, queso tybo, cebolla salteada, salsa aliloy), Gourmet (carne, tomate cherry, rúcula, queso azul)', '{}', 2, 50, 10, false),
('Mini Empanadas', 'clasica', 400, '4 rellenos: carne, jamón y queso, pollo, caprese', '{}', 3, 50, 10, false),
('Tapaditos', 'clasica', 600, 'Pan figasa con 3 pastas: pollo pimentón y morrón, pollo ciboulette y tomate cherry, jamón, queso, tomate y queso crema', '{}', 4, 50, 10, false),
('Mini Pizzas', 'clasica', 560, 'Napolitana: queso, tomate, jamón y aceituna', '{}', 5, 50, 10, false),
('Mini Sopaipillas con Pebre', 'clasica', 400, 'Sopaipillas tradicionales con pebre', '{vegano}', 6, 50, 10, false),
('Mini Conitos', 'clasica', 1440, 'Cono de rapidita rellenos con: pollo, tomate, mayo y lechuga | carne, tomate y lechuga | jamón, queso, choclo, tomate y aceituna', '{}', 7, 50, 10, false),
('Mini Sándwich de Miga', 'clasica', 600, 'Jamón y queso decorado con tomate cherry, aceituna y lechuga', '{}', 8, 50, 10, false),
('Fosforitos', 'clasica', 460, 'Jamón y queso', '{}', 9, 50, 10, false),
('Nuggets Crocantes', 'clasica', 0, 'Con 4 salsas', '{}', 10, 50, 10, true),
('Salchichas envueltas', 'clasica', 0, 'Con 4 salsas', '{}', 11, 50, 10, true)
ON CONFLICT DO NOTHING;

-- EXPERIENCIA PREMIUM
INSERT INTO menu_items (nombre, categoria, precio, descripcion, etiquetas, orden, minimo, incremento, pendiente) VALUES
('Canapés Gourmet', 'premium', 800, 'Selección premium de canapés con ingredientes importados', '{}', 1, 50, 10, true),
('Bruschettas Artesanales', 'premium', 900, 'Pan artesanal con toppings gourmet', '{}', 2, 50, 10, true),
('Mini Quiches', 'premium', 750, 'Quiches individuales de sabores variados', '{}', 3, 50, 10, true)
ON CONFLICT DO NOTHING;

-- EXPERIENCIA DULCE
INSERT INTO menu_items (nombre, categoria, precio, descripcion, etiquetas, orden, minimo, incremento, pendiente) VALUES
('Canastitas', 'dulce', 650, 'Relleno: crema, dulce de leche y mousse de chocolate', '{}', 1, 50, 10, false),
('Shots variados', 'dulce', 850, 'Variedad de sabores a elección', '{}', 2, 50, 10, false),
('Tacitas Rellenas', 'dulce', 700, 'Masa de hojaldre con relleno de crema', '{}', 3, 50, 10, false),
('Conitos Dulces', 'dulce', 0, 'Rellenos con: crema, dulce de leche, mousse de chocolate', '{}', 4, 50, 10, true),
('Galletas Artesanales', 'dulce', 0, 'Veganas', '{vegano}', 5, 50, 10, true),
('Mini Donas', 'dulce', 0, 'Bañadas en chocolate', '{}', 6, 50, 10, true)
ON CONFLICT DO NOTHING;

-- 6. Crear bucket de storage
INSERT INTO storage.buckets (id, name, public) 
VALUES ('menu-images', 'menu-images', true)
ON CONFLICT (id) DO NOTHING;

-- 7. Políticas de storage
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

-- 8. Triggers
CREATE OR REPLACE FUNCTION validate_cotizacion()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.num_invitados < 1 OR NEW.num_invitados > 10000 THEN
        RAISE EXCEPTION 'Número de invitados inválido (1-10000)';
    END IF;
    IF NEW.presupuesto IS NOT NULL AND NEW.presupuesto < 0 THEN
        RAISE EXCEPTION 'Presupuesto no puede ser negativo';
    END IF;
    IF NEW.cliente_nombre IS NOT NULL AND length(NEW.cliente_nombre) > 200 THEN
        RAISE EXCEPTION 'Nombre demasiado largo (máx 200 caracteres)';
    END IF;
    IF NEW.cliente_email IS NOT NULL AND length(NEW.cliente_email) > 200 THEN
        RAISE EXCEPTION 'Email demasiado largo (máx 200 caracteres)';
    END IF;
    IF NEW.cliente_telefono IS NOT NULL AND length(NEW.cliente_telefono) > 50 THEN
        RAISE EXCEPTION 'Teléfono demasiado largo (máx 50 caracteres)';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validate_cotizacion_trigger ON cotizaciones;
CREATE TRIGGER validate_cotizacion_trigger
    BEFORE INSERT OR UPDATE ON cotizaciones
    FOR EACH ROW
    EXECUTE FUNCTION validate_cotizacion();

CREATE OR REPLACE FUNCTION rate_limit_cotizaciones()
RETURNS TRIGGER AS $$
DECLARE
    recent_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO recent_count
    FROM cotizaciones
    WHERE created_at > NOW() - INTERVAL '1 hour';
    
    IF recent_count >= 50 THEN
        RAISE EXCEPTION 'Demasiadas cotizaciones. Intenta más tarde.';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS rate_limit_cotizaciones_trigger ON cotizaciones;
CREATE TRIGGER rate_limit_cotizaciones_trigger
    BEFORE INSERT ON cotizaciones
    FOR EACH ROW
    EXECUTE FUNCTION rate_limit_cotizaciones();

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_cotizaciones_updated_at ON cotizaciones;
CREATE TRIGGER update_cotizaciones_updated_at
    BEFORE UPDATE ON cotizaciones
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_menu_items_updated_at ON menu_items;
CREATE TRIGGER update_menu_items_updated_at
    BEFORE UPDATE ON menu_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
