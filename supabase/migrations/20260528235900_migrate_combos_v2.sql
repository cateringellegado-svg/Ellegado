-- Migration v2: Rename combo IDs + set exact quantities
-- Handles prod environments where old migration already ran with old IDs

-- Step 1: Rename primary keys (safe, no FK references to combos.id)
UPDATE combos SET id = 'combo_esencia' WHERE id = 'combo_clasico';
UPDATE combos SET id = 'combo_celebracion' WHERE id = 'combo_dulce';
UPDATE combos SET id = 'combo_magno' WHERE id = 'combo_premium';

-- Step 2: Set exact quantities + new display names
UPDATE combos SET
  nombre = 'Combo Esencia',
  descripcion = 'Hamburguesas, empanadas, canapés, sándwiches de miga, conitos y fosforitos. Ideal para 10 a 15 personas.',
  items_json = '[{"id":"mini_hamburguesas","nombre":"Mini Hamburguesas","cantidad":15,"precio":760},{"id":"mini_empanadas","nombre":"Mini Empanadas","cantidad":15,"precio":400},{"id":"canapes","nombre":"Canapés","cantidad":25,"precio":500},{"id":"sandwich_miga","nombre":"Mini Sándwich de Miga","cantidad":15,"precio":600},{"id":"mini_conitos","nombre":"Mini Conitos","cantidad":15,"precio":1440},{"id":"fosforitos","nombre":"Fosforitos","cantidad":25,"precio":460}]',
  precio = 75400,
  personas_min = 10,
  personas_max = 15
WHERE id = 'combo_esencia';

UPDATE combos SET
  nombre = 'Combo Celebración',
  descripcion = 'Pizzas, tapaditos, conitos, salchichas, canapés, empanadas y fosforitos. Perfecto para 20 a 25 personas.',
  items_json = '[{"id":"mini_pizzas","nombre":"Mini Pizzas","cantidad":20,"precio":560},{"id":"tapaditos","nombre":"Tapaditos","cantidad":20,"precio":600},{"id":"mini_conitos","nombre":"Mini Conitos","cantidad":25,"precio":1440},{"id":"salchichas","nombre":"Salchichas Gourmet","cantidad":20,"precio":500},{"id":"canapes","nombre":"Canapés","cantidad":50,"precio":500},{"id":"mini_empanadas","nombre":"Mini Empanadas","cantidad":25,"precio":400},{"id":"fosforitos","nombre":"Fosforitos","cantidad":20,"precio":460}]',
  precio = 119400,
  personas_min = 20,
  personas_max = 25
WHERE id = 'combo_celebracion';

UPDATE combos SET
  nombre = 'Combo Ejecutivo',
  descripcion = 'Canapés, hamburguesas, empanadas, sopaipillas, sándwiches de miga, nuggets y fosforitos. Para 30 a 35 personas.',
  items_json = '[{"id":"canapes","nombre":"Canapés","cantidad":60,"precio":500},{"id":"mini_hamburguesas","nombre":"Mini Hamburguesas","cantidad":30,"precio":760},{"id":"mini_empanadas","nombre":"Mini Empanadas","cantidad":30,"precio":400},{"id":"sopaipillas","nombre":"Mini Sopaipillas con Pebre","cantidad":60,"precio":400},{"id":"sandwich_miga","nombre":"Mini Sándwich de Miga","cantidad":30,"precio":600},{"id":"nuggets","nombre":"Nuggets de Pollo","cantidad":40,"precio":460},{"id":"fosforitos","nombre":"Fosforitos","cantidad":15,"precio":460}]',
  precio = 156300,
  personas_min = 30,
  personas_max = 35
WHERE id = 'combo_ejecutivo';

UPDATE combos SET
  nombre = 'Combo Magno',
  descripcion = 'Conitos, canapés, sándwiches de miga, pizzas, salchichas, empanadas, fosforitos y hamburguesas. Para 40 a 45 personas.',
  items_json = '[{"id":"mini_conitos","nombre":"Mini Conitos","cantidad":20,"precio":1440},{"id":"canapes","nombre":"Canapés","cantidad":40,"precio":500},{"id":"sandwich_miga","nombre":"Mini Sándwich de Miga","cantidad":80,"precio":600},{"id":"mini_pizzas","nombre":"Mini Pizzas","cantidad":30,"precio":560},{"id":"salchichas","nombre":"Salchichas Gourmet","cantidad":40,"precio":500},{"id":"mini_empanadas","nombre":"Mini Empanadas","cantidad":30,"precio":400},{"id":"fosforitos","nombre":"Fosforitos","cantidad":60,"precio":460},{"id":"mini_hamburguesas","nombre":"Mini Hamburguesas","cantidad":40,"precio":760}]',
  precio = 215200,
  personas_min = 40,
  personas_max = 45
WHERE id = 'combo_magno';

UPDATE combos SET
  nombre = 'Combo Gran Fiesta',
  descripcion = 'Hamburguesas, tapaditos, canapés, fosforitos, nuggets, salchichas, empanadas, sándwiches de miga y shots variados. Nuestra propuesta más completa para 50 a 55 personas.',
  items_json = '[{"id":"mini_hamburguesas","nombre":"Mini Hamburguesas","cantidad":60,"precio":760},{"id":"tapaditos","nombre":"Tapaditos","cantidad":55,"precio":600},{"id":"canapes","nombre":"Canapés","cantidad":60,"precio":500},{"id":"fosforitos","nombre":"Fosforitos","cantidad":40,"precio":460},{"id":"nuggets","nombre":"Nuggets de Pollo","cantidad":40,"precio":460},{"id":"salchichas","nombre":"Salchichas Gourmet","cantidad":40,"precio":500},{"id":"mini_empanadas","nombre":"Mini Empanadas","cantidad":50,"precio":400},{"id":"sandwich_miga","nombre":"Mini Sándwich de Miga","cantidad":80,"precio":600},{"id":"shots","nombre":"Shots variados","cantidad":45,"precio":850}]',
  precio = 313000,
  personas_min = 50,
  personas_max = 55
WHERE id = 'combo_gran_fiesta';
