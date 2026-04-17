DROP POLICY IF EXISTS "Conferentes can update during conferencia" ON public.conferencias;
DROP POLICY IF EXISTS "Fiscais can update during fiscal review" ON public.conferencias;
DROP POLICY IF EXISTS "Fiscais can reopen conferencia" ON public.conferencias;
DROP POLICY IF EXISTS "Conferentes can insert itens_conferencia" ON public.itens_conferencia;
DROP POLICY IF EXISTS "Fiscais can delete itens_conferencia on reopen" ON public.itens_conferencia;

CREATE POLICY "Conferentes can update during conferencia"
ON public.conferencias
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'conferente'::app_role) AND status = 'aguardando_conferencia')
WITH CHECK (has_role(auth.uid(), 'conferente'::app_role) AND status IN ('conferido', 'divergente'));

CREATE POLICY "Lideres can update during lider review"
ON public.conferencias
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'lider'::app_role) AND status IN ('conferido', 'divergente'))
WITH CHECK (has_role(auth.uid(), 'lider'::app_role) AND status IN ('liberado_lider', 'bloqueado_lider'));

CREATE POLICY "Lideres can reopen conferencia"
ON public.conferencias
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'lider'::app_role) AND status IN ('conferido', 'divergente', 'liberado_lider', 'bloqueado_lider', 'aprovado', 'bloqueado'))
WITH CHECK (has_role(auth.uid(), 'lider'::app_role) AND status = 'aguardando_conferencia');

CREATE POLICY "Fiscais can update during fiscal review"
ON public.conferencias
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'fiscal'::app_role) AND status IN ('liberado_lider', 'bloqueado_lider'))
WITH CHECK (has_role(auth.uid(), 'fiscal'::app_role) AND status IN ('aprovado', 'bloqueado'));

CREATE POLICY "Fiscais can reopen conferencia"
ON public.conferencias
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'fiscal'::app_role) AND status IN ('conferido', 'divergente', 'liberado_lider', 'bloqueado_lider', 'aprovado', 'bloqueado'))
WITH CHECK (has_role(auth.uid(), 'fiscal'::app_role) AND status = 'aguardando_conferencia');

CREATE POLICY "Conferentes can insert itens_conferencia"
ON public.itens_conferencia
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'conferente'::app_role)
  AND EXISTS (
    SELECT 1 FROM public.conferencias c
    WHERE c.id = itens_conferencia.conferencia_id
      AND c.status IN ('conferido', 'divergente', 'aguardando_conferencia')
  )
);

CREATE POLICY "Lideres and Fiscais can delete itens_conferencia on reopen"
ON public.itens_conferencia
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'fiscal'::app_role) OR has_role(auth.uid(), 'lider'::app_role));
