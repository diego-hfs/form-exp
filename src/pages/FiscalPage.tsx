import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getConferenciaPorEmbarque, saveConferencia } from '@/services/storage';
import type { Conferencia } from '@/types/conferencia';
import { ArrowLeft, Search, ShieldCheck, ShieldX, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function FiscalPage() {
  const navigate = useNavigate();
  const nome = sessionStorage.getItem('nome') || '';
  const [embarque, setEmbarque] = useState('');
  const [conferencia, setConferencia] = useState<Conferencia | null>(null);

  const buscar = () => {
    const found = getConferenciaPorEmbarque(embarque.trim());
    if (!found) {
      toast.error('Embarque não encontrado.');
      return;
    }
    if (found.status === 'aguardando_conferencia') {
      toast.error('Este embarque ainda não foi conferido.');
      return;
    }
    if (found.status === 'aprovado' || found.status === 'bloqueado') {
      setConferencia(found);
      return;
    }
    setConferencia(found);
  };

  const handleDecisao = (decisao: 'aprovado' | 'bloqueado') => {
    if (!conferencia) return;
    const updated: Conferencia = {
      ...conferencia,
      fiscal: nome,
      status: decisao,
      decisaoFiscal: decisao,
      dataFiscal: new Date().toISOString(),
    };
    saveConferencia(updated);
    setConferencia(updated);
    toast.success(decisao === 'aprovado' ? 'Expedição aprovada!' : 'Expedição bloqueada!');
  };

  const hasDivergencia = conferencia?.itensConferencia.some(i => i.status === 'divergente');
  const isFinalizado = conferencia?.status === 'aprovado' || conferencia?.status === 'bloqueado';

  const formatDate = (d?: string) => d ? new Date(d).toLocaleString('pt-BR') : '-';

  return (
    <div className="min-h-screen bg-background p-4 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Validação Fiscal</h1>
          <p className="text-muted-foreground text-sm">Fiscal: {nome}</p>
        </div>
      </div>

      <Card className="mb-4">
        <CardContent className="pt-6 flex gap-3">
          <Input className="h-12 text-lg flex-1" placeholder="Número de Embarque" value={embarque} onChange={e => setEmbarque(e.target.value)} />
          <Button className="h-12 px-6" onClick={buscar}><Search className="w-5 h-5 mr-2" /> Buscar</Button>
        </CardContent>
      </Card>

      {conferencia && (
        <>
          {/* Resumo */}
          <Card className="mb-4">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div><span className="text-muted-foreground">Embarque:</span><p className="font-semibold">{conferencia.numeroEmbarque}</p></div>
                <div><span className="text-muted-foreground">Separador:</span><p className="font-semibold">{conferencia.separador}</p></div>
                <div><span className="text-muted-foreground">Conferente:</span><p className="font-semibold">{conferencia.conferente}</p></div>
                <div><span className="text-muted-foreground">Status:</span>
                  <Badge className={
                    conferencia.status === 'aprovado' ? 'bg-success text-success-foreground' :
                    conferencia.status === 'bloqueado' ? 'bg-destructive text-destructive-foreground' :
                    conferencia.status === 'conferido' ? 'bg-success text-success-foreground' :
                    'bg-destructive text-destructive-foreground'
                  }>
                    {conferencia.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-muted-foreground mt-4">
                <div>Separação: {formatDate(conferencia.dataSeparacao)}</div>
                <div>Conferência: {formatDate(conferencia.dataConferencia)}</div>
                {conferencia.dataFiscal && <div>Fiscal: {formatDate(conferencia.dataFiscal)}</div>}
              </div>
            </CardContent>
          </Card>

          {hasDivergencia && !isFinalizado && (
            <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-destructive/10 border border-destructive/30">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <span className="text-sm font-medium text-destructive">Divergências encontradas. Recomendado: Bloquear expedição.</span>
            </div>
          )}

          {/* Painel comparativo */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg">Painel Comparativo</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {conferencia.itensSeparacao.map((sep, idx) => {
                const conf = conferencia.itensConferencia.find(c => c.itemSeparacaoId === sep.id);
                const fields = [
                  { label: 'Código', sepVal: sep.codigoProduto, confVal: conf?.codigoProduto },
                  { label: 'Lote', sepVal: sep.lote, confVal: conf?.lote },
                  { label: 'Fabricação', sepVal: sep.dataFabricacao, confVal: conf?.dataFabricacao },
                  { label: 'Validade', sepVal: sep.dataValidade, confVal: conf?.dataValidade },
                  { label: 'Embalagem', sepVal: sep.tipoEmbalagem, confVal: conf?.tipoEmbalagem },
                  { label: 'Pallets', sepVal: String(sep.quantidadePallets), confVal: String(conf?.quantidadePallets) },
                  { label: 'Quantidade', sepVal: String(sep.quantidade), confVal: String(conf?.quantidade) },
                ];

                return (
                  <div key={sep.id} className="mb-6 last:mb-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">Item {idx + 1} — {sep.descricaoProduto}</span>
                      {conf && (
                        conf.status === 'conferido'
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
                              <TableCell>
                                {match
                                  ? <span className="text-success text-lg">✓</span>
                                  : <span className="text-destructive text-lg">✗</span>
                                }
                              </TableCell>
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

          {/* Ações do fiscal */}
          {!isFinalizado && (
            <div className="grid grid-cols-2 gap-4">
              <Button
                className="h-16 text-lg font-semibold bg-success hover:bg-success/90 text-success-foreground"
                onClick={() => handleDecisao('aprovado')}
              >
                <ShieldCheck className="w-6 h-6 mr-2" /> Aprovar Expedição
              </Button>
              <Button
                variant="destructive"
                className="h-16 text-lg font-semibold"
                onClick={() => handleDecisao('bloqueado')}
              >
                <ShieldX className="w-6 h-6 mr-2" /> Bloquear Expedição
              </Button>
            </div>
          )}

          {isFinalizado && (
            <Card className="border-2 border-muted">
              <CardContent className="pt-6 text-center">
                <p className="text-lg font-semibold">
                  Decisão final: <Badge className={conferencia.status === 'aprovado' ? 'bg-success text-success-foreground' : 'bg-destructive text-destructive-foreground'}>
                    {conferencia.status.toUpperCase()}
                  </Badge>
                </p>
                <p className="text-sm text-muted-foreground mt-1">Fiscal: {conferencia.fiscal} — {formatDate(conferencia.dataFiscal)}</p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
