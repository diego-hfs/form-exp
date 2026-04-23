-- 1. Adiciona a coluna nome em user_roles
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS nome text;

-- 2. Preenche os registros existentes com o nome de profiles
UPDATE public.user_roles ur
SET nome = p.nome
FROM public.profiles p
WHERE p.id = ur.user_id
  AND ur.nome IS NULL;

-- 3. Função do trigger: preenche o nome a partir de profiles
CREATE OR REPLACE FUNCTION public.set_user_role_nome()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  SELECT p.nome INTO NEW.nome
  FROM public.profiles p
  WHERE p.id = NEW.user_id;
  RETURN NEW;
END;
$$;

-- 4. Cria o trigger que dispara antes de inserir/atualizar em user_roles
DROP TRIGGER IF EXISTS trg_set_user_role_nome ON public.user_roles;
CREATE TRIGGER trg_set_user_role_nome
BEFORE INSERT OR UPDATE OF user_id ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.set_user_role_nome();