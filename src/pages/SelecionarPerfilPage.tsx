import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Boxes, ClipboardCheck, ShieldCheck, UserCog, LogOut } from 'lucide-react';
import logoNitro from '@/assets/logo-nitro.png';
import type { Perfil } from '@/types/conferencia';

const PERFIL_INFO: Record<Perfil, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  separador: { label: 'Separador', icon: Boxes, color: 'text-blue-600' },
  conferente: { label: 'Conferente', icon: ClipboardCheck, color: 'text-green-600' },
  lider: { label: 'Líder', icon: UserCog, color: 'text-orange-600' },
  fiscal: { label: 'Fiscal', icon: ShieldCheck, color: 'text-purple-600' },
};

export default function SelecionarPerfilPage() {
  const navigate = useNavigate();
  const { perfis, setPerfilAtivo, signOut, nome } = useAuth();

  const escolher = (p: Perfil) => {
    setPerfilAtivo(p);
    navigate(`/${p}`, { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto">
            <img src={logoNitro} alt="Nitro" className="h-32 object-contain mx-auto" />
          </div>
          <CardTitle className="text-xl font-bold">Olá, {nome}!</CardTitle>
          <p className="text-muted-foreground text-sm">Selecione o perfil que deseja usar agora</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {perfis.map((p) => {
            const info = PERFIL_INFO[p];
            const Icon = info.icon;
            return (
              <Button
                key={p}
                variant="outline"
                className="w-full h-16 justify-start text-base"
                onClick={() => escolher(p)}
              >
                <Icon className={`w-6 h-6 mr-3 ${info.color}`} />
                {info.label}
              </Button>
            );
          })}
          <Button variant="ghost" className="w-full text-muted-foreground mt-4" onClick={signOut}>
            <LogOut className="w-4 h-4 mr-1" /> Sair
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
