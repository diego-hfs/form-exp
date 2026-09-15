import { supabase } from '@/integrations/supabase/client';
import type {
  Conferencia,
  ItemSeparacao,
  ItemConferencia,
} from '@/types/conferencia';

type DbRow = Record<string, any>;

/**
 * Converte os dados retornados pelo Supabase
 * para o formato utilizado pela aplicação.
 */
function mapConferencia(
  row: DbRow,
  itensSep: DbRow[],
  itensConf: DbRow[]
): Conferencia {
  return {
    id: row.id,
    numeroEmbarque: row.numero_embarque,
    placaVeiculo: row.placa_veiculo ?? undefined,
    separador: row.separador,
    conferente: row.conferente ?? undefined,
    lider: row.lider ?? undefined,
    fiscal: row.fiscal ?? undefined,
    status: row.status,
    decisaoLider: row.decisao_lider ?? undefined,
    decisaoFiscal: row.decisao_fiscal ?? undefined,
    dataSeparacao: row.data_separacao,
    dataConferencia: row.data_conferencia ?? undefined,
    dataLider: row.data_lider ?? undefined,
    dataFiscal: row.data_fiscal ?? undefined,

    itensSeparacao: itensSep.map((item) => ({
      id: item.id,
      codigoProduto: item.codigo_produto,
      descricaoProduto: item.descricao_produto,
      lote: item.lote,
      dataFabricacao: item.data_fabricacao,
      dataValidade: item.data_validade,
      tipoEmbalagem: item.tipo_embalagem,
      quantidadePallets: item.quantidade_pallets,
      quantidade: item.quantidade,
    })),

    itensConferencia: itensConf.map((item) => ({
      id: item.id,
      itemSeparacaoId: item.item_separacao_id,
      codigoProduto: item.codigo_produto,
      descricaoProduto: item.descricao_produto || '',
      lote: item.lote,
      dataFabricacao: item.data_fabricacao,
      dataValidade: item.data_validade,
      tipoEmbalagem: item.tipo_embalagem,
      quantidadePallets: item.quantidade_pallets,
      quantidade: item.quantidade,
      status: item.status,
    })),
  };
}

/**
 * Carrega os itens relacionados a várias conferências.
 *
 * Centraliza uma consulta que anteriormente estava
 * repetida em várias funções.
 */
async function carregarItensConferencias(ids: string[]) {
  if (ids.length === 0) {
    return {
      itensSep: [] as DbRow[],
      itensConf: [] as DbRow[],
    };
  }

  const [separacaoResult, conferenciaResult] = await Promise.all([
    supabase
      .from('itens_separacao')
      .select('*')
      .in('conferencia_id', ids),

    supabase
      .from('itens_conferencia')
      .select('*')
      .in('conferencia_id', ids),
  ]);

  if (separacaoResult.error) {
    throw new Error(
      `Erro ao carregar itens de separação: ${separacaoResult.error.message}`
    );
  }

  if (conferenciaResult.error) {
    throw new Error(
      `Erro ao carregar itens de conferência: ${conferenciaResult.error.message}`
    );
  }

  return {
    itensSep: separacaoResult.data || [],
    itensConf: conferenciaResult.data || [],
  };
}

/**
 * Converte uma lista de conferências do banco
 * incluindo seus respectivos itens.
 */
async function mapearListaConferencias(rows: DbRow[]): Promise<Conferencia[]> {
  if (rows.length === 0) {
    return [];
  }

  const ids = rows.map((row) => row.id);

  const { itensSep, itensConf } =
    await carregarItensConferencias(ids);

  return rows.map((row) =>
    mapConferencia(
      row,
      itensSep.filter(
        (item) => item.conferencia_id === row.id
      ),
      itensConf.filter(
        (item) => item.conferencia_id === row.id
      )
    )
  );
}

/**
 * Busca uma conferência pelo número do embarque.
 */
