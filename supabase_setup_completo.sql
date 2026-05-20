-- ====================================================================
-- SCRIPT COMPLETO DE CONFIGURACIÓN - EL LEGADO CATERING
-- ====================================================================
-- INSTRUCCIONES:
-- 1. Ve a tu proyecto en https://supabase.com/dashboard
-- 2. En el menú izquierdo, haz clic en "SQL Editor"
-- 3. Haz clic en "New Query"
-- 4. Pega TODO este código
-- 5. Haz clic en el botón "Run" (▶)
-- ====================================================================

-- ============================================
-- PASO 1: CREAR TABLAS
-- ============================================

-- Tabla de cotizaciones (las solicitudes que llegan desde la web)
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

-- Tabla de items del menú
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    categoria TEXT NOT NULL,
    precio INTEGER NOT NULL,
    etiquetas TEXT[],
    activo BOOLEAN DEFAULT true,
    orden INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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

-- Habilitar RLS en todas las tablas
ALTER TABLE cotizaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE config ENABLE ROW LEVEL SECURITY;

-- ---- COTIZACIONES ----
-- Cualquiera puede crear una cotización desde la web pública
-- Solo usuarios autenticados (admin) pueden ver, modificar, eliminar
DROP POLICY IF EXISTS "Allow public insert cotizaciones" ON cotizaciones;
DROP POLICY IF EXISTS "Allow auth select cotizaciones" ON cotizaciones;
DROP POLICY IF EXISTS "Allow auth update cotizaciones" ON cotizaciones;
DROP POLICY IF EXISTS "Allow auth delete cotizaciones" ON cotizaciones;
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
-- Lectura pública (para que la web cargue configuraciones)
-- Escritura solo para usuarios autenticados
DROP POLICY IF EXISTS "Allow public select config" ON config;
DROP POLICY IF EXISTS "Allow public insert config" ON config;
DROP POLICY IF EXISTS "Allow public update config" ON config;
DROP POLICY IF EXISTS "Allow auth insert config" ON config;
DROP POLICY IF EXISTS "Allow auth update config" ON config;
DROP POLICY IF EXISTS "Allow auth delete config" ON config;
DROP POLICY IF EXISTS "Public can read config" ON config;
DROP POLICY IF EXISTS "Auth users can manage config" ON config;

CREATE POLICY "Public can read config" ON config
    FOR SELECT USING (true);

CREATE POLICY "Auth insert config" ON config
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Auth update config" ON config
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Auth delete config" ON config
    FOR DELETE USING (auth.role() = 'authenticated');

-- ---- MENU_ITEMS ----
-- Lectura pública, gestión solo para autenticados
DROP POLICY IF EXISTS "Allow public select menu_items" ON menu_items;
DROP POLICY IF EXISTS "Allow public insert menu_items" ON menu_items;
DROP POLICY IF EXISTS "Allow public update menu_items" ON menu_items;
DROP POLICY IF EXISTS "Allow auth insert menu_items" ON menu_items;
DROP POLICY IF EXISTS "Allow auth update menu_items" ON menu_items;
DROP POLICY IF EXISTS "Allow auth delete menu_items" ON menu_items;
DROP POLICY IF EXISTS "Public can read menu_items" ON menu_items;
DROP POLICY IF EXISTS "Auth users can manage menu_items" ON menu_items;

CREATE POLICY "Public can read menu_items" ON menu_items
    FOR SELECT USING (true);

CREATE POLICY "Auth insert menu_items" ON menu_items
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Auth update menu_items" ON menu_items
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Auth delete menu_items" ON menu_items
    FOR DELETE USING (auth.role() = 'authenticated');

-- ---- CLIENTES ----
-- Solo usuarios autenticados pueden hacer todo
DROP POLICY IF EXISTS "Auth users can manage clientes" ON clientes;

CREATE POLICY "Auth manage clientes" ON clientes
    FOR ALL USING (auth.role() = 'authenticated');

-- ---- EVENTOS ----
-- Solo usuarios autenticados pueden hacer todo
DROP POLICY IF EXISTS "Allow auth select eventos" ON eventos;
DROP POLICY IF EXISTS "Allow auth insert eventos" ON eventos;
DROP POLICY IF EXISTS "Allow auth update eventos" ON eventos;
DROP POLICY IF EXISTS "Auth users can manage eventos" ON eventos;

CREATE POLICY "Auth manage eventos" ON eventos
    FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- PASO 3: DATOS INICIALES
-- ============================================

-- Bocados Salados
INSERT INTO menu_items (nombre, categoria, precio, etiquetas, orden) VALUES
('Canapés premium', 'salado', 15000, ARRAY['vegano', 'gluten-free'], 1),
('Mini Churrascos', 'salado', 15000, ARRAY[]::TEXT[], 2),
('Mini Empanaditas', 'salado', 15000, ARRAY[]::TEXT[], 3),
('Mini Pizzas', 'salado', 15000, ARRAY[]::TEXT[], 4),
('Mini Sopaipillas con Pebre', 'salado', 15000, ARRAY['vegano'], 5),
('Mini Sándwiches de Miga', 'salado', 15000, ARRAY[]::TEXT[], 6),
('Fosforitos', 'salado', 15000, ARRAY[]::TEXT[], 7),
('Piononos', 'salado', 15000, ARRAY[]::TEXT[], 8),
('Brochetas saladas', 'salado', 15000, ARRAY['gluten-free'], 9),
('Mini Conitos de Fajita', 'salado', 15000, ARRAY[]::TEXT[], 10),
('Grisines con Tofu artesanal', 'salado', 15000, ARRAY['vegano'], 11),
('Mini Hamburguesitas Gourmet', 'salado', 15000, ARRAY[]::TEXT[], 12)
ON CONFLICT DO NOTHING;

-- Variedad Dulce
INSERT INTO menu_items (nombre, categoria, precio, etiquetas, orden) VALUES
('Canastitas', 'dulce', 10000, ARRAY[]::TEXT[], 1),
('Shots variados', 'dulce', 10000, ARRAY['gluten-free'], 2),
('Tacitas rellenas', 'dulce', 10000, ARRAY[]::TEXT[], 3),
('Conitos dulces', 'dulce', 10000, ARRAY[]::TEXT[], 4),
('Galletas artesanales', 'dulce', 10000, ARRAY['vegano'], 5),
('Mini Donas bañadas en chocolate', 'dulce', 10000, ARRAY[]::TEXT[], 6)
ON CONFLICT DO NOTHING;

-- Configuración inicial
INSERT INTO config (key, value) VALUES
('precios', '{"salado": 15000, "dulce": 10000, "staff": 6000, "decor": 4000}'),
('invitados', '{"min": 20, "max": 300, "default": 50}'),
('whatsapp', '{"phone": "541176753854"}'),
('email', '{"contacto": "catering.ellegado@gmail.com"}')
ON CONFLICT (key) DO NOTHING;

-- ====================================================================
-- ¡LISTO! La base de datos está configurada.
-- Ahora ve a Authentication → Users → Invite user para crear tu
-- usuario administrador con el email: catering.ellegado@gmail.com
-- ====================================================================
