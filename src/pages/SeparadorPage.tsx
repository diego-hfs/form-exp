import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { saveConferencia } from '@/services/storage';
import type { Conferencia, ItemSeparacao } from '@/types/conferencia';
import { ArrowLeft, Plus, Send, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const embalagensOptions = ['Caixa', 'Pallet', 'Saco', 'Tambor', 'Big Bag', 'Fardo', 'Engradado'];

const emptyItem = (): Partial<ItemSeparacao> => ({
  codigoProduto: '', descricaoProduto: '', lote: '',
  dataFabricacao: '', dataValidade: '', tipoEmbalagem: '',
  quantidadePallets: 0, quantidade: 0,
});

export default function SeparadorPage() {
  const navigate = useNavigate();
  const nome = sessionStorage.getItem('nome') || '';
  const [embarque, setEmbarque] = useState('');
  const [itens, setItens] = useState<Partial<ItemSeparacao>[]>([emptyItem()]);

  const updateItem = (idx: number, field: string, value: string | number) => {
    setItens(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const removeItem = (idx: number) => {
    if (itens.length <= 1) return;
    setItens(prev => prev.filter((_, i) => i !== idx));
  };

  const isFormValid = () => {
    if (!embarque.trim()) return false;
    return itens.every(item =>
      item.codigoProduto && item.descricaoProduto && item.lote &&
      item.dataFabricacao && item.dataValidade && item.tipoEmbalagem &&
      (item.quantidadePallets ?? 0) > 0 && (item.quantidade ?? 0) > 0
    );
  };

  const handleFinalizar = () => {
    if (!isFormValid()) {
      toast.error('Preencha todos os campos obrigatórios.');
      return;
    }

    const conferencia: Conferencia = {
      id: crypto.randomUUID(),
      numeroEmbarque: embarque.trim(),
      separador: nome,
      status: 'aguardando_conferencia',
      itensSeparacao: itens.map(item => ({
        ...item,
        id: crypto.randomUUID(),
        quantidadePallets: Number(item.quantidadePallets),
        quantidade: Number(item.quantidade),
      })) as ItemSeparacao[],
      itensConferencia: [],
      dataSeparacao: new Date().toISOString(),
    };

    saveConferencia(conferencia);
    toast.success('Separação finalizada com sucesso!');
    setEmbarque('');
    setItens([emptyItem()]);
  };

  return (
    <div className="min-h-screen bg-background p-4 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Separação</h1>
          <p className="text-muted-foreground text-sm">Separador: {nome}</p>
        </div>
      </div>

      <Card className="mb-4">
        <CardContent className="pt-6">
          <Label className="text-base font-semibold">Número de Embarque</Label>
          <Input className="h-12 text-lg mt-2" placeholder="Ex: EMB-001" value={embarque} onChange={e => setEmbarque(e.target.value)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Itens da Separação</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setItens(prev => [...prev, emptyItem()])}>
            <Plus className="w-4 h-4 mr-1" /> Adicionar Item
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {itens.map((item, idx) => (
            <div key={idx} className="border rounded-lg p-4 space-y-3 relative bg-muted/30">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-sm text-muted-foreground">Item {idx + 1}</span>
                {itens.length > 1 && (
                  <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => removeItem(idx)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label>Código do Produto *</Label>
                  <Input className="h-11" value={item.codigoProduto} onChange={e => updateItem(idx, 'codigoProduto', e.target.value)} />
                </div>
                <div>
                  <Label>Descrição do Produto *</Label>
                  <Input className="h-11" value={item.descricaoProduto} onChange={e => updateItem(idx, 'descricaoProduto', e.target.value)} />
                </div>
                <div>
                  <Label>Lote *</Label>
                  <Input className="h-11" value={item.lote} onChange={e => updateItem(idx, 'lote', e.target.value)} />
                </div>
                <div>
                  <Label>Data de Fabricação *</Label>
                  <Input type="date" className="h-11" value={item.dataFabricacao} onChange={e => updateItem(idx, 'dataFabricacao', e.target.value)} />
                </div>
                <div>
                  <Label>Data de Validade *</Label>
                  <Input type="date" className="h-11" value={item.dataValidade} onChange={e => updateItem(idx, 'dataValidade', e.target.value)} />
                </div>
                <div>
                  <Label>Tipo de Embalagem *</Label>
                  <Select value={item.tipoEmbalagem} onValueChange={v => updateItem(idx, 'tipoEmbalagem', v)}>
                    <SelectTrigger className="h-11"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {embalagensOptions.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Qtd. Pallets *</Label>
                  <Input type="number" min={0} className="h-11" value={item.quantidadePallets || ''} onChange={e => updateItem(idx, 'quantidadePallets', Number(e.target.value))} />
                </div>
                <div>
                  <Label>Quantidade *</Label>
                  <Input type="number" min={0} className="h-11" value={item.quantidade || ''} onChange={e => updateItem(idx, 'quantidade', Number(e.target.value))} />
                </div>
              </div>
            </div>
          ))}

          <Button className="w-full h-14 text-lg font-semibold" onClick={handleFinalizar} disabled={!isFormValid()}>
            <Send className="w-5 h-5 mr-2" /> Finalizar Separação
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
