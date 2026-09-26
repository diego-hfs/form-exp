import type { Conferencia, DadosExpedicao, ItemConferencia, ItemSeparacao, Perfil } from '@/types/conferencia';

const STORAGE_KEY = 'expedicheck_demo_conferencias_v1';

const uid = () => typeof crypto !== 'undefined' && 'randomUUID' in crypto
  ? crypto.randomUUID()
  : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const item = (id: string, codigo: string, descricao: string, lote: string, quantidade: number): ItemSeparacao => ({
  id, codigoProduto: codigo, descricaoProduto: descricao, lote,
  dataFabricacao: '2026-08-10', dataValidade: '2027-08-10',
  tipoEmbalagem: 'Caixa', quantidadePallets: 1, quantidade,
});

const toConf = (sep: ItemSeparacao, quantidade = sep.quantidade): ItemConferencia => ({
  id: uid(), itemSeparacaoId: sep.id, codigoProduto: sep.codigoProduto,
  descricaoProduto: sep.descricaoProduto, lote: sep.lote, dataFabricacao: sep.dataFabricacao,
  dataValidade: sep.dataValidade, tipoEmbalagem: sep.tipoEmbalagem,
  quantidadePallets: sep.quantidadePallets, quantidade,
  status: quantidade === sep.quantidade ? 'conferido' : 'divergente',
});

function seed(): Conferencia[] {
  const a1 = item('demo-a1', 'SKU-1001', 'Produto Demonstrativo A', 'LT-A01', 10);
  const a2 = item('demo-a2', 'SKU-1002', 'Produto Demonstrativo B', 'LT-B01', 5);
  const b1 = item('demo-b1', 'SKU-2001', 'Produto Demonstrativo C', 'LT-C02', 20);
  const b2 = item('demo-b2', 'SKU-2002', 'Produto Demonstrativo D', 'LT-D02', 8);
  const c1 = item('demo-c1', 'SKU-3001', 'Produto Demonstrativo E', 'LT-E03', 12);
  const now = new Date();
  const iso = (minutes: number) => new Date(now.getTime() - minutes * 60_000).toISOString();

  return [
    {
      id: 'demo-001', numeroEmbarque: 'EXP-2026-001', pedido: 'PED-45872',
      destinatario: 'Distribuidora Demo Ltda.', cidadeDestino: 'Goiânia', ufDestino: 'GO',
      placaVeiculo: 'DEM-1A23', tipoVeiculo: 'VUC', motorista: 'Carlos Demonstrativo', doca: '04',
      separador: 'Usuário', status: 'aguardando_conferencia', itensSeparacao: [a1, a2],
      itensConferencia: [], dataSeparacao: iso(40),
    },
    {
      id: 'demo-002', numeroEmbarque: 'EXP-2026-002', pedido: 'PED-45873',
      destinatario: 'Cliente Exemplo S.A.', cidadeDestino: 'Campinas', ufDestino: 'SP',
      placaVeiculo: 'SIM-2B34', tipoVeiculo: 'Truck', motorista: 'Marina Exemplo', doca: '07',
      separador: 'Usuário', conferente: 'Usuário', status: 'divergente',
      itensSeparacao: [b1, b2], itensConferencia: [toConf(b1), toConf(b2, 7)],
      dataSeparacao: iso(95), dataConferencia: iso(70),
    },
    {
      id: 'demo-003', numeroEmbarque: 'EXP-2026-003', pedido: 'PED-45874',
      destinatario: 'Atacadista Fictício ME', cidadeDestino: 'Jundiaí', ufDestino: 'SP',
      placaVeiculo: 'TST-3C45', tipoVeiculo: 'Carreta', motorista: 'Paulo Teste', doca: '02',
      separador: 'Usuário', conferente: 'Usuário', lider: 'Usuário', status: 'liberado_lider',
      itensSeparacao: [c1], itensConferencia: [toConf(c1)], decisaoLider: 'liberado_lider',
      dataSeparacao: iso(160), dataConferencia: iso(135), dataLider: iso(110),
    },
  ];
}

