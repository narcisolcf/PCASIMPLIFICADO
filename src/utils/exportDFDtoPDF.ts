import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { numberToCurrency } from "./validators";

interface Material {
  id: string;
  tipo: "Material" | "Serviço";
  codigo_item: string | null;
  descricao: string;
  quantidade: number;
  unidade_medida: string;
  valor_unitario: number;
  valor_total: number;
  justificativa: string | null;
}

interface Responsavel {
  id: string;
  nome: string;
  cpf: string;
  funcao: string | null;
  cargo: string | null;
  email: string | null;
  telefone: string | null;
}

interface Anexo {
  id: string;
  nome_arquivo: string;
  tamanho_bytes: number;
  created_at: string;
}

interface DFDData {
  numero: number;
  numero_uasg: string;
  area_requisitante: string;
  descricao_sucinta: string | null;
  justificativa_necessidade: string | null;
  prioridade: string | null;
  valor_total: number | null;
  materiais: Material[];
  responsaveis: Responsavel[];
  anexos: Anexo[];
}

export function exportDFDtoPDF(data: DFDData) {
  const doc = new jsPDF();
  let yPosition = 20;

  // Configurar fonte
  doc.setFont("helvetica");

  // Título principal
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Documento de Formalização de Demanda (DFD)", 105, yPosition, { align: "center" });
  yPosition += 15;

  // Informações do DFD
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("1. Informações Gerais", 14, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  const infoData = [
    ["Número DFD:", data.numero.toString()],
    ["Número UNIDADE GESTORA:", data.numero_uasg],
    ["Área Requisitante:", data.area_requisitante],
    ["Prioridade:", data.prioridade || "-"],
    ["Valor Total:", data.valor_total ? numberToCurrency(data.valor_total) : "R$ 0,00"],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [],
    body: infoData,
    theme: "plain",
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 50 },
      1: { cellWidth: 130 },
    },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 10;

  // Descrição Sucinta
  if (data.descricao_sucinta) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Descrição Sucinta:", 14, yPosition);
    yPosition += 6;

    doc.setFont("helvetica", "normal");
    const splitDescription = doc.splitTextToSize(data.descricao_sucinta, 180);
    doc.text(splitDescription, 14, yPosition);
    yPosition += splitDescription.length * 5 + 8;
  }

  // Justificativa
  if (data.justificativa_necessidade) {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.text("Justificativa da Necessidade:", 14, yPosition);
    yPosition += 6;

    doc.setFont("helvetica", "normal");
    const splitJustification = doc.splitTextToSize(data.justificativa_necessidade, 180);
    doc.text(splitJustification, 14, yPosition);
    yPosition += splitJustification.length * 5 + 10;
  }

  // Nova página para materiais se necessário
  if (yPosition > 200) {
    doc.addPage();
    yPosition = 20;
  }

  // Materiais/Serviços
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("2. Materiais e Serviços", 14, yPosition);
  yPosition += 8;

  if (data.materiais.length > 0) {
    const materiaisData = data.materiais.map(m => [
      m.codigo_item || "-",
      m.tipo,
      m.descricao.substring(0, 40) + (m.descricao.length > 40 ? "..." : ""),
      m.quantidade.toString(),
      m.unidade_medida,
      numberToCurrency(m.valor_unitario),
      numberToCurrency(m.valor_total),
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [["Código", "Tipo", "Descrição", "Qtd", "Un.", "Vlr. Unit.", "Vlr. Total"]],
      body: materiaisData,
      theme: "striped",
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [66, 66, 66], textColor: 255, fontStyle: "bold" },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 18 },
        2: { cellWidth: 60 },
        3: { cellWidth: 15 },
        4: { cellWidth: 15 },
        5: { cellWidth: 25 },
        6: { cellWidth: 25 },
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;
  } else {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Nenhum material ou serviço cadastrado.", 14, yPosition);
    yPosition += 10;
  }

  // Nova página para responsáveis se necessário
  if (yPosition > 220) {
    doc.addPage();
    yPosition = 20;
  }

  // Responsáveis
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("3. Responsáveis", 14, yPosition);
  yPosition += 8;

  if (data.responsaveis.length > 0) {
    const responsaveisData = data.responsaveis.map(r => [
      r.nome,
      r.cpf,
      r.funcao || "-",
      r.cargo || "-",
      r.email || "-",
      r.telefone || "-",
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [["Nome", "CPF", "Função", "Cargo", "E-mail", "Telefone"]],
      body: responsaveisData,
      theme: "striped",
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [66, 66, 66], textColor: 255, fontStyle: "bold" },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 30 },
        2: { cellWidth: 25 },
        3: { cellWidth: 25 },
        4: { cellWidth: 35 },
        5: { cellWidth: 25 },
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;
  } else {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Nenhum responsável cadastrado.", 14, yPosition);
    yPosition += 10;
  }

  // Anexos
  if (yPosition > 240) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("4. Anexos", 14, yPosition);
  yPosition += 8;

  if (data.anexos.length > 0) {
    const anexosData = data.anexos.map((a, index) => [
      (index + 1).toString(),
      a.nome_arquivo,
      `${(a.tamanho_bytes / 1024).toFixed(2)} KB`,
      new Date(a.created_at).toLocaleDateString("pt-BR"),
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [["#", "Nome do Arquivo", "Tamanho", "Data de Upload"]],
      body: anexosData,
      theme: "striped",
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [66, 66, 66], textColor: 255, fontStyle: "bold" },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 100 },
        2: { cellWidth: 30 },
        3: { cellWidth: 40 },
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;
  } else {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Nenhum anexo incluído.", 14, yPosition);
    yPosition += 10;
  }

  // Rodapé com data de geração
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Gerado em: ${new Date().toLocaleString("pt-BR")} - Página ${i} de ${pageCount}`,
      105,
      290,
      { align: "center" }
    );
  }

  // Salvar PDF
  doc.save(`DFD_${data.numero}_${data.numero_uasg}.pdf`);
}
