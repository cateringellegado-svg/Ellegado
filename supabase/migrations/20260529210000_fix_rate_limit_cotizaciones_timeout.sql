-- ====================================================================
-- Fix: rate_limit_cotizaciones() timeout por RLS recursivo
-- ====================================================================
-- Problema: la funcion rate_limit_cotizaciones() ejecuta
--   SELECT COUNT(*) FROM cotizaciones
-- dentro de un BEFORE INSERT trigger sobre cotizaciones, SIN
-- SECURITY DEFINER. Con RLS habilitado, el SELECT dispara una
-- evaluacion recursiva de politicas RLS que cuelga la consulta
-- hasta que Supabase la mata por timeout ("Thread killed by
-- timeout manager").
--
-- Ademas, con SET search_path = '', la referencia sin calificar
-- FROM cotizaciones no encuentra la tabla porque public no esta
-- en el search path.
--
-- Solucion: SECURITY DEFINER para bypassear RLS en el SELECT
-- interno, y SET search_path = 'public' para resolver la tabla.
-- ====================================================================

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
    WHERE created_at > NOW() - INTERVAL '1 hour';

    IF recent_count >= 50 THEN
        RAISE EXCEPTION 'Demasiadas cotizaciones. Intenta mas tarde.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

SELECT '✅ rate_limit_cotizaciones actualizada con SECURITY DEFINER' AS resultado;
