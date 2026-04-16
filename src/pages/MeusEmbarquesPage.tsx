import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Package, Search } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { getConferenciasPorUsuario } from '@/services/storage';
import type { Conferencia } from '@/types/conferencia';

function getEtapa(c: Conferencia) {
  if (c.status === 'aprovado' || c.status === 'bloqueado') return 'Fiscal';
  if (c.status === 'conferido' || c.status === 'divergente') return 'Conferência';
  return 'Separação';
}

function getStatusLabel(c: Conferencia) {
  if (c.status === 'aprovado' || c.status === 'bloqueado') return 'Finalizado';
  return 'Em Processamento';
}

function getStatusVariant(c: Conferencia): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (c.status === 'aprovado') return 'default';
  if (c.status === 'bloqueado') return 'destructive';
  return 'secondary';
}

function getEtapaVariant(c: Conferencia): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (c.status === 'aprovado' || c.status === 'bloqueado') return 'outline';
  if (c.status === 'conferido' || c.status === 'divergente') return 'secondary';
  return 'default';
}

export default function MeusEmbarquesPage() {
  const navigate = useNavigate();
  const { nome, perfil: authPerfil } = useAuth();
  const perfil = authPerfil || 'separador';
  const [embarques, setEmbarques] = useState<Conferencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');

  const embarquesFiltrados = useMemo(
    () => embarques.filter(e => e.numeroEmbarque.toLowerCase().includes(busca.trim().toLowerCase())),
    [embarques, busca]
  );

  const backRoute = `/${perfil}`;
  const perfilLabel = perfil === 'conferente' ? 'Conferente' : perfil === 'fiscal' ? 'Fiscal' : 'Separador';

  useEffect(() => {
    const load = async (silent = false) => {
      if (!silent) setLoading(true);
      const data = await getConferenciasPorUsuario(nome, perfil);
      setEmbarques(data);
      if (!silent) setLoading(false);
    };
    load();
    const interval = setInterval(() => load(true), 10000);
    return () => clearInterval(interval);
  }, [nome, perfil]);

  const formatDate = (d?: string) => {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-background p-4 max-w-5xl mx-auto">
      <PageHeader>
        <Button variant="ghost" size="icon" onClick={() => navigate(backRoute)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Meus Embarques</h1>
          <p className="text-muted-foreground text-sm">{perfilLabel}: {nome}</p>
        </div>
      </PageHeader>

      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="h-11 pl-9"
              placeholder="Buscar por número de embarque..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <p className="text-center text-muted-foreground mt-8">Carregando...</p>
      ) : embarquesFiltrados.length === 0 ? (
        <Card className="mt-4">
          <CardContent className="py-8 text-center text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
            {embarques.length === 0 ? 'Nenhum embarque encontrado.' : 'Nenhum embarque corresponde à busca.'}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 mt-4">
          {embarquesFiltrados.map(emb => (
            <Card key={emb.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold">{emb.numeroEmbarque}</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant={getEtapaVariant(emb)}>{getEtapa(emb)}</Badge>
                    <Badge variant={getStatusVariant(emb)}>{getStatusLabel(emb)}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Separação:</span>
                    <p className="font-medium">{formatDate(emb.dataSeparacao)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Conferência:</span>
                    <p className="font-medium">{formatDate(emb.dataConferencia)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Fiscal:</span>
                    <p className="font-medium">{formatDate(emb.dataFiscal)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Itens:</span>
                    <p className="font-medium">{emb.itensSeparacao.length} produto(s)</p>
                  </div>
                </div>
                {emb.status === 'bloqueado' && (
                  <p className="text-destructive text-sm font-medium mt-2">⚠ Bloqueado pelo fiscal</p>
                )}
                {emb.status === 'divergente' && (
                  <p className="text-orange-600 text-sm font-medium mt-2">⚠ Divergência encontrada na conferência</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
