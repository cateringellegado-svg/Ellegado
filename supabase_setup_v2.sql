-- ====================================================================
-- SCRIPT COMPLETO DE CONFIGURACIÓN - EL LEGADO CATERING v2
-- ====================================================================
-- INSTRUCCIONES:
-- 1. Ve a tu proyecto en https://supabase.com/dashboard
-- 2. En el menú izquierdo, haz clic en "SQL Editor"
-- 3. Haz clic en "New Query"
-- 4. Pega TODO este código
-- 5. Haz clic en el botón "Run" (▶)
-- ====================================================================

-- ============================================
-- PASO 1: CREAR/ACTUALIZAR TABLAS
-- ============================================

-- Tabla de cotizaciones
CREATE TABLE IF NOT EXISTS cotizaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo_evento TEXT NOT NULL,
    num_invitados INTEGER NOT NULL,
    servicios JSONB,
    presupuesto INTEGER,
    presupuesto_low INTEGER,
    presupuesto_high INTEGER,
    cliente_nombre TEXT,
    cliente_email TEXT,
    cliente_telefono TEXT,
    estado TEXT DEFAULT 'nueva',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de clientes
CREATE TABLE IF NOT EXISTS clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    email TEXT,
    telefono TEXT,
    eventos_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de items del menú (con soporte de imágenes)
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    categoria TEXT NOT NULL CHECK (categoria IN ('salado', 'dulce')),
    precio INTEGER NOT NULL CHECK (precio >= 0),
    descripcion TEXT DEFAULT '',
    imagen_url TEXT DEFAULT '',
    etiquetas TEXT[] DEFAULT '{}',
    activo BOOLEAN DEFAULT true,
    orden INTEGER DEFAULT 0,
    pendiente BOOLEAN DEFAULT false,
    minimo INTEGER DEFAULT 50,
    incremento INTEGER DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de eventos
CREATE TABLE IF NOT EXISTS eventos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID REFERENCES clientes(id),
    tipo_evento TEXT NOT NULL,
    fecha DATE NOT NULL,
    num_invitados INTEGER,
    estado TEXT DEFAULT 'pendiente',
    presupuesto_final INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de configuración
CREATE TABLE IF NOT EXISTS config (
    key TEXT PRIMARY KEY,
    value JSONB
);

-- ============================================
-- PASO 2: SEGURIDAD (Row Level Security)
-- ============================================

ALTER TABLE cotizaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE config ENABLE ROW LEVEL SECURITY;

-- ---- COTIZACIONES ----
DROP POLICY IF EXISTS "Public can insert cotizaciones" ON cotizaciones;
DROP POLICY IF EXISTS "Auth select cotizaciones" ON cotizaciones;
DROP POLICY IF EXISTS "Auth update cotizaciones" ON cotizaciones;
DROP POLICY IF EXISTS "Auth delete cotizaciones" ON cotizaciones;
DROP POLICY IF EXISTS "Public can insert cotizaciones" ON cotizaciones;
DROP POLICY IF EXISTS "Auth users can manage cotizaciones" ON cotizaciones;

CREATE POLICY "Public can insert cotizaciones" ON cotizaciones
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Auth select cotizaciones" ON cotizaciones
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Auth update cotizaciones" ON cotizaciones
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Auth delete cotizaciones" ON cotizaciones
    FOR DELETE USING (auth.role() = 'authenticated');

-- ---- CONFIG ----
DROP POLICY IF EXISTS "Public can read config" ON config;
DROP POLICY IF EXISTS "Auth insert config" ON config;
DROP POLICY IF EXISTS "Auth update config" ON config;
DROP POLICY IF EXISTS "Auth delete config" ON config;

CREATE POLICY "Public can read config" ON config
    FOR SELECT USING (true);

CREATE POLICY "Auth insert config" ON config
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Auth update config" ON config
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Auth delete config" ON config
    FOR DELETE USING (auth.role() = 'authenticated');

-- ---- MENU_ITEMS ----
DROP POLICY IF EXISTS "Public can read menu_items" ON menu_items;
DROP POLICY IF EXISTS "Auth insert menu_items" ON menu_items;
DROP POLICY IF EXISTS "Auth update menu_items" ON menu_items;
DROP POLICY IF EXISTS "Auth delete menu_items" ON menu_items;

CREATE POLICY "Public can read menu_items" ON menu_items
    FOR SELECT USING (true);

CREATE POLICY "Auth insert menu_items" ON menu_items
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Auth update menu_items" ON menu_items
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Auth delete menu_items" ON menu_items
    FOR DELETE USING (auth.role() = 'authenticated');

-- ---- CLIENTES ----
DROP POLICY IF EXISTS "Auth manage clientes" ON clientes;

CREATE POLICY "Auth manage clientes" ON clientes
    FOR ALL USING (auth.role() = 'authenticated');

-- ---- EVENTOS ----
DROP POLICY IF EXISTS "Auth manage eventos" ON eventos;

CREATE POLICY "Auth manage eventos" ON eventos
    FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- PASO 3: TRIGGERS DE VALIDACIÓN Y RATE LIMITING
-- ============================================

-- Trigger: Validar datos de cotización
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

