-- Migration: Make fecha_entrega optional in validate_order_logic trigger
-- La fecha de entrega no es obligatoria: puede ser NULL si el usuario
-- no la selecciona (flujo manual sin wizard). Solo se valida si hay fecha.
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
  IF NEW.fecha_entrega IS NOT NULL THEN
    IF NEW.fecha_entrega < CURRENT_DATE + INTERVAL '2 days' THEN
      RAISE EXCEPTION 'La fecha de entrega debe ser al menos 2 dias despues de hoy. Fecha seleccionada: %', NEW.fecha_entrega;
    END IF;
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

SELECT '? validate_order_logic corregida: fecha_entrega opcional' AS resultado;
