-- Apaga todos os papéis atribuídos
DELETE FROM public.user_roles;

-- Apaga todos os perfis
DELETE FROM public.profiles;

-- Apaga todos os usuários do sistema de autenticação
DELETE FROM auth.users;