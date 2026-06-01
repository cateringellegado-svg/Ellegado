-- Limpiar tokens de MP almacenados en DB (ahora solo vía env vars)
UPDATE configuracion SET mp_access_token = '' WHERE mp_access_token IS NOT NULL AND mp_access_token != '';
UPDATE configuracion SET mp_access_token_test = '' WHERE mp_access_token_test IS NOT NULL AND mp_access_token_test != '';
