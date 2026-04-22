import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { DatePickerBR } from '@/components/DatePickerBR';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { getConferenciaPorEmbarque, getEmbarquesParaConferente, saveConferenciaConferente } from '@/services/storage';
import type { Conferencia, ItemConferencia } from '@/types/conferencia';
import { ArrowLeft, Search, CheckCircle, XCircle, ClipboardList, LogOut, Package, ChevronLeft } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { toast } from 'sonner';
import { usePolling } from '@/hooks/usePolling';

const embalagensOptions = ['Caixa', 'Pallet', 'Saco', 'Tambor', 'Big Bag', 'Fardo', 'Engradado'];

export default function ConferentePage() {
  const navigate = useNavigate();
  const { signOut, nome } = useAuth();
  const [embarque, setEmbarque] = useState('');
  const [conferencia, setConferencia] = useState<Conferencia | null>(null);
  const [embarques, setEmbarques] = useState<Conferencia[]>([]);
  const [conferencias, setConferencias] = useState<Record<string, Partial<ItemConferencia>>>({});
  const [finalizado, setFinalizado] = useState(false);
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
      const data = await getEmbarquesParaConferente();
      setEmbarques(data);
    } catch {
      if (!silent) toast.error('Erro ao carregar embarques.');
    } finally {
      if (!silent) setLoadingList(false);
    }
  };

  const selecionarEmbarque = (emb: Conferencia) => {
    abrirConferencia(emb);
  };

  const abrirConferencia = (found: Conferencia) => {
    setConferencia(found);
    setFinalizado(false);
    const initial: Record<string, Partial<ItemConferencia>> = {};
    found.itensSeparacao.forEach(item => {
      initial[item.id] = {
        codigoProduto: '', descricaoProduto: '', lote: '', dataFabricacao: '', dataValidade: '',
        tipoEmbalagem: '', quantidadePallets: 0, quantidade: 0,
      };
    });
    setConferencias(initial);
  };

  const voltarParaLista = () => {
    setConferencia(null);
    setFinalizado(false);
    loadEmbarques();
  };

  const buscar = async () => {
    if (!embarque.trim()) return;
    setLoading(true);
    try {
      const found = await getConferenciaPorEmbarque(embarque.trim());
      if (!found) { toast.error('Embarque não encontrado.'); return; }
      if (found.status !== 'aguardando_conferencia') { toast.error('Este embarque já foi conferido.'); return; }
      abrirConferencia(found);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao buscar embarque.');
    } finally {
      setLoading(false);
    }
  };

  const updateConf = (itemId: string, field: string, value: string | number) => {
    setConferencias(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], [field]: value },
    }));
  };

  const compareItem = (itemId: string) => {
    if (!conferencia) return null;
    const sep = conferencia.itensSeparacao.find(i => i.id === itemId);
    const conf = conferencias[itemId];
    if (!sep || !conf) return null;
    return {
      codigoProduto: sep.codigoProduto === conf.codigoProduto,
      descricaoProduto: sep.descricaoProduto === conf.descricaoProduto,
      lote: sep.lote === conf.lote,
      dataFabricacao: sep.dataFabricacao === conf.dataFabricacao,
      dataValidade: sep.dataValidade === conf.dataValidade,
      tipoEmbalagem: sep.tipoEmbalagem === conf.tipoEmbalagem,
      quantidadePallets: sep.quantidadePallets === Number(conf.quantidadePallets),
      quantidade: sep.quantidade === Number(conf.quantidade),
    };
  };

  const isAllFilled = () => {
    return Object.values(conferencias).every(c =>
      c.codigoProduto && c.descricaoProduto && c.lote && c.dataFabricacao && c.dataValidade &&
      c.tipoEmbalagem && (c.quantidadePallets ?? 0) > 0 && (c.quantidade ?? 0) > 0
    );
  };

  const handleFinalizar = async () => {
    if (!conferencia || !isAllFilled()) {
      toast.error('Preencha todos os campos de conferência.');
      return;
    }
    setLoading(true);
    try {
      const itensConf: Omit<ItemConferencia, 'id'>[] = conferencia.itensSeparacao.map(sep => {
        const conf = conferencias[sep.id];
        const cmp = compareItem(sep.id)!;
        const allMatch = Object.values(cmp).every(Boolean);
        return {
          itemSeparacaoId: sep.id,
          codigoProduto: conf.codigoProduto || '',
          descricaoProduto: conf.descricaoProduto || '',
          lote: conf.lote || '',
          dataFabricacao: conf.dataFabricacao || '',
          dataValidade: conf.dataValidade || '',
          tipoEmbalagem: conf.tipoEmbalagem || '',
          quantidadePallets: Number(conf.quantidadePallets),
          quantidade: Number(conf.quantidade),
          status: allMatch ? 'conferido' as const : 'divergente' as const,
        };
      });

      const hasDivergencia = itensConf.some(i => i.status === 'divergente');
      const status = hasDivergencia ? 'divergente' as const : 'conferido' as const;

      await saveConferenciaConferente(conferencia.id, nome, itensConf, status);

      const updated = await getConferenciaPorEmbarque(conferencia.numeroEmbarque);
      if (updated) setConferencia(updated);
      setFinalizado(true);
      toast.success('Conferência finalizada!');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar conferência.');
    } finally {
      setLoading(false);
    }
  };

  // Detail view
  if (conferencia) {
    return (
      <div className="min-h-screen bg-background p-4 max-w-5xl mx-auto">
        <PageHeader>
          <Button variant="ghost" size="icon" onClick={voltarParaLista}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Embarque {conferencia.numeroEmbarque}</h1>
            <p className="text-muted-foreground text-sm">Conferente: {nome}</p>
          </div>
        </PageHeader>

        <Card className="mb-4">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Embarque: {conferencia.numeroEmbarque}</CardTitle>
              <Badge variant={conferencia.status === 'conferido' ? 'default' : conferencia.status === 'divergente' ? 'destructive' : 'secondary'}>
                {conferencia.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">Separador: {conferencia.separador}</p>
            {conferencia.placaVeiculo && (
              <p className="text-sm text-muted-foreground">Placa do Veículo: {conferencia.placaVeiculo}</p>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {conferencia.itensSeparacao.map((sep, idx) => {
              const cmp = finalizado ? compareItem(sep.id) : null;
              return (
                <div key={sep.id} className="border rounded-lg p-4 space-y-3 bg-muted/30">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-sm">Item {idx + 1} — {sep.descricaoProduto}</span>
                    {finalizado && cmp && (
                      Object.values(cmp).every(Boolean)
                        ? <Badge className="bg-success text-success-foreground"><CheckCircle className="w-3 h-3 mr-1" /> Conferido</Badge>
                        : <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Divergente</Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { label: 'Código do Produto', field: 'codigoProduto' },
                      { label: 'Descrição do Produto', field: 'descricaoProduto' },
                      { label: 'Lote', field: 'lote' },
                    ].map(({ label, field }) => (
                      <div key={field}>
                        <Label className={finalizado && cmp ? (cmp[field as keyof typeof cmp] ? 'text-success' : 'text-destructive font-bold') : ''}>
                          {label} *
                        </Label>
                        <Input
                          type="text"
                          className={`h-11 ${finalizado && cmp && !cmp[field as keyof typeof cmp] ? 'border-destructive border-2' : ''}`}
                          value={(conferencias[sep.id] as any)?.[field] || ''}
                          onChange={e => updateConf(sep.id, field, e.target.value)}
                          disabled={finalizado}
                        />
                        {finalizado && cmp && !cmp[field as keyof typeof cmp] && (
                          <p className="text-xs text-destructive mt-1">Esperado: {(sep as any)[field]}</p>
                        )}
                      </div>
                    ))}
                    {[
                      { label: 'Data de Fabricação', field: 'dataFabricacao' },
                      { label: 'Data de Validade', field: 'dataValidade' },
                    ].map(({ label, field }) => (
                      <div key={field}>
                        <Label className={finalizado && cmp ? (cmp[field as keyof typeof cmp] ? 'text-success' : 'text-destructive font-bold') : ''}>
                          {label} *
                        </Label>
                        <DatePickerBR
                          value={(conferencias[sep.id] as any)?.[field] || ''}
                          onChange={v => updateConf(sep.id, field, v)}
                          className={finalizado && cmp && !cmp[field as keyof typeof cmp] ? 'border-destructive border-2' : ''}
                        />
                        {finalizado && cmp && !cmp[field as keyof typeof cmp] && (
                          <p className="text-xs text-destructive mt-1">Esperado: {(sep as any)[field]}</p>
                        )}
                      </div>
                    ))}
                    <div>
                      <Label className={finalizado && cmp ? (cmp.tipoEmbalagem ? 'text-success' : 'text-destructive font-bold') : ''}>
                        Tipo de Embalagem *
                      </Label>
                      <Select
                        value={conferencias[sep.id]?.tipoEmbalagem || ''}
                        onValueChange={v => updateConf(sep.id, 'tipoEmbalagem', v)}
                        disabled={finalizado}
                      >
                        <SelectTrigger className={`h-11 ${finalizado && cmp && !cmp.tipoEmbalagem ? 'border-destructive border-2' : ''}`}>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {embalagensOptions.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      {finalizado && cmp && !cmp.tipoEmbalagem && (
                        <p className="text-xs text-destructive mt-1">Esperado: {sep.tipoEmbalagem}</p>
                      )}
                    </div>
                    {[
                      { label: 'Qtd. Pallets', field: 'quantidadePallets' },
                      { label: 'Quantidade', field: 'quantidade' },
                    ].map(({ label, field }) => (
                      <div key={field}>
                        <Label className={finalizado && cmp ? (cmp[field as keyof typeof cmp] ? 'text-success' : 'text-destructive font-bold') : ''}>
                          {label} *
                        </Label>
                        <Input
                          type="number"
                          min={0}
                          className={`h-11 ${finalizado && cmp && !cmp[field as keyof typeof cmp] ? 'border-destructive border-2' : ''}`}
                          value={(conferencias[sep.id] as any)?.[field] || ''}
                          onChange={e => updateConf(sep.id, field, Number(e.target.value))}
                          disabled={finalizado}
                        />
                        {finalizado && cmp && !cmp[field as keyof typeof cmp] && (
                          <p className="text-xs text-destructive mt-1">Esperado: {(sep as any)[field]}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {!finalizado && (
              <Button className="w-full h-14 text-lg font-semibold" onClick={handleFinalizar} disabled={!isAllFilled() || loading}>
                <CheckCircle className="w-5 h-5 mr-2" /> {loading ? 'Salvando...' : 'Finalizar Conferência'}
              </Button>
            )}

            {finalizado && (
              <Button className="w-full h-12" variant="outline" onClick={voltarParaLista}>
                <ChevronLeft className="w-4 h-4 mr-2" /> Voltar para lista
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // List view
  return (
    <div className="min-h-screen bg-background p-4 max-w-5xl mx-auto">
      <PageHeader>
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Conferência</h1>
          <p className="text-muted-foreground text-sm">Conferente: {nome}</p>
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

      <Card className="mb-4">
        <CardHeader><CardTitle className="text-sm text-muted-foreground">Buscar por número ou placa</CardTitle></CardHeader>
        <CardContent className="flex gap-3">
          <Input className="h-12 text-lg flex-1" placeholder="Número de Embarque ou Placa do Veículo" value={embarque} onChange={e => setEmbarque(e.target.value)} />
          <Button className="h-12 px-6" onClick={buscar} disabled={loading}>
            <Search className="w-5 h-5 mr-2" /> {loading ? 'Buscando...' : 'Buscar'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Embarques Disponíveis</CardTitle></CardHeader>
        <CardContent>
          {loadingList ? (
            <p className="text-center text-muted-foreground py-4">Carregando...</p>
          ) : embarques.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
              Nenhum embarque aguardando conferência.
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
                      Placa: {emb.placaVeiculo || '-'} • Separador: {emb.separador} • {new Date(emb.dataSeparacao).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <Badge variant="secondary">Aguardando Conferência</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
