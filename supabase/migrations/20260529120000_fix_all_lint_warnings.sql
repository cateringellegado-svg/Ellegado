-- ====================================================================
-- Fix all Supabase linter warnings
-- ====================================================================

-- ====================================================================
-- PART 1: Fix function_search_path_mutable (0011)
-- Add SET search_path to all functions that are missing it
-- ====================================================================

CREATE OR REPLACE FUNCTION update_testimonials_updated_at()
RETURNS TRIGGER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_crm_updated_at()
RETURNS TRIGGER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_site_config_updated_at()
RETURNS TRIGGER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION validate_order_logic()
RETURNS TRIGGER
SET search_path = ''
AS $$
DECLARE
  servicios_json JSON;
  item JSON;
  total_qty INTEGER := 0;
  item_qty INTEGER;
  es_combo BOOLEAN;
BEGIN
  IF NEW.fecha_entrega IS NULL THEN
    RAISE EXCEPTION 'La fecha de entrega es obligatoria';
  END IF;

  IF NEW.fecha_entrega < CURRENT_DATE + INTERVAL '2 days' THEN
    RAISE EXCEPTION 'La fecha de entrega debe ser al menos 2 días después de hoy. Fecha seleccionada: %', NEW.fecha_entrega;
  END IF;

  servicios_json := NEW.servicios::JSON;

  FOR item IN SELECT * FROM json_array_elements(servicios_json)
  LOOP
    item_qty := (item->>'cantidad')::INTEGER;
    es_combo := COALESCE((item->>'es_combo')::BOOLEAN, false);

    IF NOT es_combo THEN
      IF item_qty % 10 != 0 THEN
        RAISE EXCEPTION 'Cada producto debe estar en múltiplos de 10. Producto: %, cantidad: %', item->>'nombre', item_qty;
      END IF;
    END IF;

    total_qty := total_qty + item_qty;
  END LOOP;

  IF NOT (SELECT BOOL_AND(COALESCE((item->>'es_combo')::BOOLEAN, false)) FROM json_array_elements(servicios_json) AS item) THEN
    IF total_qty < 50 THEN
      RAISE EXCEPTION 'La cantidad total mínima es 50 unidades. Total actual: %', total_qty;
    END IF;
  END IF;

  NEW.num_invitados := total_qty;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION validate_cotizacion()
RETURNS TRIGGER
SET search_path = ''
AS $$
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

CREATE OR REPLACE FUNCTION rate_limit_cotizaciones()
RETURNS TRIGGER
SET search_path = ''
AS $$
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

CREATE OR REPLACE FUNCTION get_configuracion_completa()
RETURNS TABLE(
  factor_ajuste NUMERIC,
  mp_access_token TEXT,
  capacidad_diaria_total INTEGER,
  entorno TEXT,
  mp_access_token_test TEXT
)
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT c.factor_ajuste, COALESCE(c.mp_access_token, ''), COALESCE(c.capacidad_diaria_total, 0),
         COALESCE(c.entorno, 'produccion'), COALESCE(c.mp_access_token_test, '')
  FROM configuracion c LIMIT 1;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION log_admin_action(
  p_accion TEXT,
  p_detalle TEXT DEFAULT '',
  p_usuario_email TEXT DEFAULT '',
  p_referencia_id TEXT DEFAULT ''
) RETURNS UUID
SET search_path = ''
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO admin_logs (accion, detalle, usuario_email, referencia_id)
  VALUES (p_accion, p_detalle, p_usuario_email, p_referencia_id)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_configuracion(
  p_factor_ajuste NUMERIC DEFAULT NULL,
  p_mp_access_token TEXT DEFAULT NULL,
  p_capacidad_diaria_total INTEGER DEFAULT NULL,
  p_entorno TEXT DEFAULT NULL,
  p_mp_access_token_test TEXT DEFAULT NULL
) RETURNS BOOLEAN
SET search_path = ''
AS $$
BEGIN
  UPDATE configuracion SET
    factor_ajuste = COALESCE(p_factor_ajuste, factor_ajuste),
    mp_access_token = COALESCE(p_mp_access_token, mp_access_token),
    capacidad_diaria_total = COALESCE(p_capacidad_diaria_total, capacidad_diaria_total),
    entorno = COALESCE(p_entorno, entorno),
    mp_access_token_test = COALESCE(p_mp_access_token_test, mp_access_token_test),
    updated_at = now()
  WHERE id = (SELECT id FROM configuracion LIMIT 1);
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================================================
-- PART 2: Fix anon_security_definer_function_executable (0028)
-- Revoke EXECUTE from anon on SECURITY DEFINER functions
-- These functions are NOT used via RPC by the app code
-- (the app uses supabase.from() directly instead)
-- ====================================================================

REVOKE EXECUTE ON FUNCTION log_admin_action FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION update_configuracion(p_factor_ajuste numeric, p_mp_access_token text, p_capacidad_diaria_total integer) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION update_configuracion(p_factor_ajuste numeric, p_mp_access_token text, p_capacidad_diaria_total integer, p_entorno text, p_mp_access_token_test text) FROM anon, authenticated;

-- ====================================================================
-- PART 2b: Remove duplicate RLS policy on cotizaciones
-- There are two policies: "Public can create cotizaciones" and
-- "Public can insert cotizaciones". Keep only one.
-- ====================================================================

DROP POLICY IF EXISTS "Public can insert cotizaciones" ON cotizaciones;

-- ====================================================================
-- PART 3: Fix auth_leaked_password_protection
-- Enable leaked password protection
-- ====================================================================

-- This must be enabled in the Supabase Dashboard:
-- Authentication → Settings → Security → Leaked password protection → Enable
-- Or via SQL:
-- UPDATE auth.config SET enable_leak_detection = true;
