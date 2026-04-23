-- Bloquear criação de perfis com nome duplicado (case-insensitive) no nível do banco.
-- Executado dentro do trigger handle_new_user, que roda após cada signup em auth.users.
-- Se o nome já existir em profiles, o INSERT falha e o signup é abortado.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_nome text;
BEGIN
  v_nome := COALESCE(NEW.raw_user_meta_data->>'nome', 'Usuário');

  -- Verifica duplicidade case-insensitive
  IF EXISTS (
    SELECT 1 FROM public.profiles
    WHERE lower(nome) = lower(trim(v_nome))
  ) THEN
    RAISE EXCEPTION 'Já existe um usuário com este nome: %', v_nome
      USING ERRCODE = 'unique_violation';
  END IF;

  INSERT INTO public.profiles (id, nome, email_gerado)
  VALUES (
    NEW.id,
    trim(v_nome),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$function$;