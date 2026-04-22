import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getConferenciaPorEmbarque, getEmbarquesParaLider, saveDecisaoLider, reabrirConferencia } from '@/services/storage';
import type { Conferencia } from '@/types/conferencia';
import { ArrowLeft, Search, ShieldCheck, ShieldX, AlertTriangle, ClipboardList, LogOut, Package, ChevronLeft, RotateCcw } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import PageHeader from '@/components/PageHeader';
import { toast } from 'sonner';
import { usePolling } from '@/hooks/usePolling';

function getStatusBadge(status: string) {
  if (status === 'liberado_lider') return <Badge className="bg-success text-success-foreground">LIBERADO LÍDER</Badge>;
  if (status === 'bloqueado_lider') return <Badge className="bg-destructive text-destructive-foreground">BLOQUEADO LÍDER</Badge>;
  if (status === 'aprovado') return <Badge className="bg-success text-success-foreground">APROVADO</Badge>;
  if (status === 'bloqueado') return <Badge className="bg-destructive text-destructive-foreground">BLOQUEADO</Badge>;
  if (status === 'conferido') return <Badge className="bg-success text-success-foreground">CONFERIDO</Badge>;
  if (status === 'divergente') return <Badge className="bg-destructive text-destructive-foreground">DIVERGENTE</Badge>;
  return <Badge variant="secondary">{status.replace('_', ' ').toUpperCase()}</Badge>;
}

function getEtapaLabel(c: Conferencia) {
  if (['liberado_lider', 'bloqueado_lider', 'aprovado', 'bloqueado'].includes(c.status)) return 'Analisado';
  return 'Aguardando Líder';
}

