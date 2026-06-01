ALTER TABLE cotizaciones ADD COLUMN archived BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_cotizaciones_archived ON cotizaciones(archived);
