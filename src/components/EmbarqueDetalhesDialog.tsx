import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Conferencia } from '@/types/conferencia';

interface Props {
  embarque: Conferencia | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export default function EmbarqueDetalhesDialog({ embarque, open, onOpenChange }: Props) {
  if (!embarque) return null;
  const temConferencia = embarque.itensConferencia && embarque.itensConferencia.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between gap-4 pr-6">
            <div>
              <DialogTitle className="text-xl">Embarque {embarque.numeroEmbarque}</DialogTitle>
              <DialogDescription>Placa: {embarque.placaVeiculo || '-'}</DialogDescription>
            </div>
            {getStatusBadge(embarque.status)}
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
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
                { label: 'Descrição', sepVal: sep.descricaoProduto, confVal: conf?.descricaoProduto },
                { label: 'Lote', sepVal: sep.lote, confVal: conf?.lote },
                { label: 'Fabricação', sepVal: formatDateBR(sep.dataFabricacao), confVal: conf ? formatDateBR(conf.dataFabricacao) : undefined },
                { label: 'Validade', sepVal: formatDateBR(sep.dataValidade), confVal: conf ? formatDateBR(conf.dataValidade) : undefined },
                { label: 'Embalagem', sepVal: sep.tipoEmbalagem, confVal: conf?.tipoEmbalagem },
                { label: 'Pallets', sepVal: String(sep.quantidadePallets), confVal: conf ? String(conf.quantidadePallets) : undefined },
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
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-28">Campo</TableHead>
                          <TableHead>Separação</TableHead>
                          {temConferencia && <TableHead>Conferência</TableHead>}
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
                </div>
              );
            })}
          </div>

          {embarque.status === 'bloqueado' && (
            <p className="text-destructive text-sm font-medium mt-4">⚠ Bloqueado pelo fiscal</p>
          )}
          {embarque.status === 'divergente' && (
            <p className="text-orange-600 text-sm font-medium mt-4">⚠ Divergência encontrada na conferência</p>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
