import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Repeat } from 'lucide-react';

/**
 * Botão "Trocar perfil" — aparece apenas quando o usuário tem mais de uma role atribuída.
 * Limpa o perfil ativo e redireciona para a tela de seleção.
 */
export default function TrocarPerfilButton() {
  const navigate = useNavigate();
  const { perfis, clearPerfilAtivo } = useAuth();

  if (perfis.length <= 1) return null;

  const handleClick = () => {
    clearPerfilAtivo();
    navigate('/selecionar-perfil', { replace: true });
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleClick} className="text-primary">
      <Repeat className="w-4 h-4 mr-1" /> Trocar perfil
    </Button>
  );
}
