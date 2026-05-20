# Configuración de Supabase - El Legado

Este documento explica cómo configurar Supabase para el panel de administración de El Legado.

## 1. Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) e inicia sesión
2. Haz clic en "New Project"
3. Completa los datos:
   - **Name**: `el-legado`
   - **Database Password**: Crea una contraseña segura
   - **Region**: `US East (Virginia)` o la más cercana
4. Espera a que termine de crear el proyecto

## 2. Obtener Credenciales

1. En el panel de Supabase, ve a **Settings** (icono de engranaje) → **API**
2. Copia:
   - **Project URL** → replaces `TU_SUPABASE_URL` en los archivos
   - **anon public** key → reemplaza `TU_SUPABASE_ANON_KEY` en los archivos

## 3. Crear Tablas

En el panel de Supabase, ve a **SQL Editor** y ejecuta:

```sql
-- Tabla de cotizaciones
CREATE TABLE cotizaciones (
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
CREATE TABLE clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    email TEXT,
    telefono TEXT,
    eventos_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de items del menú
CREATE TABLE menu_items (
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
CREATE TABLE eventos (
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
CREATE TABLE config (
    key TEXT PRIMARY KEY,
    value JSONB
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE cotizaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE config ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS DE SEGURIDAD CORREGIDAS
-- =====================================================

-- COTIZACIONES: Cualquiera puede crear/insertar (desde el sitio público)
-- Solo usuarios autenticados pueden ver, modificar, eliminar
DROP POLICY IF EXISTS "Allow public insert cotizaciones" ON cotizaciones;
DROP POLICY IF EXISTS "Allow auth select cotizaciones" ON cotizaciones;
DROP POLICY IF EXISTS "Allow auth update cotizaciones" ON cotizaciones;
DROP POLICY IF EXISTS "Allow auth delete cotizaciones" ON cotizaciones;

CREATE POLICY "Public can insert cotizaciones" ON cotizaciones 
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Auth users can manage cotizaciones" ON cotizaciones 
    FOR ALL USING (auth.role() = 'authenticated');

-- CONFIG: Solo usuarios autenticados pueden modificar
DROP POLICY IF EXISTS "Allow public select config" ON config;
DROP POLICY IF EXISTS "Allow auth insert config" ON config;
DROP POLICY IF EXISTS "Allow auth update config" ON config;
DROP POLICY IF EXISTS "Allow auth delete config" ON config;

CREATE POLICY "Public can read config" ON config 
    FOR SELECT USING (true);

CREATE POLICY "Auth users can manage config" ON config 
    FOR ALL USING (auth.role() = 'authenticated');

-- MENU_ITEMS: Lectura pública, gestión solo auth
DROP POLICY IF EXISTS "Allow public select menu_items" ON menu_items;
DROP POLICY IF EXISTS "Allow auth insert menu_items" ON menu_items;
DROP POLICY IF EXISTS "Allow auth update menu_items" ON menu_items;
DROP POLICY IF EXISTS "Allow auth delete menu_items" ON menu_items;

CREATE POLICY "Public can read menu_items" ON menu_items 
    FOR SELECT USING (true);

CREATE POLICY "Auth users can manage menu_items" ON menu_items 
    FOR ALL USING (auth.role() = 'authenticated');

-- CLIENTES: Solo usuarios autenticados
CREATE POLICY "Auth users can manage clientes" ON clientes 
    FOR ALL USING (auth.role() = 'authenticated');

-- EVENTOS: Solo usuarios autenticados
DROP POLICY IF EXISTS "Allow auth select eventos" ON eventos;
DROP POLICY IF EXISTS "Allow auth insert eventos" ON eventos;
DROP POLICY IF EXISTS "Allow auth update eventos" ON eventos;

CREATE POLICY "Auth users can manage eventos" ON eventos 
    FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- FUNCIÓN PARA VALIDAR DATOS DE COTIZACIÓN
-- =====================================================
CREATE OR REPLACE FUNCTION validate_cotizacion()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.num_invitados < 1 OR NEW.num_invitados > 1000 THEN
        RAISE EXCEPTION 'Número de invitados inválido';
    END IF;
    IF NEW.tipo_evento NOT IN ('Matrimonio', 'Evento Corporativo', 'Celebración Social') THEN
        RAISE EXCEPTION 'Tipo de evento inválido';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar validación
DROP TRIGGER IF EXISTS validate_cotizacion_trigger ON cotizaciones;
CREATE TRIGGER validate_cotizacion_trigger
    BEFORE INSERT OR UPDATE ON cotizaciones
    FOR EACH ROW
    EXECUTE FUNCTION validate_cotizacion();
```

