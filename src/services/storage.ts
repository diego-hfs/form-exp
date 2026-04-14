import { supabase } from '@/integrations/supabase/client';
import type { Conferencia, ItemSeparacao, ItemConferencia } from '@/types/conferencia';

// Helper to map DB row to app type
function mapConferencia(row: any, itensSep: any[], itensConf: any[]): Conferencia {
  return {
    id: row.id,
    numeroEmbarque: row.numero_embarque,
    separador: row.separador,
    conferente: row.conferente ?? undefined,
    fiscal: row.fiscal ?? undefined,
    status: row.status,
    decisaoFiscal: row.decisao_fiscal ?? undefined,
    dataSeparacao: row.data_separacao,
    dataConferencia: row.data_conferencia ?? undefined,
    dataFiscal: row.data_fiscal ?? undefined,
    itensSeparacao: itensSep.map(i => ({
      id: i.id,
      codigoProduto: i.codigo_produto,
      descricaoProduto: i.descricao_produto,
      lote: i.lote,
      dataFabricacao: i.data_fabricacao,
      dataValidade: i.data_validade,
      tipoEmbalagem: i.tipo_embalagem,
      quantidadePallets: i.quantidade_pallets,
      quantidade: i.quantidade,
    })),
    itensConferencia: itensConf.map(i => ({
      id: i.id,
      itemSeparacaoId: i.item_separacao_id,
      codigoProduto: i.codigo_produto,
      lote: i.lote,
      dataFabricacao: i.data_fabricacao,
      dataValidade: i.data_validade,
      tipoEmbalagem: i.tipo_embalagem,
      quantidadePallets: i.quantidade_pallets,
      quantidade: i.quantidade,
      status: i.status,
    })),
  };
}

export async function getConferenciaPorEmbarque(numero: string): Promise<Conferencia | undefined> {
  const { data: conf } = await supabase
    .from('conferencias')
    .select('*')
    .eq('numero_embarque', numero)
    .maybeSingle();

  if (!conf) return undefined;

  const [{ data: itensSep }, { data: itensConf }] = await Promise.all([
    supabase.from('itens_separacao').select('*').eq('conferencia_id', conf.id),
    supabase.from('itens_conferencia').select('*').eq('conferencia_id', conf.id),
  ]);

  return mapConferencia(conf, itensSep || [], itensConf || []);
}

export async function saveConferenciaSeparacao(
  embarque: string,
  separador: string,
  itens: Omit<ItemSeparacao, 'id'>[]
): Promise<void> {
  const { data: conf, error } = await supabase
    .from('conferencias')
    .insert({
      numero_embarque: embarque,
      separador,
      status: 'aguardando_conferencia',
    })
    .select()
    .single();

  if (error || !conf) throw new Error(error?.message || 'Erro ao salvar conferência');

  const itensDb = itens.map(i => ({
    conferencia_id: conf.id,
    codigo_produto: i.codigoProduto,
    descricao_produto: i.descricaoProduto,
    lote: i.lote,
    data_fabricacao: i.dataFabricacao,
    data_validade: i.dataValidade,
    tipo_embalagem: i.tipoEmbalagem,
    quantidade_pallets: i.quantidadePallets,
    quantidade: i.quantidade,
  }));

  const { error: err2 } = await supabase.from('itens_separacao').insert(itensDb);
  if (err2) throw new Error(err2.message);
}

export async function saveConferenciaConferente(
  conferenciaId: string,
  conferente: string,
  itensConf: Omit<ItemConferencia, 'id'>[],
  status: 'conferido' | 'divergente'
): Promise<void> {
  const { error } = await supabase
    .from('conferencias')
    .update({
      conferente,
      status,
      data_conferencia: new Date().toISOString(),
    })
    .eq('id', conferenciaId);

  if (error) throw new Error(error.message);

  const itensDb = itensConf.map(i => ({
    conferencia_id: conferenciaId,
    item_separacao_id: i.itemSeparacaoId,
    codigo_produto: i.codigoProduto,
    lote: i.lote,
    data_fabricacao: i.dataFabricacao,
    data_validade: i.dataValidade,
    tipo_embalagem: i.tipoEmbalagem,
    quantidade_pallets: i.quantidadePallets,
    quantidade: i.quantidade,
    status: i.status,
  }));

  const { error: err2 } = await supabase.from('itens_conferencia').insert(itensDb);
  if (err2) throw new Error(err2.message);
}

export async function saveDecisaoFiscal(
  conferenciaId: string,
  fiscal: string,
  decisao: 'aprovado' | 'bloqueado'
): Promise<void> {
  const { error } = await supabase
    .from('conferencias')
    .update({
      fiscal,
      status: decisao,
      decisao_fiscal: decisao,
      data_fiscal: new Date().toISOString(),
    })
    .eq('id', conferenciaId);

  if (error) throw new Error(error.message);
}
