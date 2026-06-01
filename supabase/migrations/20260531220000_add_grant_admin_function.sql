-- grant_admin_role: actualiza raw_user_meta_data.role para otorgar acceso admin
-- La app (admin/login/page.tsx:35) valida: currentUser?.user_metadata?.role !== "admin"
-- auth.users.role (columna interna) NO es lo mismo que raw_user_meta_data->>'role'.
-- Esta función es la única forma correcta de escalar privilegios.

CREATE OR REPLACE FUNCTION public.grant_admin_role(target_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  target_id UUID;
  current_meta JSONB;
  updated_meta JSONB;
BEGIN
  SELECT id, raw_user_meta_data
  INTO target_id, current_meta
  FROM auth.users
  WHERE email = target_email;

  IF target_id IS NULL THEN
    RETURN 'ERROR: usuario con email ' || target_email || ' no encontrado en auth.users';
  END IF;

  updated_meta := jsonb_set(
    COALESCE(current_meta, '{}'::jsonb),
    '{role}',
    '"admin"'
  );

  UPDATE auth.users
  SET raw_user_meta_data = updated_meta
  WHERE id = target_id;

  RETURN 'OK: role=admin asignado a ' || target_email || '. El usuario debe cerrar sesión y volver a iniciarla para que el JWT se genere con el nuevo claim.';
END;
$$;

COMMENT ON FUNCTION public.grant_admin_role IS 'Uso: SELECT public.grant_admin_role(''email@ejemplo.com'');';