## 4. Insertar Datos Iniciales del Menú

```sql
-- Bocados Salados
INSERT INTO menu_items (nombre, categoria, precio, etiquetas, orden) VALUES
('Canapés premium', 'salado', 15000, ARRAY['vegano', 'gluten-free'], 1),
('Mini Churrascos', 'salado', 15000, ARRAY[], 2),
('Mini Empanaditas', 'salado', 15000, ARRAY[], 3),
('Mini Pizzas', 'salado', 15000, ARRAY[], 4),
('Mini Sopaipillas con Pebre', 'salado', 15000, ARRAY['vegano'], 5),
('Mini Sándwiches de Miga', 'salado', 15000, ARRAY[], 6),
('Fosforitos', 'salado', 15000, ARRAY[], 7),
('Piononos', 'salado', 15000, ARRAY[], 8),
('Brochetas saladas', 'salado', 15000, ARRAY['gluten-free'], 9),
('Mini Conitos de Fajita', 'salado', 15000, ARRAY[], 10),
('Grisines con Tofu artesanal', 'salado', 15000, ARRAY['vegano'], 11),
('Mini Hamburguesitas Gourmet', 'salado', 15000, ARRAY[], 12);

-- Variedad Dulce
INSERT INTO menu_items (nombre, categoria, precio, etiquetas, orden) VALUES
('Canastitas', 'dulce', 10000, ARRAY[], 1),
('Shots variados', 'dulce', 10000, ARRAY['gluten-free'], 2),
('Tacitas rellenas', 'dulce', 10000, ARRAY[], 3),
('Conitos dulces', 'dulce', 10000, ARRAY[], 4),
('Galletas artesanales', 'dulce', 10000, ARRAY['vegano'], 5),
('Mini Donas bañadas en chocolate', 'dulce', 10000, ARRAY[], 6);

-- Configuración inicial
INSERT INTO config (key, value) VALUES
('precios', '{"salado": 15000, "dulce": 10000, "staff": 6000, "decor": 4000}'),
('invitados', '{"min": 20, "max": 300, "default": 50}'),
('whatsapp', '{"phone": "tu-numero-aqui"}'),
('email', '{"contacto": "catering.ellegado@gmail.com"}');
```

## 5. Actualizar Archivos con Credenciales

### Archivo: `assets/js/config.js`
Reemplaza:
- `TU_SUPABASE_URL` → tu Project URL
- `TU_SUPABASE_ANON_KEY` → tu anon key

### Archivo: `admin/js/config.js`
Reemplaza las mismas credenciales.

## 6. Crear Usuario Administrador

Para el primer usuario admin, hay dos opciones:

### Opción A: Insertar directamente (no recomendado para producción)
```sql
-- Crear usuario en auth.users
```

### Opción B: Usar el panel de Supabase (Recomendado)
1. Ve a **Authentication** → **Users**
2. Haz clic en **Invite user**
3. Ingresa el email del admin
4. El usuario recibirá un email para crear su contraseña

## 7. Probar la Integración

1. Actualiza las credenciales en los archivos
2. Abre el sitio web y usa el cotizador
3. Ve a `admin/login.html` e inicia sesión
4. Verifica que las cotizaciones aparezcan en el panel

## Solución de Problemas

### "Table does not exist"
- Verifica que ejecutaste el SQL en el SQL Editor
- Confirma que estás en el proyecto correcto

### "Row not found" errors
- Las políticas RLS pueden estar bloqueando accesos
- Verifica las políticas creadas en el paso 3

### Error de autenticación en el admin
- Asegúrate de que el usuario esté creado en Authentication
- Verifica las credenciales en `admin/js/config.js`