-- Atualiza policy do Fiscal para reabrir devolvendo ao Líder (status conferido/divergente)
-- Em vez de devolver direto à conferência

DROP POLICY IF EXISTS "Fiscais can reopen conferencia" ON public.conferencias;

CREATE POLICY "Fiscais can reopen to lider"
ON public.conferencias
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'fiscal'::app_role)
  AND status = ANY (ARRAY['conferido'::text, 'divergente'::text, 'liberado_lider'::text, 'bloqueado_lider'::text, 'aprovado'::text, 'bloqueado'::text])
)
WITH CHECK (
  has_role(auth.uid(), 'fiscal'::app_role)
  AND status = ANY (ARRAY['conferido'::text, 'divergente'::text])
);
