-- ====================================================================
-- Fix: "column reference is ambiguous" en validate_order_logic()
-- ====================================================================
-- Problema: la funcion validate_order_logic() declara una variable
-- PL/pgSQL llamada "item" (FOR loop), y luego en una subconsulta SQL
-- usa "AS item" como alias de tabla. PostgreSQL no puede determinar
-- si "item" en "item->>'es_combo'" es la variable o el alias,
-- lanzando error "column reference is ambiguous" (42702).
--
-- Solucion: renombrar el alias de tabla en la subconsulta a "jae"
-- (json_array_elements) para eliminar el conflicto con la variable.
--
-- Ademas, se agrega prefijo de tabla "cotizaciones." en la columna
-- created_at dentro de rate_limit_cotizaciones() por consistencia.
-- ====================================================================

-- ============================================================
-- Fix 1: validate_order_logic() - alias de tabla unico
-- ============================================================
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
    RAISE EXCEPTION 'La fecha de entrega debe ser al menos 2 dias despues de hoy. Fecha seleccionada: %', NEW.fecha_entrega;
  END IF;

  servicios_json := NEW.servicios::JSON;

  FOR item IN SELECT * FROM json_array_elements(servicios_json)
  LOOP
    item_qty := (item->>'cantidad')::INTEGER;
    es_combo := COALESCE((item->>'es_combo')::BOOLEAN, false);

    IF NOT es_combo THEN
      IF item_qty % 10 != 0 THEN
        RAISE EXCEPTION 'Cada producto debe estar en multiplos de 10. Producto: %, cantidad: %', item->>'nombre', item_qty;
      END IF;
    END IF;

    total_qty := total_qty + item_qty;
  END LOOP;

  IF NOT (SELECT BOOL_AND(COALESCE((jae->>'es_combo')::BOOLEAN, false)) FROM json_array_elements(servicios_json) AS jae) THEN
    IF total_qty < 50 THEN
      RAISE EXCEPTION 'La cantidad total minima es 50 unidades. Total actual: %', total_qty;
    END IF;
  END IF;

  NEW.num_invitados := total_qty;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

SELECT '✅ validate_order_logic corregida (alias jae)' AS resultado;

-- ============================================================
-- Fix 2: rate_limit_cotizaciones() - prefijo de tabla explicito
-- ============================================================
CREATE OR REPLACE FUNCTION rate_limit_cotizaciones()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    recent_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO recent_count
    FROM cotizaciones
    WHERE cotizaciones.created_at > NOW() - INTERVAL '1 hour';

    IF recent_count >= 50 THEN
        RAISE EXCEPTION 'Demasiadas cotizaciones. Intenta mas tarde.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

SELECT '✅ rate_limit_cotizaciones actualizada con prefijo cotizaciones.' AS resultado;
