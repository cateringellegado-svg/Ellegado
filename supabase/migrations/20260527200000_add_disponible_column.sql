-- Migration: Add disponible column to menu_items
-- This column controls whether a product is available for ordering
-- disponible = true: Product can be ordered (shows "Solicitar Lote de 50")
-- disponible = false: Product shows as "Próximamente" and cannot be ordered

ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS disponible BOOLEAN DEFAULT true;

-- Update public RLS policy to allow viewing items regardless of disponible
-- (disponible=false items should still show as "Próximamente")
DROP POLICY IF EXISTS "Public can view active menu items" ON menu_items;
CREATE POLICY "Public can view active menu items"
    ON menu_items FOR SELECT
    USING (activo = true);
