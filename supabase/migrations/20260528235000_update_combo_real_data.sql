-- Migration: Update combos with real data from Sheet 4
-- Replaces placeholder combo data with actual business data

UPDATE combos SET
  descripcion = 'Hamburguesas, empanadas, canapés, sándwiches de miga, conitos y fosforitos. Ideal para grupos de 10 a 15 personas.',
  items_json = '[{"id":"mini_hamburguesas","nombre":"Mini Hamburguesas","cantidad":50,"precio":760},{"id":"mini_empanadas","nombre":"Mini Empanadas","cantidad":50,"precio":400},{"id":"canapes","nombre":"Canapés","cantidad":50,"precio":500},{"id":"sandwich_miga","nombre":"Mini Sándwich de Miga","cantidad":50,"precio":600},{"id":"mini_conitos","nombre":"Mini Conitos","cantidad":50,"precio":1440},{"id":"fosforitos","nombre":"Fosforitos","cantidad":50,"precio":460}]',
  precio = 75400,
  personas_min = 10,
  personas_max = 15
WHERE id = 'combo_clasico';

UPDATE combos SET
  descripcion = 'Pizzas, tapaditos, conitos, salchichas, canapés, empanadas y fosforitos. Perfecto para 20 a 25 personas.',
  items_json = '[{"id":"mini_pizzas","nombre":"Mini Pizzas","cantidad":50,"precio":560},{"id":"tapaditos","nombre":"Tapaditos","cantidad":50,"precio":600},{"id":"mini_conitos","nombre":"Mini Conitos","cantidad":50,"precio":1440},{"id":"salchichas","nombre":"Salchichas Gourmet","cantidad":50,"precio":500},{"id":"canapes","nombre":"Canapés","cantidad":50,"precio":500},{"id":"mini_empanadas","nombre":"Mini Empanadas","cantidad":50,"precio":400},{"id":"fosforitos","nombre":"Fosforitos","cantidad":50,"precio":460}]',
  precio = 119400,
  personas_min = 20,
  personas_max = 25
WHERE id = 'combo_dulce';

UPDATE combos SET
  descripcion = 'Canapés, hamburguesas, empanadas, sopaipillas, sándwiches de miga, nuggets y fosforitos. Para 30 a 35 personas.',
  items_json = '[{"id":"canapes","nombre":"Canapés","cantidad":50,"precio":500},{"id":"mini_hamburguesas","nombre":"Mini Hamburguesas","cantidad":50,"precio":760},{"id":"mini_empanadas","nombre":"Mini Empanadas","cantidad":50,"precio":400},{"id":"sopaipillas","nombre":"Mini Sopaipillas con Pebre","cantidad":50,"precio":400},{"id":"sandwich_miga","nombre":"Mini Sándwich de Miga","cantidad":50,"precio":600},{"id":"nuggets","nombre":"Nuggets de Pollo","cantidad":50,"precio":460},{"id":"fosforitos","nombre":"Fosforitos","cantidad":50,"precio":460}]',
  precio = 156300,
  personas_min = 30,
  personas_max = 35
WHERE id = 'combo_ejecutivo';

UPDATE combos SET
  descripcion = 'Conitos, canapés, sándwiches de miga, pizzas, salchichas, empanadas, fosforitos y hamburguesas. Para 40 a 45 personas.',
  items_json = '[{"id":"mini_conitos","nombre":"Mini Conitos","cantidad":50,"precio":1440},{"id":"canapes","nombre":"Canapés","cantidad":50,"precio":500},{"id":"sandwich_miga","nombre":"Mini Sándwich de Miga","cantidad":50,"precio":600},{"id":"mini_pizzas","nombre":"Mini Pizzas","cantidad":50,"precio":560},{"id":"salchichas","nombre":"Salchichas Gourmet","cantidad":50,"precio":500},{"id":"mini_empanadas","nombre":"Mini Empanadas","cantidad":50,"precio":400},{"id":"fosforitos","nombre":"Fosforitos","cantidad":50,"precio":460},{"id":"mini_hamburguesas","nombre":"Mini Hamburguesas","cantidad":50,"precio":760}]',
  precio = 215200,
  personas_min = 40,
  personas_max = 45
WHERE id = 'combo_premium';

UPDATE combos SET
  descripcion = 'Hamburguesas, tapaditos, canapés, fosforitos, nuggets, salchichas, empanadas, sándwiches de miga y shots variados. Nuestra propuesta más completa para 50 a 55 personas.',
  items_json = '[{"id":"mini_hamburguesas","nombre":"Mini Hamburguesas","cantidad":50,"precio":760},{"id":"tapaditos","nombre":"Tapaditos","cantidad":50,"precio":600},{"id":"canapes","nombre":"Canapés","cantidad":50,"precio":500},{"id":"fosforitos","nombre":"Fosforitos","cantidad":50,"precio":460},{"id":"nuggets","nombre":"Nuggets de Pollo","cantidad":50,"precio":460},{"id":"salchichas","nombre":"Salchichas Gourmet","cantidad":50,"precio":500},{"id":"mini_empanadas","nombre":"Mini Empanadas","cantidad":50,"precio":400},{"id":"sandwich_miga","nombre":"Mini Sándwich de Miga","cantidad":50,"precio":600},{"id":"shots","nombre":"Shots variados","cantidad":50,"precio":850}]',
  precio = 313000,
  personas_min = 50,
  personas_max = 55
WHERE id = 'combo_gran_fiesta';
