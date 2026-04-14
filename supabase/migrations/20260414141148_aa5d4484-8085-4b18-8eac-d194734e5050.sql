
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('separador', 'conferente', 'fiscal');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Users can read their own roles
CREATE POLICY "Users can read own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Drop old permissive policies
DROP POLICY IF EXISTS "Allow full access to conferencias" ON public.conferencias;
DROP POLICY IF EXISTS "Allow full access to itens_separacao" ON public.itens_separacao;
DROP POLICY IF EXISTS "Allow full access to itens_conferencia" ON public.itens_conferencia;

-- conferencias: authenticated users can read all, insert/update based on role context
CREATE POLICY "Authenticated users can select conferencias"
  ON public.conferencias FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert conferencias"
  ON public.conferencias FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update conferencias"
  ON public.conferencias FOR UPDATE
  TO authenticated
  USING (true);

-- itens_separacao: authenticated users only
CREATE POLICY "Authenticated users can select itens_separacao"
  ON public.itens_separacao FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert itens_separacao"
  ON public.itens_separacao FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- itens_conferencia: authenticated users only
CREATE POLICY "Authenticated users can select itens_conferencia"
  ON public.itens_conferencia FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert itens_conferencia"
  ON public.itens_conferencia FOR INSERT
  TO authenticated
  WITH CHECK (true);
