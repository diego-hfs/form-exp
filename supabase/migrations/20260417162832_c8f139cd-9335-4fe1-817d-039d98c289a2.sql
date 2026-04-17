-- Permitir Fiscal reabrir conferência: status finais → aguardando_conferencia
CREATE POLICY "Fiscais can reopen conferencia"
ON public.conferencias FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'fiscal')
  AND status IN ('conferido', 'divergente', 'aprovado', 'bloqueado')
)
WITH CHECK (
  public.has_role(auth.uid(), 'fiscal')
  AND status = 'aguardando_conferencia'
);

-- Permitir Fiscal apagar itens de conferência ao reabrir
CREATE POLICY "Fiscais can delete itens_conferencia on reopen"
ON public.itens_conferencia FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'fiscal'));