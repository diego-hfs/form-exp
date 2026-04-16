import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import logoNitro from '@/assets/logo-nitro.png';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';


export default function AuthPage() {
  const navigate = useNavigate();
  const { user, perfil, authorizeTab, resetTabAuthorization } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && perfil) navigate(`/${perfil}`, { replace: true });
  }, [user, perfil, navigate]);

  useEffect(() => {
    resetTabAuthorization();
  }, [resetTabAuthorization]);

  const gerarEmail = (nome: string) => {
    const slug = nome.trim().toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '');
    return `${slug}.${Date.now()}@interno.app`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !password.trim()) return;

    setLoading(true);
    try {
      resetTabAuthorization();

      if (isLogin) {
        // Tentar buscar pelo nome no profiles
        const { data: profile } = await supabase
          .from('profiles')
          .select('email_gerado')
          .ilike('nome', nome.trim())
          .maybeSingle();

        if (!profile) {
          resetTabAuthorization();
          toast.error('Usuário não encontrado. Verifique o nome.');
          setLoading(false);
          return;
        }

        const { error } = await supabase.auth.signInWithPassword({
          email: profile.email_gerado,
          password,
        });
        if (error) throw error;
        await authorizeTab();
        toast.success('Login realizado com sucesso!');
      } else {
        // Usar e-mail informado ou gerar um automático
        const emailFinal = email.trim() || gerarEmail(nome);

        const { data, error } = await supabase.auth.signUp({
          email: emailFinal,
          password,
          options: { data: { nome: nome.trim() } },
        });
        if (error) throw error;

        // Profile is now auto-created by database trigger

        // Deslogar após cadastro para voltar à tela de login
        await supabase.auth.signOut();
        resetTabAuthorization();
        toast.success('Conta criada! Aguarde o administrador atribuir seu perfil.');
        setIsLogin(true);
        setNome('');
        setEmail('');
        setPassword('');
      }
    } catch (err: any) {
      resetTabAuthorization();
      toast.error(err.message || 'Erro na autenticação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto">
            <img src={logoNitro} alt="Nitro" className="h-28 object-contain mx-auto" />
          </div>
          <CardTitle className="text-2xl font-bold">Formulário Conferência de Expedição</CardTitle>
          <p className="text-muted-foreground text-sm">
            {isLogin ? 'Faça login para continuar' : 'Crie sua conta'}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>{isLogin ? 'Nome de usuário' : 'Nome completo'}</Label>
              <Input
                type="text"
                className="h-12 text-base"
                placeholder={isLogin ? 'Digite seu nome' : 'Seu nome completo'}
                value={nome}
                onChange={e => setNome(e.target.value)}
                required
              />
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label>E-mail <span className="text-muted-foreground text-xs">(opcional)</span></Label>
                <Input
                  type="email"
                  className="h-12 text-base"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Senha</Label>
              <Input
                type="password"
                className="h-12 text-base"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>


            <Button type="submit" className="w-full h-14 text-lg font-semibold" disabled={loading}>
              {loading ? 'Aguarde...' : isLogin ? 'Entrar' : 'Criar Conta'}
            </Button>
          </form>
          <div className="text-center mt-4">
            <button
              type="button"
              className="text-sm text-primary hover:underline"
              onClick={() => { setIsLogin(!isLogin); setEmail(''); }}
            >
              {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça login'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
