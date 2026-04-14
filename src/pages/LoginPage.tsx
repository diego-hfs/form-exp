import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Perfil } from '@/types/conferencia';
import { PackageCheck, LogOut } from 'lucide-react';
import logoNitro from '@/assets/logo-nitro.jpg';
import { useAuth } from '@/hooks/useAuth';

const separadores = ['Diego', 'Rodolfo', 'Manoel'];
const conferentes = ['Leonardo Bricio', 'Fabricio Gabriel', 'Hugo'];

export default function LoginPage() {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const [perfil, setPerfil] = useState<Perfil | ''>('');
  const [nome, setNome] = useState('');
  const [fiscalNome, setFiscalNome] = useState('');

  const nomes = perfil === 'separador' ? separadores : perfil === 'conferente' ? conferentes : [];

  const handleEntrar = () => {
    const finalNome = perfil === 'fiscal' ? fiscalNome : nome;
    if (!perfil || !finalNome) return;
    sessionStorage.setItem('perfil', perfil);
    sessionStorage.setItem('nome', finalNome);
    navigate(`/${perfil}`);
  };

  const isValid = perfil && (perfil === 'fiscal' ? fiscalNome.trim() : nome);

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
            <img src={logoNitro} alt="Nitro" className="h-16 object-contain mx-auto" />
          </div>
          <CardTitle className="text-2xl font-bold">Conferência de Expedição</CardTitle>
          <p className="text-muted-foreground text-sm">Selecione seu perfil para continuar</p>
          {user && <p className="text-muted-foreground text-xs">{user.email}</p>}
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-3 gap-2">
            {(['separador', 'conferente', 'fiscal'] as Perfil[]).map((p) => (
              <Button
                key={p}
                variant={perfil === p ? 'default' : 'outline'}
                className="h-14 text-sm font-semibold capitalize"
                onClick={() => { setPerfil(p); setNome(''); setFiscalNome(''); }}
              >
                {p}
              </Button>
            ))}
          </div>

          {perfil && perfil !== 'fiscal' && (
            <div className="space-y-2">
              <Label>Nome</Label>
              <Select value={nome} onValueChange={setNome}>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Selecione seu nome" />
                </SelectTrigger>
                <SelectContent>
                  {nomes.map(n => (
                    <SelectItem key={n} value={n}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {perfil === 'fiscal' && (
            <div className="space-y-2">
              <Label>Nome do Fiscal</Label>
              <Input
                className="h-12 text-base"
                placeholder="Digite seu nome"
                value={fiscalNome}
                onChange={e => setFiscalNome(e.target.value)}
              />
            </div>
          )}

          <Button
            className="w-full h-14 text-lg font-semibold"
            disabled={!isValid}
            onClick={handleEntrar}
          >
            Entrar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
