import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { RotateCcw, Download, Printer } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { reabrirConferencia, reabrirParaLider } from '@/services/storage';
import { gerarEmbarquePdf } from '@/lib/embarquePdf';
import { toast } from 'sonner';
import type { Conferencia } from '@/types/conferencia';

interface Props {
  embarque: Conferencia | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReaberto?: () => void;
}

function formatDateTime(d?: string) {
  if (!d) return '-';
  return new Date(d).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatDateBR(d?: string) {
  if (!d) return '-';
  const [y, m, day] = d.split('-');
  if (y && m && day) return `${day}/${m}/${y}`;
  return d;
}

function getStatusBadge(status: string) {
  if (status === 'aprovado') return <Badge className="bg-success text-success-foreground">APROVADO</Badge>;
  if (status === 'bloqueado') return <Badge className="bg-destructive text-destructive-foreground">BLOQUEADO</Badge>;
  if (status === 'conferido') return <Badge className="bg-success text-success-foreground">CONFERIDO</Badge>;
  if (status === 'divergente') return <Badge className="bg-destructive text-destructive-foreground">DIVERGENTE</Badge>;
  return <Badge variant="secondary">{status.replace('_', ' ').toUpperCase()}</Badge>;
}

export default function EmbarqueDetalhesDialog({ embarque, open, onOpenChange, onReaberto }: Props) {
  const { perfil } = useAuth();
  const [reabrindo, setReabrindo] = useState(false);
  if (!embarque) return null;
  const temConferencia = embarque.itensConferencia && embarque.itensConferencia.length > 0;
  const isFinalizado = embarque.status === 'aprovado' || embarque.status === 'bloqueado';
  const isPosConferencia = ['conferido', 'divergente', 'liberado_lider', 'bloqueado_lider'].includes(embarque.status);
  // Fiscal/Líder podem reabrir embarques finalizados devolvendo ao Líder
  const podeReabrirParaLider = (perfil === 'fiscal' || perfil === 'lider') && isFinalizado;
  // Reabertura completa (volta ao conferente) disponível apenas em estágios intermediários
  const podeReabrirParaConferente = (perfil === 'fiscal' || perfil === 'lider') && isPosConferencia;

  const handleReabrirConferente = async () => {
    setReabrindo(true);
    try {
      await reabrirConferencia(embarque.id);
      toast.success('Conferência reaberta! Tarefa devolvida ao Conferente.');
      onOpenChange(false);
      onReaberto?.();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao reabrir conferência.');
    } finally {
      setReabrindo(false);
    }
  };

  const handleReabrirLider = async () => {
    setReabrindo(true);
    try {
      await reabrirParaLider(embarque.id);
      toast.success('Embarque reaberto! Tarefa devolvida ao Líder.');
      onOpenChange(false);
      onReaberto?.();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao reabrir embarque.');
    } finally {
      setReabrindo(false);
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] p-0 flex flex-col gap-0">
        <DialogHeader className="p-6 pb-3 border-b shrink-0">
          <div className="flex items-center justify-between gap-4 pr-6">
            <div>
              <DialogTitle className="text-xl">Embarque {embarque.numeroEmbarque}</DialogTitle>
              <DialogDescription>Placa: {embarque.placaVeiculo || '-'}</DialogDescription>
            </div>
            {getStatusBadge(embarque.status)}
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button size="sm" variant="outline" onClick={() => gerarEmbarquePdf(embarque, 'download')}>
              <Download className="w-4 h-4 mr-2" /> Baixar PDF
            </Button>
            <Button size="sm" variant="outline" onClick={() => gerarEmbarquePdf(embarque, 'print')}>
              <Printer className="w-4 h-4 mr-2" /> Imprimir
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 px-6 py-4">
          {/* Resumo */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm mb-4 p-3 rounded-lg bg-muted/30">
            <div>
              <span className="text-muted-foreground text-xs">Separador</span>
              <p className="font-medium">{embarque.separador}</p>
              <p className="text-xs text-muted-foreground">{formatDateTime(embarque.dataSeparacao)}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">Conferente</span>
              <p className="font-medium">{embarque.conferente || '-'}</p>
              <p className="text-xs text-muted-foreground">{formatDateTime(embarque.dataConferencia)}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">Fiscal</span>
              <p className="font-medium">{embarque.fiscal || '-'}</p>
              <p className="text-xs text-muted-foreground">{formatDateTime(embarque.dataFiscal)}</p>
            </div>
          </div>

          {/* Itens */}
          <div className="space-y-4">
            {embarque.itensSeparacao.map((sep, idx) => {
              const conf = embarque.itensConferencia.find(c => c.itemSeparacaoId === sep.id);
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
                <div key={sep.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                    <span className="font-semibold text-sm">Item {idx + 1} — {sep.descricaoProduto}</span>
                    {conf && (conf.status === 'conferido'
                      ? <Badge className="bg-success text-success-foreground">Conferido</Badge>
                      : <Badge variant="destructive">Divergente</Badge>
                    )}
                  </div>
                  <ScrollArea className="w-full whitespace-nowrap rounded-md border">
                    <div className="min-w-[640px]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-40">Campo</TableHead>
                            <TableHead className="min-w-[180px]">Separação</TableHead>
                            {temConferencia && <TableHead className="min-w-[180px]">Conferência</TableHead>}
                            {temConferencia && <TableHead className="w-16">OK</TableHead>}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {fields.map(({ label, sepVal, confVal }) => {
                            const match = sepVal === confVal;
                            return (
                              <TableRow key={label} className={temConferencia && !match ? 'bg-destructive/5' : ''}>
                                <TableCell className="font-medium">{label}</TableCell>
                                <TableCell>{sepVal}</TableCell>
                                {temConferencia && (
                                  <TableCell className={!match ? 'text-destructive font-bold' : ''}>
                                    {confVal || '-'}
                                  </TableCell>
                                )}
                                {temConferencia && (
                                  <TableCell>
                                    {match
                                      ? <span className="text-success text-lg">✓</span>
                                      : <span className="text-destructive text-lg">✗</span>}
                                  </TableCell>
                                )}
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                </div>
              );
            })}
          </div>

          {embarque.status === 'bloqueado' && (
            <p className="text-destructive text-sm font-medium mt-4">⚠ Finalizado com divergência pelo fiscal</p>
          )}
          {embarque.status === 'divergente' && (
            <p className="text-warning text-sm font-medium mt-4">⚠ Divergência encontrada na conferência</p>
          )}

          {(podeReabrirParaLider || podeReabrirParaConferente) && (
            <div className="mt-4 pt-4 border-t space-y-2">
              {podeReabrirParaLider && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full border-warning text-warning hover:bg-warning/10" disabled={reabrindo}>
                      <RotateCcw className="w-4 h-4 mr-2" /> {perfil === 'lider' ? 'Reabrir e devolver ao Conferente' : 'Reabrir e devolver ao Líder'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Reabrir embarque?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação devolve o embarque <strong>{embarque.numeroEmbarque}</strong> para a etapa de análise do <strong>Líder</strong>. A decisão do Líder e do Fiscal serão apagadas, mas os itens conferidos serão mantidos. Deseja continuar?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleReabrirLider}>Sim, reabrir</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              {podeReabrirParaConferente && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full border-warning text-warning hover:bg-warning/10" disabled={reabrindo}>
                      <RotateCcw className="w-4 h-4 mr-2" /> Reabrir Conferência
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Reabrir conferência?</AlertDialogTitle>
                      <AlertDialogDescription>
                        O embarque <strong>{embarque.numeroEmbarque}</strong> voltará para a etapa de <strong>Conferência</strong>. Os dados conferidos anteriormente serão apagados e o Conferente precisará refazer a conferência.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleReabrirConferente}>Sim, reabrir</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
