-- ====================================================================
-- Migration: Fix duplicate rows in configuracion + add unique constraint
-- ====================================================================

-- 1. Keep the row with factor_ajuste != 1.0 (admin's update), or if all
--    are 1.0, keep the most recently inserted row (highest updated_at).
--    Delete all others.
WITH keep AS (
  SELECT id FROM configuracion
  ORDER BY
    CASE WHEN factor_ajuste != 1.0 THEN 0 ELSE 1 END,
    updated_at DESC NULLS LAST,
    id
  LIMIT 1
)
DELETE FROM configuracion
WHERE id NOT IN (SELECT id FROM keep);

-- 2. Prevent future duplicates: partial unique index on constant column
--    ensures only one row can ever exist.
CREATE UNIQUE INDEX IF NOT EXISTS configuracion_singleton_idx
  ON configuracion ((true));

-- 3. Verify only one row remains
DO $$
DECLARE
  row_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO row_count FROM configuracion;
  IF row_count != 1 THEN
    RAISE EXCEPTION 'Expected exactly 1 row in configuracion, found %', row_count;
  END IF;
END $$;
