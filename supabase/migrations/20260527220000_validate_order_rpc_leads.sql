-- ====================================================================
-- Migration: validate_order_logic RPC + Trigger + Leads Table
-- ====================================================================

-- 1. Create validate_order_logic function
-- Enforces: total_qty >= 50, each product qty % 10 == 0,
--           fecha_entrega >= today + 2 days
CREATE OR REPLACE FUNCTION validate_order_logic()
RETURNS TRIGGER AS $$
DECLARE
  servicios_json JSON;
  item JSON;
  total_qty INTEGER := 0;
  item_qty INTEGER;
BEGIN
  -- Validate fecha_entrega >= CURRENT_DATE + INTERVAL '2 days'
  IF NEW.fecha_entrega IS NULL THEN
    RAISE EXCEPTION 'La fecha de entrega es obligatoria';
  END IF;

  IF NEW.fecha_entrega < CURRENT_DATE + INTERVAL '2 days' THEN
    RAISE EXCEPTION 'La fecha de entrega debe ser al menos 2 días después de hoy. Fecha seleccionada: %', NEW.fecha_entrega;
  END IF;

  -- Validate products
  servicios_json := NEW.servicios::JSON;

  FOR item IN SELECT * FROM json_array_elements(servicios_json)
  LOOP
    item_qty := (item->>'cantidad')::INTEGER;
    IF item_qty % 10 != 0 THEN
      RAISE EXCEPTION 'Cada producto debe estar en múltiplos de 10. Producto: %, cantidad: %', item->>'nombre', item_qty;
    END IF;
    total_qty := total_qty + item_qty;
  END LOOP;

  IF total_qty < 50 THEN
    RAISE EXCEPTION 'La cantidad total mínima es 50 unidades. Total actual: %', total_qty;
  END IF;

  NEW.num_invitados := total_qty;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Trigger on cotizaciones
DROP TRIGGER IF EXISTS trg_validate_order ON cotizaciones;
CREATE TRIGGER trg_validate_order
  BEFORE INSERT ON cotizaciones
  FOR EACH ROW
  EXECUTE FUNCTION validate_order_logic();

-- 3. Create leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo_evento TEXT NOT NULL,
  num_invitados INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. RLS for leads
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can insert leads" ON leads;
CREATE POLICY "Public can insert leads"
  ON leads FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated can view leads" ON leads;
CREATE POLICY "Authenticated can view leads"
  ON leads FOR SELECT
  USING (auth.role() = 'authenticated');
