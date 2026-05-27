-- ====================================================================
-- Migration: Add fecha_entrega to cotizaciones
-- ====================================================================

ALTER TABLE cotizaciones
  ADD COLUMN IF NOT EXISTS fecha_entrega DATE;
