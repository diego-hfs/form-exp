import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import type { Perfil } from '@/types/conferencia';

interface Props {
  children: React.ReactNode;
  allowedRole?: Perfil;
}

export default function ProtectedRoute({ children, allowedRole }: Props) {
  const { user, loading, perfil, perfilLoading } = useAuth();

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

  if (allowedRole && perfil !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
