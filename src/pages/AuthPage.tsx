import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, PlayCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import BrandLogo from '@/components/BrandLogo';
import { resetDemoData } from '@/services/storage';

export default function AuthPage() {
  const navigate = useNavigate();
  const { user, perfil, perfis, loginDemo } = useAuth();
  const [nome, setNome] = useState('Usuário Demo');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (perfil) navigate(`/${perfil}`, { replace: true });
    else if (perfis.length > 1) navigate('/selecionar-perfil', { replace: true });
  }, [user, perfil, perfis, navigate]);

  const entrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await loginDemo(nome);
    setLoading(false);
    toast.success('Modo demonstração iniciado.');
    navigate('/selecionar-perfil', { replace: true });
  };

  const reiniciar = () => {
    resetDemoData();
    toast.success('Dados fictícios restaurados.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="space-y-4">
          <div className="flex justify-center"><BrandLogo /></div>
          <div className="text-center space-y-2">
            <Badge variant="secondary">DEMO LOCAL • DADOS FICTÍCIOS</Badge>
            <CardTitle className="text-2xl">Formulário de Double Check</CardTitle>
            <p className="text-sm text-muted-foreground">Simule o fluxo operacional completo sem conta, banco externo ou credenciais.</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={entrar} className="space-y-4">
            <div className="space-y-2">
              <Label>Nome para a demonstração</Label>
              <Input className="h-12" value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Usuário Demo" />
            </div>
            <Button className="w-full h-12 text-base" disabled={loading}>
              <PlayCircle className="w-5 h-5 mr-2" /> {loading ? 'Iniciando...' : 'Entrar no modo demonstração'}
            </Button>
          </form>
          <Button variant="outline" className="w-full" onClick={reiniciar}>
            <RotateCcw className="w-4 h-4 mr-2" /> Restaurar dados de exemplo
          </Button>
          <p className="text-xs text-muted-foreground text-center">Os dados ficam somente no localStorage do navegador e podem ser apagados a qualquer momento.</p>
        </CardContent>
      </Card>
    </div>
  );
}
