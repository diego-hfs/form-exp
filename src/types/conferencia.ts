export type Perfil = 'separador' | 'conferente' | 'fiscal';

export type StatusConferencia = 
  | 'aguardando_conferencia' 
  | 'conferido' 
  | 'divergente' 
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
  fiscal?: string;
  status: StatusConferencia;
  itensSeparacao: ItemSeparacao[];
  itensConferencia: ItemConferencia[];
  dataSeparacao: string;
  dataConferencia?: string;
  dataFiscal?: string;
  decisaoFiscal?: 'aprovado' | 'bloqueado';
}