export default function LiderPage() {
  const navigate = useNavigate();
  const { signOut, nome } = useAuth();
  const [embarque, setEmbarque] = useState('');
  const [conferencia, setConferencia] = useState<Conferencia | null>(null);
  const [embarques, setEmbarques] = useState<Conferencia[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);

  useEffect(() => {
    loadEmbarques();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  usePolling(() => loadEmbarques(true), 30000, !conferencia);

  const loadEmbarques = async (silent = false) => {
    if (!silent) setLoadingList(true);
    try {
      const data = await getEmbarquesParaLider();
      setEmbarques(data);
    } catch {
      if (!silent) toast.error('Erro ao carregar embarques.');
    } finally {
      if (!silent) setLoadingList(false);
    }
  };

  const selecionarEmbarque = (emb: Conferencia) => {
    setConferencia(emb);
  };

  const voltarParaLista = () => {
    setConferencia(null);
    loadEmbarques();
  };

  const buscar = async () => {
    if (!embarque.trim()) return;
    setLoading(true);
    try {
      const found = await getConferenciaPorEmbarque(embarque.trim());
      if (!found) { toast.error('Embarque não encontrado.'); return; }
      if (found.status === 'aguardando_conferencia') { toast.error('Este embarque ainda não foi conferido.'); return; }
      setConferencia(found);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao buscar embarque.');
    } finally {
      setLoading(false);
    }
  };

  const handleDecisao = async (decisao: 'liberado_lider' | 'bloqueado_lider') => {
    if (!conferencia) return;
    if (!nome) {
      toast.error('Sessão inválida. Faça login novamente.');
      return;
    }
    setLoading(true);
    try {
      console.log('[Lider] Salvando decisão:', { conferenciaId: conferencia.id, lider: nome, decisao, statusAtual: conferencia.status });
      await saveDecisaoLider(conferencia.id, nome, decisao);
      toast.success(decisao === 'liberado_lider' ? 'Embarque liberado! Encaminhado ao Fiscal.' : 'Embarque finalizado com divergência! Encaminhado ao Fiscal.');
      setConferencia(null);
      loadEmbarques();
    } catch (err: any) {
      console.error('[Lider] Erro ao salvar decisão:', err);
      toast.error(err.message || 'Erro ao salvar decisão.');
    } finally {
      setLoading(false);
    }
  };

  const handleReabrir = async () => {
    if (!conferencia) return;
    setLoading(true);
    try {
      await reabrirConferencia(conferencia.id);
      toast.success('Conferência reaberta! Tarefa devolvida ao Conferente.');
      setConferencia(null);
      loadEmbarques();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao reabrir conferência.');
    } finally {
      setLoading(false);
    }
  };

  const hasDivergencia = conferencia?.itensConferencia.some(i => i.status === 'divergente');
  const isAnalisado = ['liberado_lider', 'bloqueado_lider', 'aprovado', 'bloqueado'].includes(conferencia?.status || '');
  const formatDate = (d?: string) => d ? new Date(d).toLocaleString('pt-BR') : '-';
  const formatDateBR = (d?: string) => {
    if (!d) return '-';
    const [y, m, day] = d.split('-');
    if (y && m && day) return `${day}/${m}/${y}`;
    return d;
  };

  // Detail view
  if (conferencia) {
    return (
      <div className="min-h-screen bg-background p-4 max-w-6xl mx-auto">
        <PageHeader>
          <Button variant="ghost" size="icon" onClick={voltarParaLista}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Embarque {conferencia.numeroEmbarque}</h1>
            <p className="text-muted-foreground text-sm">Líder: {nome}</p>
          </div>
        </PageHeader>

        <Card className="mb-4">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div><span className="text-muted-foreground">Embarque:</span><p className="font-semibold">{conferencia.numeroEmbarque}</p></div>
              <div><span className="text-muted-foreground">Separador:</span><p className="font-semibold">{conferencia.separador}</p></div>
              <div><span className="text-muted-foreground">Conferente:</span><p className="font-semibold">{conferencia.conferente}</p></div>
              <div><span className="text-muted-foreground">Status:</span>{getStatusBadge(conferencia.status)}</div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-muted-foreground mt-4">
              <div>Separação: {formatDate(conferencia.dataSeparacao)}</div>
              <div>Conferência: {formatDate(conferencia.dataConferencia)}</div>
              {conferencia.dataLider && <div>Líder: {formatDate(conferencia.dataLider)}</div>}
            </div>
          </CardContent>
        </Card>

        {hasDivergencia && !isAnalisado && (
          <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-destructive/10 border border-destructive/30">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <span className="text-sm font-medium text-destructive">Divergências encontradas.</span>
          </div>
        )}

        <Card className="mb-4">
          <CardHeader><CardTitle className="text-lg">Painel Comparativo</CardTitle></CardHeader>
          <CardContent className="overflow-x-auto">
            {conferencia.itensSeparacao.map((sep, idx) => {
              const conf = conferencia.itensConferencia.find(c => c.itemSeparacaoId === sep.id);
              const fields = [
                { label: 'Código', sepVal: sep.codigoProduto, confVal: conf?.codigoProduto },
                { label: 'Descrição', sepVal: sep.descricaoProduto, confVal: conf?.descricaoProduto || sep.descricaoProduto },
                { label: 'Lote', sepVal: sep.lote, confVal: conf?.lote },
                { label: 'Data de Fabricação', sepVal: formatDateBR(sep.dataFabricacao), confVal: conf ? formatDateBR(conf.dataFabricacao) : undefined },
                { label: 'Data de Validade', sepVal: formatDateBR(sep.dataValidade), confVal: conf ? formatDateBR(conf.dataValidade) : undefined },
                { label: 'Tipo de Embalagem', sepVal: sep.tipoEmbalagem, confVal: conf?.tipoEmbalagem },
                { label: 'Qtde. de Pallets', sepVal: String(sep.quantidadePallets), confVal: conf ? String(conf.quantidadePallets) : undefined },
                { label: 'Quantidade', sepVal: String(sep.quantidade), confVal: conf ? String(conf.quantidade) : undefined },
              ];
              return (
                <div key={sep.id} className="mb-6 last:mb-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold">Item {idx + 1} — {sep.descricaoProduto}</span>
                    {conf && (conf.status === 'conferido'
                      ? <Badge className="bg-success text-success-foreground">Conferido</Badge>
                      : <Badge variant="destructive">Divergente</Badge>
                    )}
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-32">Campo</TableHead>
                        <TableHead>Separação</TableHead>
                        <TableHead>Conferência</TableHead>
                        <TableHead className="w-20">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fields.map(({ label, sepVal, confVal }) => {
                        const match = sepVal === confVal;
                        return (
                          <TableRow key={label} className={!match ? 'bg-destructive/5' : ''}>
                            <TableCell className="font-medium">{label}</TableCell>
                            <TableCell>{sepVal}</TableCell>
                            <TableCell className={!match ? 'text-destructive font-bold' : ''}>{confVal || '-'}</TableCell>
                            <TableCell>{match ? <span className="text-success text-lg">✓</span> : <span className="text-destructive text-lg">✗</span>}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {!isAnalisado && (
          <div className="grid grid-cols-1 gap-4">
            {hasDivergencia ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="h-16 text-lg font-semibold" disabled={loading}>
                    <ShieldX className="w-6 h-6 mr-2" /> Finalizar Expedição com Divergência
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Finalizar embarque com divergência?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Você está prestes a finalizar o embarque <strong>{conferencia.numeroEmbarque}</strong> com <strong>divergências</strong>. Esta ação será registrada e encaminhada ao Fiscal. Deseja continuar?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDecisao('bloqueado_lider')}>Sim, finalizar com divergência</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="h-16 text-lg font-semibold bg-success hover:bg-success/90 text-success-foreground" disabled={loading}>
                    <ShieldCheck className="w-6 h-6 mr-2" /> Liberar Embarque
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Liberar embarque?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Você está prestes a liberar o embarque <strong>{conferencia.numeroEmbarque}</strong> e encaminhá-lo ao Fiscal. Deseja continuar?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDecisao('liberado_lider')}>Sim, liberar</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        )}

        {isAnalisado && (
          <Card className="border-2 border-muted">
            <CardContent className="pt-6 text-center space-y-4">
              <div>
                <p className="text-lg font-semibold">
                  Decisão do líder: <Badge className={conferencia.status === 'liberado_lider' || conferencia.status === 'aprovado' ? 'bg-success text-success-foreground' : 'bg-destructive text-destructive-foreground'}>
                    {(conferencia.decisaoLider || conferencia.status).toUpperCase().replace('_', ' ')}
                  </Badge>
                </p>
                <p className="text-sm text-muted-foreground mt-1">Líder: {conferencia.lider} — {formatDate(conferencia.dataLider)}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {(['conferido', 'divergente', 'liberado_lider', 'bloqueado_lider', 'aprovado', 'bloqueado'].includes(conferencia.status)) && (
          <div className="mt-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full h-14 text-base font-semibold border-warning text-warning hover:bg-warning/10" disabled={loading}>
                  <RotateCcw className="w-5 h-5 mr-2" /> Reabrir Conferência
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reabrir conferência?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação devolve o embarque <strong>{conferencia.numeroEmbarque}</strong> para a etapa de <strong>Conferência</strong>. Os dados conferidos anteriormente serão apagados e o Conferente precisará refazer a conferência. Deseja continuar?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleReabrir}>Sim, reabrir</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>
    );
  }

  // List view
  return (
    <div className="min-h-screen bg-background p-4 max-w-6xl mx-auto">
      <PageHeader>
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Análise do Líder</h1>
          <p className="text-muted-foreground text-sm">Líder: {nome}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/meus-embarques')}>
            <ClipboardList className="w-4 h-4 mr-1" /> Meus Embarques
          </Button>
          <Button variant="ghost" size="sm" onClick={signOut} className="text-destructive">
            <LogOut className="w-4 h-4 mr-1" /> Sair
          </Button>
        </div>
      </PageHeader>

      {/* Search box */}
      <Card className="mb-4">
        <CardHeader><CardTitle className="text-sm text-muted-foreground">Buscar por número ou placa</CardTitle></CardHeader>
        <CardContent className="flex gap-3">
          <Input className="h-12 text-lg flex-1" placeholder="Número de Embarque ou Placa do Veículo" value={embarque} onChange={e => setEmbarque(e.target.value)} />
          <Button className="h-12 px-6" onClick={buscar} disabled={loading}>
            <Search className="w-5 h-5 mr-2" /> {loading ? 'Buscando...' : 'Buscar'}
          </Button>
        </CardContent>
      </Card>

      {/* Embarques list */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Embarques Disponíveis</CardTitle></CardHeader>
        <CardContent>
          {loadingList ? (
            <p className="text-center text-muted-foreground py-4">Carregando...</p>
          ) : embarques.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
              Nenhum embarque disponível para análise.
            </div>
          ) : (
            <div className="space-y-2">
              {embarques
                .filter(emb => {
                  const q = embarque.trim().toLowerCase();
                  return emb.numeroEmbarque.toLowerCase().includes(q) || (emb.placaVeiculo || '').toLowerCase().includes(q);
                })
                .map(emb => (
                <div
                  key={emb.id}
                  onClick={() => selecionarEmbarque(emb)}
                  className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-base">{emb.numeroEmbarque}</p>
                    <p className="text-xs text-muted-foreground">
                      Placa: {emb.placaVeiculo || '-'} • Separador: {emb.separador} • Conferente: {emb.conferente || '-'} • {new Date(emb.dataSeparacao).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Badge variant="secondary">{getEtapaLabel(emb)}</Badge>
                    {getStatusBadge(emb.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
