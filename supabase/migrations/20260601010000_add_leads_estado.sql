-- ====================================================================
-- Migration: Add estado + notas_internas columns to leads table
-- plus UPDATE RLS policy for authenticated admin users
-- ====================================================================

-- 1. Add columns (IF NOT EXISTS para ser idempotente)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS estado TEXT DEFAULT 'Nuevo';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS notas_internas TEXT;

-- 2. Set default 'Nuevo' for existing rows that are NULL
UPDATE leads SET estado = 'Nuevo' WHERE estado IS NULL;

-- 3. Add UPDATE policy for authenticated users (admin panel)
--    The existing SELECT policy already uses auth.role() = 'authenticated'
DROP POLICY IF EXISTS "Authenticated can update leads" ON leads;
CREATE POLICY "Authenticated can update leads"
  ON leads FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
