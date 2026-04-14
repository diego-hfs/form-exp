
-- Add profile for the original user
INSERT INTO public.profiles (id, nome, email_gerado) 
VALUES ('fd2b5fc2-4441-4799-a6ce-698f20583a32', 'Diego Hernando', 'diegohernandodh@hotmail.com')
ON CONFLICT (id) DO NOTHING;

-- Delete duplicate profiles that have no matching user_roles
DELETE FROM public.profiles WHERE id IN ('ccfdf03f-bfcb-4d3e-a042-fe43a9c22899', '5e5242e5-e6e0-49ca-a07a-a1fadca7f8ac');
