import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const navigate = useNavigate();
  const { user, perfil, perfilLoading, loading } = useAuth();

  useEffect(() => {
    if (!loading && !perfilLoading && user && perfil) {
      sessionStorage.setItem('perfil', perfil);
      sessionStorage.setItem('nome', user.user_metadata?.nome?.split(' ')[0] || 'Usuário');
      navigate(`/${perfil}`, { replace: true });
    }
  }, [user, perfil, loading, perfilLoading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="text-muted-foreground">Carregando...</p>
    </div>
  );
}
