export interface PCAItem {
  id: string;
  descricao: string;
  tipo: "Material" | "Serviço" | "Obra" | "Serviço de Engenharia" | "TI";
  valor: number;
  prazo: string;
  prioridade: "Baixa" | "Média" | "Alta" | "Altíssima";
  justificativa: string;
}

export interface PCASecretaria {
  nome: string;
  sigla: string;
  itens: PCAItem[];
  valorTotal: number;
  quantidadeItens: number;
  corGrafico: string; // Hex color for pie chart
}

export interface PCARelatorio {
  valorTotalGeral: number;
  quantidadeItensGeral: number;
  secretarias: PCASecretaria[];
}

export const MOCK_PCA_DATA: PCARelatorio = {
  valorTotalGeral: 293850449.38,
  quantidadeItensGeral: 639,
  secretarias: [
    {
      nome: "SECRETARIA DE SEGURANÇA, TRÂNSITO E DEFESA CIVIL",
      sigla: "SESEG",
      corGrafico: "#ef4444", // Red-500
      valorTotal: 141048215.70, // ~48%
      quantidadeItens: 307,
      itens: [
        {
          id: "1",
          descricao: "Aquisição de 10 viaturas tipo SUV para patrulhamento ostensivo",
          tipo: "Material",
          valor: 1500000.00,
          prazo: "Março/2025",
          prioridade: "Altíssima",
          justificativa: "Necessidade urgente de renovação da frota para garantir a segurança pública municipal."
        },
        {
          id: "2",
          descricao: "Equipamentos de comunicação digital criptografada (Rádios HT)",
          tipo: "Material",
          valor: 250000.00,
          prazo: "Abril/2025",
          prioridade: "Alta",
          justificativa: "Modernização do sistema de comunicação da Guarda Municipal."
        },
        {
          id: "3",
          descricao: "Armamento não-letal (Dispositivos Elétricos Incapacitantes)",
          tipo: "Material",
          valor: 180000.00,
          prazo: "Maio/2025",
          prioridade: "Alta",
          justificativa: "Equipagem padrão para atuação em distúrbios civis e contenção."
        },
        {
          id: "4",
          descricao: "Sistema de videomonitoramento inteligente com reconhecimento facial",
          tipo: "TI",
          valor: 3500000.00,
          prazo: "Julho/2025",
          prioridade: "Altíssima",
          justificativa: "Implantação de cercamento eletrônico nas entradas da cidade."
        }
      ]
    },
    {
      nome: "SECRETARIA DE EDUCAÇÃO",
      sigla: "SEDUC",
      corGrafico: "#f97316", // Orange-500
      valorTotal: 35262053.92, // ~12%
      quantidadeItens: 79,
      itens: [
        {
          id: "5",
          descricao: "Reforma e ampliação da Escola Municipal João Paulo II",
          tipo: "Obra",
          valor: 4500000.00,
          prazo: "Fev/2025",
          prioridade: "Altíssima",
          justificativa: "Estrutura atual comprometida, risco aos alunos."
        },
        {
          id: "6",
          descricao: "Aquisição de Kits de Robótica Educacional",
          tipo: "Material",
          valor: 850000.00,
          prazo: "Março/2025",
          prioridade: "Média",
          justificativa: "Implementação do projeto 'Escola do Futuro'."
        },
        {
          id: "7",
          descricao: "Serviço de transporte escolar rural (Locação de Ônibus)",
          tipo: "Serviço",
          valor: 2500000.00,
          prazo: "Jan/2025",
          prioridade: "Altíssima",
          justificativa: "Garantia de acesso à educação para alunos da zona rural."
        }
      ]
    },
    {
      nome: "SECRETARIA MUNICIPAL DE INFRAESTRUTURA",
      sigla: "SEINFRA",
      corGrafico: "#eab308", // Yellow-500
      valorTotal: 17631026.96, // ~6%
      quantidadeItens: 41,
      itens: [
        {
          id: "8",
          descricao: "Pavimentação asfáltica de 15km de vias urbanas",
          tipo: "Obra",
          valor: 12000000.00,
          prazo: "Jun/2025",
          prioridade: "Alta",
          justificativa: "Melhoria da mobilidade urbana e escoamento de tráfego."
        },
        {
          id: "9",
          descricao: "Manutenção corretiva de iluminação pública (LED)",
          tipo: "Serviço",
          valor: 1500000.00,
          prazo: "Contínuo",
          prioridade: "Média",
          justificativa: "Substituição de lâmpadas queimadas e modernização."
        }
      ]
    },
    {
      nome: "SECRETARIA MUNICIPAL DE TURISMO",
      sigla: "SETUR",
      corGrafico: "#22c55e", // Green-500
      valorTotal: 17631026.96, // ~6%
      quantidadeItens: 36,
      itens: [
        {
          id: "10",
          descricao: "Realização do Festival Gastronômico de Camocim",
          tipo: "Serviço",
          valor: 800000.00,
          prazo: "Jul/2025",
          prioridade: "Alta",
          justificativa: "Promoção do turismo e cultura local na alta estação."
        },
        {
          id: "11",
          descricao: "Sinalização turística bilíngue",
          tipo: "Obra",
          valor: 350000.00,
          prazo: "Abr/2025",
          prioridade: "Média",
          justificativa: "Orientação adequada aos visitantes estrangeiros."
        }
      ]
    },
    {
      nome: "SECRETARIA DE SAÚDE",
      sigla: "SMS",
      corGrafico: "#3b82f6", // Blue-500
      valorTotal: 14692522.47, // ~5%
      quantidadeItens: 30,
      itens: [
        {
          id: "12",
          descricao: "Aquisição de Tomógrafo Computadorizado 64 canais",
          tipo: "Material",
          valor: 2500000.00,
          prazo: "Ago/2025",
          prioridade: "Altíssima",
          justificativa: "Diagnóstico precoce e redução de encaminhamentos para a capital."
        },
         {
          id: "13",
          descricao: "Insumos Hospitalares (Medicamentos e Descartáveis)",
          tipo: "Material",
          valor: 5000000.00,
          prazo: "Trimestral",
          prioridade: "Altíssima",
          justificativa: "Abastecimento regular da UPA e postos de saúde."
        }
      ]
    },
     {
      nome: "DEMAIS SECRETARIAS",
      sigla: "OUTROS",
      corGrafico: "#94a3b8", // Slate-400
      valorTotal: 67600000.00, // Restante
      quantidadeItens: 146,
      itens: []
    }
  ]
};
