-- Drop existing permissive policies
DROP POLICY IF EXISTS "Authenticated users can insert conferencias" ON public.conferencias;
DROP POLICY IF EXISTS "Authenticated users can select conferencias" ON public.conferencias;
DROP POLICY IF EXISTS "Authenticated users can update conferencias" ON public.conferencias;

DROP POLICY IF EXISTS "Authenticated users can insert itens_separacao" ON public.itens_separacao;
DROP POLICY IF EXISTS "Authenticated users can select itens_separacao" ON public.itens_separacao;

DROP POLICY IF EXISTS "Authenticated users can insert itens_conferencia" ON public.itens_conferencia;
DROP POLICY IF EXISTS "Authenticated users can select itens_conferencia" ON public.itens_conferencia;

-- ===== conferencias =====
CREATE POLICY "Authenticated can read conferencias"
ON public.conferencias FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Separadores can insert conferencias"
ON public.conferencias FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'separador'));

CREATE POLICY "Conferentes can update during conferencia"
ON public.conferencias FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'conferente')
  AND status = 'aguardando_conferencia'
)
WITH CHECK (
  public.has_role(auth.uid(), 'conferente')
  AND status IN ('conferido', 'divergente')
);

CREATE POLICY "Fiscais can update during fiscal review"
ON public.conferencias FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'fiscal')
  AND status IN ('conferido', 'divergente')
)
WITH CHECK (
  public.has_role(auth.uid(), 'fiscal')
  AND status IN ('aprovado', 'bloqueado')
);

-- ===== itens_separacao =====
CREATE POLICY "Authenticated can read itens_separacao"
ON public.itens_separacao FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Separadores can insert itens_separacao"
ON public.itens_separacao FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'separador')
  AND EXISTS (
    SELECT 1 FROM public.conferencias c
    WHERE c.id = conferencia_id
      AND c.status = 'aguardando_conferencia'
  )
);

-- ===== itens_conferencia =====
CREATE POLICY "Authenticated can read itens_conferencia"
ON public.itens_conferencia FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Conferentes can insert itens_conferencia"
ON public.itens_conferencia FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'conferente')
  AND EXISTS (
    SELECT 1 FROM public.conferencias c
    WHERE c.id = conferencia_id
      AND c.status IN ('conferido', 'divergente', 'aguardando_conferencia')
  )
);