-- Trigger: Rate limiting - máx 10 cotizaciones por hora
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

-- Trigger: Actualizar updated_at automáticamente
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

-- ============================================
-- PASO 4: BUCKET DE STORAGE PARA IMÁGENES
-- ============================================

-- Crear bucket para imágenes de productos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('menu-images', 'menu-images', true)
ON CONFLICT (id) DO NOTHING;

-- Política pública para leer imágenes del menú
DROP POLICY IF EXISTS "Public can view menu images" ON storage.objects;
CREATE POLICY "Public can view menu images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'menu-images');

-- Política para usuarios autenticados subiendo imágenes
DROP POLICY IF EXISTS "Auth users can upload menu images" ON storage.objects;
CREATE POLICY "Auth users can upload menu images"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'menu-images' 
        AND auth.role() = 'authenticated'
    );

-- Política para usuarios autenticados actualizando imágenes
DROP POLICY IF EXISTS "Auth users can update menu images" ON storage.objects;
CREATE POLICY "Auth users can update menu images"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'menu-images' AND auth.role() = 'authenticated');

-- Política para usuarios autenticados eliminando imágenes
DROP POLICY IF EXISTS "Auth users can delete menu images" ON storage.objects;
CREATE POLICY "Auth users can delete menu images"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'menu-images' AND auth.role() = 'authenticated');

-- ============================================
-- PASO 5: DATOS INICIALES
-- ============================================

-- Bocados Salados (con estructura completa para cotizador)
INSERT INTO menu_items (nombre, categoria, precio, descripcion, etiquetas, orden, minimo, incremento, pendiente) VALUES
('Canapés', 'salado', 500, 'Pan de chips con variantes: pollo pimentón, pollo ciboulette, huevo y tomate cherry, choclo y morrón, palmito y morrón, salame y aceituna negra, aceituna verde', '{}', 1, 50, 10, false),
('Mini Hamburguesas', 'salado', 760, '3 variantes: Clásico (carne, mayo, lechuga, tomate), Aliloy (carne, queso tybo, cebolla salteada, salsa aliloy), Gourmet (carne, tomate cherry, rúcula, queso azul)', '{}', 2, 50, 10, false),
('Mini Empanadas', 'salado', 400, '4 rellenos: carne, jamón y queso, pollo, caprese', '{}', 3, 50, 10, false),
('Tapaditos', 'salado', 600, 'Pan figasa con 3 pastas: pollo pimentón y morrón, pollo ciboulette y tomate cherry, jamón, queso, tomate y queso crema', '{}', 4, 50, 10, false),
('Mini Pizzas', 'salado', 560, 'Napolitana: queso, tomate, jamón y aceituna', '{}', 5, 50, 10, false),
('Mini Sopaipillas con Pebre', 'salado', 400, 'Sopaipillas tradicionales con pebre', '{vegano}', 6, 50, 10, false),
('Mini Conitos', 'salado', 1440, 'Cono de rapidita rellenos con: pollo, tomate, mayo y lechuga | carne, tomate y lechuga | jamón, queso, choclo, tomate y aceituna', '{}', 7, 50, 10, false),
('Mini Sándwich de Miga', 'salado', 600, 'Jamón y queso decorado con tomate cherry, aceituna y lechuga', '{}', 8, 50, 10, false),
('Fosforitos', 'salado', 460, 'Jamón y queso', '{}', 9, 50, 10, false),
('Nuggets Crocantes', 'salado', 0, 'Con 4 salsas', '{}', 10, 50, 10, true),
('Salchichas envueltas', 'salado', 0, 'Con 4 salsas', '{}', 11, 50, 10, true)
ON CONFLICT DO NOTHING;

-- Variedad Dulce
INSERT INTO menu_items (nombre, categoria, precio, descripcion, etiquetas, orden, minimo, incremento, pendiente) VALUES
('Canastitas', 'dulce', 650, 'Relleno: crema, dulce de leche y mousse de chocolate', '{}', 1, 50, 10, false),
('Shots variados', 'dulce', 850, 'Variedad de sabores a elección', '{}', 2, 50, 10, false),
('Tacitas Rellenas', 'dulce', 700, 'Masa de hojaldre con relleno de crema', '{}', 3, 50, 10, false),
('Conitos Dulces', 'dulce', 0, 'Rellenos con: crema, dulce de leche, mousse de chocolate', '{}', 4, 50, 10, true),
('Galletas Artesanales', 'dulce', 0, 'Veganas', '{vegano}', 5, 50, 10, true),
('Mini Donas', 'dulce', 0, 'Bañadas en chocolate', '{}', 6, 50, 10, true)
ON CONFLICT DO NOTHING;

-- Configuración inicial
INSERT INTO config (key, value) VALUES
('precios', '{"salado": 15000, "dulce": 10000, "staff": 6000, "decor": 4000}'),
('invitados', '{"min": 20, "max": 300, "default": 50}'),
('whatsapp', '{"phone": "541176753854"}'),
('email', '{"contacto": "catering.ellegado@gmail.com"}')
ON CONFLICT (key) DO NOTHING;

-- ====================================================================
-- ¡LISTO! Base de datos configurada con seguridad mejorada.
-- ====================================================================
