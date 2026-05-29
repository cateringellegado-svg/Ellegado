-- ====================================================================
-- Add idempotency for Mercado Pago webhooks
-- ====================================================================
-- Evita procesar el mismo pago mas de una vez (duplicados por
-- reenvio de webhook de MP). Crea un indice unico parcial sobre
-- mp_payment_id solo cuando es NOT NULL, para que la clause
-- ON CONFLICT DO NOTHING funcione como llave de idempotencia.
-- ====================================================================

-- Asegurar columna mp_payment_id existe
ALTER TABLE cotizaciones ADD COLUMN IF NOT EXISTS mp_payment_id TEXT;

-- Indice unico parcial: solo filas con mp_payment_id NOT NULL
-- Esto permite multiples filas NULL (cotizaciones sin pago MP)
-- y garantiza que ningun mp_payment_id se procese dos veces.
CREATE UNIQUE INDEX IF NOT EXISTS idx_cotizaciones_mp_payment_id
  ON cotizaciones (mp_payment_id)
  WHERE mp_payment_id IS NOT NULL;

SELECT CONCAT('✅ Indice unico idx_cotizaciones_mp_payment_id creado') AS resultado;
