import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import type { Perfil } from '@/types/conferencia';

interface Props {
  children: React.ReactNode;
  allowedRole?: Perfil;
}

export default function ProtectedRoute({ children, allowedRole }: Props) {
  const { user, loading, perfil, perfis, perfilLoading } = useAuth();

  if (loading || perfilLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Usuário tem múltiplos perfis mas ainda não escolheu — manda para seletor
  if (perfis.length > 1 && !perfil) {
    return <Navigate to="/selecionar-perfil" replace />;
  }

  if (allowedRole && !perfis.includes(allowedRole)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

