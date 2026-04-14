import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import logoNitro from '@/assets/logo-nitro.jpg';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import type { Perfil } from '@/types/conferencia';

export default function AuthPage() {
  const navigate = useNavigate();
  const { user, perfil } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [nome, setNome] = useState('');
  const [password, setPassword] = useState('');
  const [selectedPerfil, setSelectedPerfil] = useState<Perfil | ''>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && perfil) navigate(`/${perfil}`, { replace: true });
  }, [user, perfil, navigate]);

  const gerarEmail = (nome: string) => {
    const slug = nome.trim().toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '');
    return `${slug}.${Date.now()}@interno.app`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !password.trim()) return;

    setLoading(true);
    try {
      if (isLogin) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('email_gerado')
          .ilike('nome', nome.trim())
          .maybeSingle();

        if (!profile) {
          toast.error('Usuário não encontrado. Verifique o nome.');
          setLoading(false);
          return;
        }

        const { error } = await supabase.auth.signInWithPassword({
          email: profile.email_gerado,
          password,
        });
        if (error) throw error;
        toast.success('Login realizado com sucesso!');
      } else {
        if (!selectedPerfil) {
          toast.error('Selecione um perfil.');
          setLoading(false);
          return;
        }

        const emailGerado = gerarEmail(nome);
        const { data, error } = await supabase.auth.signUp({
          email: emailGerado,
          password,
          options: { data: { nome: nome.trim() } },
        });
        if (error) throw error;

        if (data.user) {
          await supabase.from('profiles').insert({
            id: data.user.id,
            nome: nome.trim(),
            email_gerado: emailGerado,
          });

          await supabase.from('user_roles').insert({
            user_id: data.user.id,
            role: selectedPerfil,
          });
        }

        toast.success('Conta criada com sucesso!');
      }
    } catch (err: any) {
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
            <img src={logoNitro} alt="Nitro" className="h-16 object-contain mx-auto" />
          </div>
          <CardTitle className="text-2xl font-bold">Conferência de Expedição</CardTitle>
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

            {!isLogin && (
              <div className="space-y-2">
                <Label>Perfil</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(['separador', 'conferente', 'fiscal'] as Perfil[]).map((p) => (
                    <Button
                      key={p}
                      type="button"
                      variant={selectedPerfil === p ? 'default' : 'outline'}
                      className="h-12 text-sm font-semibold capitalize"
                      onClick={() => setSelectedPerfil(p)}
                    >
                      {p}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <Button type="submit" className="w-full h-14 text-lg font-semibold" disabled={loading}>
              {loading ? 'Aguarde...' : isLogin ? 'Entrar' : 'Criar Conta'}
            </Button>
          </form>
          <div className="text-center mt-4">
            <button
              type="button"
              className="text-sm text-primary hover:underline"
              onClick={() => { setIsLogin(!isLogin); setSelectedPerfil(''); }}
            >
              {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça login'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
