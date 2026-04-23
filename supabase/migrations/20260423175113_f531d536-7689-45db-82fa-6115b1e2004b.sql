-- Cria uma view que junta user_roles com profiles, mostrando o nome do usuário
-- associado a cada role. Útil para visualização no painel do banco de dados.

CREATE OR REPLACE VIEW public.user_roles_com_nome
WITH (security_invoker = true)
AS
SELECT 
  ur.id,
  ur.user_id,
  p.nome AS nome_usuario,
  ur.role
FROM public.user_roles ur
LEFT JOIN public.profiles p ON p.id = ur.user_id
ORDER BY p.nome;

GRANT SELECT ON public.user_roles_com_nome TO authenticated;