function read(): Conferencia[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const initial = seed();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
  try { return JSON.parse(raw) as Conferencia[]; }
  catch {
    const initial = seed();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
}

function write(data: Conferencia[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function update(id: string, updater: (c: Conferencia) => Conferencia) {
  const data = read();
  const index = data.findIndex(c => c.id === id);
  if (index < 0) throw new Error('Embarque não encontrado.');
  data[index] = updater(data[index]);
  write(data);
}

export function resetDemoData() {
  write(seed());
}

export async function getConferenciaPorEmbarque(numeroOuPlaca: string): Promise<Conferencia | undefined> {
  const q = numeroOuPlaca.trim().toLowerCase();
  return read().find(c => c.numeroEmbarque.toLowerCase() === q || (c.placaVeiculo || '').toLowerCase() === q);
}

export async function saveConferenciaSeparacao(
  embarque: string, separador: string, itens: Omit<ItemSeparacao, 'id'>[], dados: DadosExpedicao
): Promise<void> {
  const data = read();
  if (data.some(c => c.numeroEmbarque.toLowerCase() === embarque.toLowerCase())) {
    throw new Error('Já existe um embarque com este número.');
  }
  data.unshift({
    id: uid(), numeroEmbarque: embarque, pedido: dados.pedido, destinatario: dados.destinatario,
    cidadeDestino: dados.cidadeDestino, ufDestino: dados.ufDestino, placaVeiculo: dados.placaVeiculo,
    tipoVeiculo: dados.tipoVeiculo, motorista: dados.motorista, doca: dados.doca, separador,
    status: 'aguardando_conferencia', itensSeparacao: itens.map(i => ({ ...i, id: uid() })),
    itensConferencia: [], dataSeparacao: new Date().toISOString(),
  });
  write(data);
}

export async function saveConferenciaConferente(
  conferenciaId: string, conferente: string, itensConf: Omit<ItemConferencia, 'id'>[], status: 'conferido' | 'divergente'
): Promise<void> {
  update(conferenciaId, c => ({ ...c, conferente, status, dataConferencia: new Date().toISOString(), itensConferencia: itensConf.map(i => ({ ...i, id: uid() })) }));
}

export async function getConferenciasPorUsuario(nome: string, role: Perfil): Promise<Conferencia[]> {
  return read().filter(c => {
    if (role === 'separador') return c.separador === nome;
    if (role === 'conferente') return c.conferente === nome;
    if (role === 'lider') return c.lider === nome;
    return c.fiscal === nome;
  });
}

export async function getEmbarquesParaConferente(): Promise<Conferencia[]> {
  return read().filter(c => c.status === 'aguardando_conferencia');
}

export async function getEmbarquesParaLider(): Promise<Conferencia[]> {
  return read().filter(c => c.status === 'conferido' || c.status === 'divergente');
}

export async function getEmbarquesParaFiscal(): Promise<Conferencia[]> {
  return read().filter(c => ['liberado_lider', 'bloqueado_lider', 'aprovado', 'bloqueado'].includes(c.status));
}

export async function saveDecisaoLider(conferenciaId: string, lider: string, decisao: 'liberado_lider' | 'bloqueado_lider'): Promise<void> {
  update(conferenciaId, c => ({ ...c, lider, status: decisao, decisaoLider: decisao, dataLider: new Date().toISOString() }));
}

export async function saveDecisaoFiscal(conferenciaId: string, fiscal: string, decisao: 'aprovado' | 'bloqueado'): Promise<void> {
  update(conferenciaId, c => ({ ...c, fiscal, status: decisao, decisaoFiscal: decisao, dataFiscal: new Date().toISOString() }));
}

export async function reabrirConferencia(conferenciaId: string): Promise<void> {
  update(conferenciaId, c => ({ ...c, status: 'aguardando_conferencia', conferente: undefined, lider: undefined, fiscal: undefined,
    dataConferencia: undefined, dataLider: undefined, dataFiscal: undefined, decisaoLider: undefined, decisaoFiscal: undefined, itensConferencia: [] }));
}

export async function reabrirParaLider(conferenciaId: string): Promise<void> {
  update(conferenciaId, c => ({ ...c, status: c.itensConferencia.some(i => i.status === 'divergente') ? 'divergente' : 'conferido',
    lider: undefined, fiscal: undefined, dataLider: undefined, dataFiscal: undefined, decisaoLider: undefined, decisaoFiscal: undefined }));
}
