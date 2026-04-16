import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import logoNitro from '@/assets/logo-nitro.jpg';
import { LogOut } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { user, perfil, perfilLoading, loading, signOut } = useAuth();

  useEffect(() => {
    if (!loading && !perfilLoading && user && perfil) {
      const nome = user.user_metadata?.nome?.split(' ')[0] || 'Usuário';
      sessionStorage.setItem('perfil', perfil);
      sessionStorage.setItem('nome', nome);
      navigate(`/${perfil}`, { replace: true });
    }
  }, [user, perfil, loading, perfilLoading, navigate]);

  if (loading || perfilLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  // User is logged in but has no role assigned
  if (user && !perfil) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={signOut} className="text-muted-foreground">
                <LogOut className="w-4 h-4 mr-1" /> Sair
              </Button>
            </div>
            <div className="mx-auto">
              <img src={logoNitro} alt="Nitro" className="h-28 object-contain mx-auto" />
            </div>
            <CardTitle className="text-xl font-bold">Perfil não configurado</CardTitle>
            <p className="text-muted-foreground text-sm">
              Olá, {user.user_metadata?.nome?.split(' ')[0] || 'Usuário'}! Seu perfil ainda não foi atribuído. 
              Entre em contato com o administrador ou crie uma nova conta.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" variant="outline" onClick={signOut}>
              Sair e criar nova conta
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="text-muted-foreground">Redirecionando...</p>
    </div>
  );
}
