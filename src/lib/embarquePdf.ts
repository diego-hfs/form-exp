import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Conferencia } from '@/types/conferencia';

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

function statusLabel(status: string) {
  return status.replace('_', ' ').toUpperCase();
}

export function gerarEmbarquePdf(embarque: Conferencia, action: 'download' | 'print' = 'download') {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 14;
  let cursorY = 15;

  // Cabeçalho
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`Embarque ${embarque.numeroEmbarque}`, marginX, cursorY);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Status: ${statusLabel(embarque.status)}`, pageWidth - marginX, cursorY, { align: 'right' });
  cursorY += 6;
  doc.setTextColor(100);
  doc.text(`Placa do veículo: ${embarque.placaVeiculo || '-'}`, marginX, cursorY);
  doc.text(`Emitido em: ${new Date().toLocaleString('pt-BR')}`, pageWidth - marginX, cursorY, { align: 'right' });
  doc.setTextColor(0);
  cursorY += 6;

  // Resumo de etapas
  autoTable(doc, {
    startY: cursorY,
    head: [['Etapa', 'Responsável', 'Data']],
    body: [
      ['Separação', embarque.separador || '-', formatDateTime(embarque.dataSeparacao)],
      ['Conferência', embarque.conferente || '-', formatDateTime(embarque.dataConferencia)],
      ['Análise do Líder', embarque.lider || '-', formatDateTime(embarque.dataLider)],
      ['Validação Fiscal', embarque.fiscal || '-', formatDateTime(embarque.dataFiscal)],
    ],
    theme: 'striped',
    headStyles: { fillColor: [30, 41, 59], textColor: 255 },
    styles: { fontSize: 9, cellPadding: 2 },
    margin: { left: marginX, right: marginX },
  });
  cursorY = (doc as any).lastAutoTable.finalY + 6;

  // Decisões
  if (embarque.decisaoLider || embarque.decisaoFiscal) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Decisões', marginX, cursorY);
    cursorY += 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    if (embarque.decisaoLider) {
      doc.text(`• Líder: ${statusLabel(embarque.decisaoLider)}`, marginX, cursorY);
      cursorY += 4;
    }
    if (embarque.decisaoFiscal) {
      doc.text(`• Fiscal: ${statusLabel(embarque.decisaoFiscal)}`, marginX, cursorY);
      cursorY += 4;
    }
    cursorY += 2;
  }

  const temConferencia = embarque.itensConferencia.length > 0;

  // Painel comparativo por item
  embarque.itensSeparacao.forEach((sep, idx) => {
    const conf = embarque.itensConferencia.find(c => c.itemSeparacaoId === sep.id);

    if (cursorY > 250) {
      doc.addPage();
      cursorY = 15;
    }

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    const itemTitle = `Item ${idx + 1} — ${sep.descricaoProduto}`;
    doc.text(itemTitle, marginX, cursorY);
    if (conf) {
      const badge = conf.status === 'conferido' ? 'CONFERIDO' : 'DIVERGENTE';
      doc.setFontSize(9);
      doc.setTextColor(conf.status === 'conferido' ? 22 : 200, conf.status === 'conferido' ? 163 : 35, conf.status === 'conferido' ? 74 : 51);
      doc.text(badge, pageWidth - marginX, cursorY, { align: 'right' });
      doc.setTextColor(0);
    }
    cursorY += 4;

    const fields: Array<{ label: string; sepVal: string; confVal?: string }> = [
      { label: 'Código', sepVal: sep.codigoProduto, confVal: conf?.codigoProduto },
      { label: 'Descrição', sepVal: sep.descricaoProduto, confVal: conf?.descricaoProduto || sep.descricaoProduto },
      { label: 'Lote', sepVal: sep.lote, confVal: conf?.lote },
      { label: 'Data de Fabricação', sepVal: formatDateBR(sep.dataFabricacao), confVal: conf ? formatDateBR(conf.dataFabricacao) : undefined },
      { label: 'Data de Validade', sepVal: formatDateBR(sep.dataValidade), confVal: conf ? formatDateBR(conf.dataValidade) : undefined },
      { label: 'Tipo de Embalagem', sepVal: sep.tipoEmbalagem, confVal: conf?.tipoEmbalagem },
      { label: 'Qtde. de Pallets', sepVal: String(sep.quantidadePallets), confVal: conf ? String(conf.quantidadePallets) : undefined },
      { label: 'Quantidade', sepVal: String(sep.quantidade), confVal: conf ? String(conf.quantidade) : undefined },
    ];

    const head = temConferencia
      ? [['Campo', 'Separação', 'Conferência', 'OK']]
      : [['Campo', 'Separação']];

    const body = fields.map(f => {
      if (!temConferencia) return [f.label, f.sepVal];
      const match = f.sepVal === f.confVal;
      return [f.label, f.sepVal, f.confVal ?? '-', match ? 'OK' : 'X'];
    });

    autoTable(doc, {
      startY: cursorY,
      head,
      body,
      theme: 'grid',
      headStyles: { fillColor: [241, 245, 249], textColor: 30, fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 2 },
      margin: { left: marginX, right: marginX },
      didParseCell: (data) => {
        if (!temConferencia || data.section !== 'body') return;
        const sepVal = data.row.raw[1];
        const confVal = data.row.raw[2];
        if (sepVal !== confVal) {
          data.cell.styles.fillColor = [254, 226, 226];
          if (data.column.index >= 2) data.cell.styles.textColor = [185, 28, 28];
        }
      },
    });
    cursorY = (doc as any).lastAutoTable.finalY + 6;
  });

  // Rodapé com numeração
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageWidth - marginX,
      doc.internal.pageSize.getHeight() - 8,
      { align: 'right' },
    );
    doc.text(
      `Embarque ${embarque.numeroEmbarque}`,
      marginX,
      doc.internal.pageSize.getHeight() - 8,
    );
  }

  if (action === 'print') {
    doc.autoPrint();
    const blobUrl = doc.output('bloburl');
    window.open(blobUrl as unknown as string, '_blank');
  } else {
    doc.save(`embarque-${embarque.numeroEmbarque}.pdf`);
  }
}
