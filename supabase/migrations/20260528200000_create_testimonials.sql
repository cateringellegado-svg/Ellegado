CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  comentario TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read testimonials" ON testimonials;
CREATE POLICY "Public can read testimonials"
  ON testimonials
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admin can insert testimonials" ON testimonials;
CREATE POLICY "Admin can insert testimonials"
  ON testimonials
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admin can update testimonials" ON testimonials;
CREATE POLICY "Admin can update testimonials"
  ON testimonials
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admin can delete testimonials" ON testimonials;
CREATE POLICY "Admin can delete testimonials"
  ON testimonials
  FOR DELETE
  USING (true);