export async function getConferenciaPorEmbarque(
  numero: string
): Promise<Conferencia | undefined> {
  const { data: conf, error } = await supabase
    .from('conferencias')
    .select('*')
    .eq('numero_embarque', numero)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Erro ao buscar embarque: ${error.message}`
    );
  }

  if (!conf) {
    return undefined;
  }

  const { itensSep, itensConf } =
    await carregarItensConferencias([conf.id]);

  return mapConferencia(
    conf,
    itensSep.filter(
      (item) => item.conferencia_id === conf.id
    ),
    itensConf.filter(
      (item) => item.conferencia_id === conf.id
    )
  );
}

/**
 * Salva a separação realizada pelo separador.
 */
export async function saveConferenciaSeparacao(
  embarque: string,
  separador: string,
  itens: Omit<ItemSeparacao, 'id'>[],
  placaVeiculo?: string
): Promise<void> {
  const { data: conf, error } = await supabase
    .from('conferencias')
    .insert({
      numero_embarque: embarque,
      separador,
      placa_veiculo: placaVeiculo || null,
      status: 'aguardando_conferencia',
    })
    .select()
    .single();

  if (error || !conf) {
    throw new Error(
      error?.message || 'Erro ao salvar conferência'
    );
  }

  const itensDb = itens.map((item) => ({
    conferencia_id: conf.id,
    codigo_produto: item.codigoProduto,
    descricao_produto: item.descricaoProduto,
    lote: item.lote,
    data_fabricacao: item.dataFabricacao,
    data_validade: item.dataValidade,
    tipo_embalagem: item.tipoEmbalagem,
    quantidade_pallets: item.quantidadePallets,
    quantidade: item.quantidade,
  }));

  const { error: itensError } = await supabase
    .from('itens_separacao')
    .insert(itensDb);

  if (itensError) {
    throw new Error(
      `Erro ao salvar itens da separação: ${itensError.message}`
    );
  }
}

/**
 * Salva o resultado do Double Check realizado
 * pelo conferente.
 */
export async function saveConferenciaConferente(
  conferenciaId: string,
  conferente: string,
  itensConf: Omit<ItemConferencia, 'id'>[],
  status: 'conferido' | 'divergente'
): Promise<void> {
  const { data, error } = await supabase
    .from('conferencias')
    .update({
      conferente,
      status,
      data_conferencia: new Date().toISOString(),
    })
    .eq('id', conferenciaId)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  if (!data || data.length === 0) {
    throw new Error(
      'Você não tem permissão para finalizar esta conferência ou o status mudou. Recarregue a página.'
    );
  }

  const itensDb = itensConf.map((item) => ({
    conferencia_id: conferenciaId,
    item_separacao_id: item.itemSeparacaoId,
    codigo_produto: item.codigoProduto,
    descricao_produto: item.descricaoProduto,
    lote: item.lote,
    data_fabricacao: item.dataFabricacao,
    data_validade: item.dataValidade,
    tipo_embalagem: item.tipoEmbalagem,
    quantidade_pallets: item.quantidadePallets,
    quantidade: item.quantidade,
    status: item.status,
  }));

  const { error: itensError } = await supabase
    .from('itens_conferencia')
    .insert(itensDb);

  if (itensError) {
    throw new Error(
      `Erro ao salvar itens da conferência: ${itensError.message}`
    );
  }
}

/**
 * Busca conferências relacionadas a um usuário.
 */
export async function getConferenciasPorUsuario(
  nome: string,
  role: 'separador' | 'conferente' | 'lider' | 'fiscal'
): Promise<Conferencia[]> {
  const column =
    role === 'conferente'
      ? 'conferente'
      : role === 'fiscal'
        ? 'fiscal'
        : role === 'lider'
          ? 'lider'
          : 'separador';

  const { data: rows, error } = await supabase
    .from('conferencias')
    .select('*')
    .eq(column, nome)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(
      `Erro ao carregar conferências: ${error.message}`
    );
  }

  return mapearListaConferencias(rows || []);
}

/**
 * Lista embarques aguardando o Double Check.
 */
export async function getEmbarquesParaConferente(): Promise<
  Conferencia[]
> {
  const { data: rows, error } = await supabase
    .from('conferencias')
    .select('*')
    .eq('status', 'aguardando_conferencia')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(
      `Erro ao carregar embarques para conferência: ${error.message}`
    );
  }

  return mapearListaConferencias(rows || []);
}

/**
 * Lista embarques que aguardam decisão do líder.
 */
export async function getEmbarquesParaLider(): Promise<
  Conferencia[]
> {
  const { data: rows, error } = await supabase
    .from('conferencias')
    .select('*')
    .in('status', ['conferido', 'divergente'])
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(
      `Erro ao carregar embarques para o líder: ${error.message}`
    );
  }

  return mapearListaConferencias(rows || []);
}

/**
 * Lista embarques disponíveis para análise fiscal.
 */
export async function getEmbarquesParaFiscal(): Promise<
  Conferencia[]
> {
  const { data: rows, error } = await supabase
    .from('conferencias')
    .select('*')
    .in('status', [
      'liberado_lider',
      'bloqueado_lider',
      'aprovado',
      'bloqueado',
    ])
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(
      `Erro ao carregar embarques para o fiscal: ${error.message}`
    );
  }

  return mapearListaConferencias(rows || []);
}

/**
 * Salva a decisão realizada pelo líder.
 */
export async function saveDecisaoLider(
  conferenciaId: string,
  lider: string,
  decisao: 'liberado_lider' | 'bloqueado_lider'
): Promise<void> {
  const { data, error } = await supabase
    .from('conferencias')
    .update({
      lider,
      status: decisao,
      decisao_lider: decisao,
      data_lider: new Date().toISOString(),
    } as any)
    .eq('id', conferenciaId)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  if (!data || data.length === 0) {
    throw new Error(
      'Você não tem permissão para alterar este embarque ou o status mudou. Recarregue a página.'
    );
  }
}

/**
 * Salva a decisão realizada pelo fiscal.
 */
export async function saveDecisaoFiscal(
  conferenciaId: string,
  fiscal: string,
  decisao: 'aprovado' | 'bloqueado'
): Promise<void> {
  const { data, error } = await supabase
    .from('conferencias')
    .update({
      fiscal,
      status: decisao,
      decisao_fiscal: decisao,
      data_fiscal: new Date().toISOString(),
    })
    .eq('id', conferenciaId)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  if (!data || data.length === 0) {
    throw new Error(
      'Você não tem permissão para alterar este embarque ou o status mudou. Recarregue a página.'
    );
  }
}

/**
 * Reabre completamente uma conferência.
 *
 * Os itens conferidos anteriormente são removidos
 * e o processo retorna para aguardando_conferencia.
 */
export async function reabrirConferencia(
  conferenciaId: string
): Promise<void> {
  const { error: deleteError } = await supabase
    .from('itens_conferencia')
    .delete()
    .eq('conferencia_id', conferenciaId);

  if (deleteError) {
    throw new Error(
      `Erro ao remover conferência anterior: ${deleteError.message}`
    );
  }

  const { data, error } = await supabase
    .from('conferencias')
    .update({
      status: 'aguardando_conferencia',
      conferente: null,
      lider: null,
      fiscal: null,
      data_conferencia: null,
      data_lider: null,
      data_fiscal: null,
      decisao_lider: null,
      decisao_fiscal: null,
    } as any)
    .eq('id', conferenciaId)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  if (!data || data.length === 0) {
    throw new Error(
      'Você não tem permissão para reabrir este embarque ou o status mudou. Recarregue a página.'
    );
  }
}

/**
 * Fiscal devolve o embarque para nova análise do líder.
 * Os itens já conferidos são preservados.
 */
export async function reabrirParaLider(
  conferenciaId: string
): Promise<void> {
  const { data: itens, error: itensError } = await supabase
    .from('itens_conferencia')
    .select('status')
    .eq('conferencia_id', conferenciaId);

  if (itensError) {
    throw new Error(
      `Erro ao consultar itens da conferência: ${itensError.message}`
    );
  }

  const temDivergente = (itens || []).some(
    (item) => item.status === 'divergente'
  );

  const novoStatus = temDivergente
    ? 'divergente'
    : 'conferido';

  const { data, error } = await supabase
    .from('conferencias')
    .update({
      status: novoStatus,
      lider: null,
      fiscal: null,
      data_lider: null,
      data_fiscal: null,
      decisao_lider: null,
      decisao_fiscal: null,
    } as any)
    .eq('id', conferenciaId)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  if (!data || data.length === 0) {
    throw new Error(
      'Você não tem permissão para reabrir este embarque ou o status mudou. Recarregue a página.'
    );
  }
}
