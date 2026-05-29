-- Migration: Seed/update combos with real data (idempotent)
-- Uses INSERT ... ON CONFLICT to handle both fresh and existing databases
-- without fragile primary key renames

INSERT INTO combos (id, nombre, descripcion, items_json, precio, personas_min, personas_max, activo, orden) VALUES
(
  'combo_esencia',
  'Combo Esencia',
  'Hamburguesas, empanadas, canapés, sándwiches de miga, conitos y fosforitos. Ideal para 10 a 15 personas.',
  '[{"id":"mini_hamburguesas","nombre":"Mini Hamburguesas","cantidad":15,"precio":760},{"id":"mini_empanadas","nombre":"Mini Empanadas","cantidad":15,"precio":400},{"id":"canapes","nombre":"Canapés","cantidad":25,"precio":500},{"id":"sandwich_miga","nombre":"Mini Sándwich de Miga","cantidad":15,"precio":600},{"id":"mini_conitos","nombre":"Mini Conitos","cantidad":15,"precio":1440},{"id":"fosforitos","nombre":"Fosforitos","cantidad":25,"precio":460}]',
  75400,
  10,
  15,
  true,
  1
),
(
  'combo_celebracion',
  'Combo Celebración',
  'Pizzas, tapaditos, conitos, salchichas, canapés, empanadas y fosforitos. Perfecto para 20 a 25 personas.',
  '[{"id":"mini_pizzas","nombre":"Mini Pizzas","cantidad":20,"precio":560},{"id":"tapaditos","nombre":"Tapaditos","cantidad":20,"precio":600},{"id":"mini_conitos","nombre":"Mini Conitos","cantidad":25,"precio":1440},{"id":"salchichas","nombre":"Salchichas Gourmet","cantidad":20,"precio":500},{"id":"canapes","nombre":"Canapés","cantidad":50,"precio":500},{"id":"mini_empanadas","nombre":"Mini Empanadas","cantidad":25,"precio":400},{"id":"fosforitos","nombre":"Fosforitos","cantidad":20,"precio":460}]',
  119400,
  20,
  25,
  true,
  2
),
(
  'combo_ejecutivo',
  'Combo Ejecutivo',
  'Canapés, hamburguesas, empanadas, sopaipillas, sándwiches de miga, nuggets y fosforitos. Para 30 a 35 personas.',
  '[{"id":"canapes","nombre":"Canapés","cantidad":60,"precio":500},{"id":"mini_hamburguesas","nombre":"Mini Hamburguesas","cantidad":30,"precio":760},{"id":"mini_empanadas","nombre":"Mini Empanadas","cantidad":30,"precio":400},{"id":"sopaipillas","nombre":"Mini Sopaipillas con Pebre","cantidad":60,"precio":400},{"id":"sandwich_miga","nombre":"Mini Sándwich de Miga","cantidad":30,"precio":600},{"id":"nuggets","nombre":"Nuggets de Pollo","cantidad":40,"precio":460},{"id":"fosforitos","nombre":"Fosforitos","cantidad":15,"precio":460}]',
  156300,
  30,
  35,
  true,
  3
),
(
  'combo_magno',
  'Combo Magno',
  'Conitos, canapés, sándwiches de miga, pizzas, salchichas, empanadas, fosforitos y hamburguesas. Para 40 a 45 personas.',
  '[{"id":"mini_conitos","nombre":"Mini Conitos","cantidad":20,"precio":1440},{"id":"canapes","nombre":"Canapés","cantidad":40,"precio":500},{"id":"sandwich_miga","nombre":"Mini Sándwich de Miga","cantidad":80,"precio":600},{"id":"mini_pizzas","nombre":"Mini Pizzas","cantidad":30,"precio":560},{"id":"salchichas","nombre":"Salchichas Gourmet","cantidad":40,"precio":500},{"id":"mini_empanadas","nombre":"Mini Empanadas","cantidad":30,"precio":400},{"id":"fosforitos","nombre":"Fosforitos","cantidad":60,"precio":460},{"id":"mini_hamburguesas","nombre":"Mini Hamburguesas","cantidad":40,"precio":760}]',
  215200,
  40,
  45,
  true,
  4
),
(
  'combo_gran_fiesta',
  'Combo Gran Fiesta',
  'Hamburguesas, tapaditos, canapés, fosforitos, nuggets, salchichas, empanadas, sándwiches de miga y shots variados. Nuestra propuesta más completa para 50 a 55 personas.',
  '[{"id":"mini_hamburguesas","nombre":"Mini Hamburguesas","cantidad":60,"precio":760},{"id":"tapaditos","nombre":"Tapaditos","cantidad":55,"precio":600},{"id":"canapes","nombre":"Canapés","cantidad":60,"precio":500},{"id":"fosforitos","nombre":"Fosforitos","cantidad":40,"precio":460},{"id":"nuggets","nombre":"Nuggets de Pollo","cantidad":40,"precio":460},{"id":"salchichas","nombre":"Salchichas Gourmet","cantidad":40,"precio":500},{"id":"mini_empanadas","nombre":"Mini Empanadas","cantidad":50,"precio":400},{"id":"sandwich_miga","nombre":"Mini Sándwich de Miga","cantidad":80,"precio":600},{"id":"shots","nombre":"Shots variados","cantidad":45,"precio":850}]',
  313000,
  50,
  55,
  true,
  5
)
ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  items_json = EXCLUDED.items_json,
  precio = EXCLUDED.precio,
  personas_min = EXCLUDED.personas_min,
  personas_max = EXCLUDED.personas_max,
  activo = EXCLUDED.activo,
  orden = EXCLUDED.orden;
