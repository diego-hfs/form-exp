export type Perfil = 'separador' | 'conferente' | 'lider' | 'fiscal';

export type StatusConferencia = 
  | 'aguardando_conferencia' 
  | 'conferido' 
  | 'divergente' 
  | 'liberado_lider'
  | 'bloqueado_lider'
  | 'aprovado' 
  | 'bloqueado';

export interface ItemSeparacao {
  id: string;
  codigoProduto: string;
  descricaoProduto: string;
  lote: string;
  dataFabricacao: string;
  dataValidade: string;
  tipoEmbalagem: string;
  quantidadePallets: number;
  quantidade: number;
}

export interface ItemConferencia {
  id: string;
  itemSeparacaoId: string;
  codigoProduto: string;
  descricaoProduto: string;
  lote: string;
  dataFabricacao: string;
  dataValidade: string;
  tipoEmbalagem: string;
  quantidadePallets: number;
  quantidade: number;
  status: 'conferido' | 'divergente';
}

export interface Conferencia {
  id: string;
  numeroEmbarque: string;
  placaVeiculo?: string;
  separador: string;
  conferente?: string;
  lider?: string;
  fiscal?: string;
  status: StatusConferencia;
  itensSeparacao: ItemSeparacao[];
  itensConferencia: ItemConferencia[];
  dataSeparacao: string;
  dataConferencia?: string;
  dataLider?: string;
  dataFiscal?: string;
  decisaoLider?: 'liberado_lider' | 'bloqueado_lider';
  decisaoFiscal?: 'aprovado' | 'bloqueado';
}
