/**
 * Hook: Gerenciamento do Formulário PCA
 * Adaptado do MVP para integração com Supabase
 * Mantém padrão local-first para melhor UX
 */
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type TipoItem = "Material" | "Serviço" | "Obra" | "Serviço de Engenharia";
export type GrauPrioridade = "Alta" | "Média" | "Baixa";

export interface DadosRequisitante {
  unidadeGestoraId: string;
  unidadeGestoraNome: string;
  areaRequisitanteId: string;
  areaRequisitanteNome: string;
  responsavel: string;
  cargo: string;
  email: string;
  telefone: string;
}

export interface ItemContratacao {
  id: string;
  tipo: TipoItem;
  descricao: string;
  unidadeFornecimento: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  prioridade: GrauPrioridade;
  dataPretendida: string;
  justificativa: string;
}

interface ErrosValidacao {
  requisitante?: Partial<Record<keyof DadosRequisitante, string>>;
  itens?: string[];
  geral?: string;
}

interface ResultadoEnvio {
  sucesso: boolean;
  mensagem: string;
  dados?: {
    pcaId: string;
    numeroItens: number;
    valorTotal: number;
  };
}

const REQUISITANTE_INICIAL: DadosRequisitante = {
  unidadeGestoraId: "",
  unidadeGestoraNome: "",
  areaRequisitanteId: "",
  areaRequisitanteNome: "",
  responsavel: "",
  cargo: "",
  email: "",
  telefone: "",
};

function criarItemVazio(): ItemContratacao {
  return {
    id: crypto.randomUUID(),
    tipo: "Material",
    descricao: "",
    unidadeFornecimento: "UN",
    quantidade: 1,
    valorUnitario: 0,
    valorTotal: 0,
    prioridade: "Média",
    dataPretendida: "",
    justificativa: "",
  };
}

export function useFormularioPCA() {
  const [requisitante, setRequisitante] = useState<DadosRequisitante>(REQUISITANTE_INICIAL);
  const [itens, setItens] = useState<ItemContratacao[]>([criarItemVazio()]);
  const [erros, setErros] = useState<ErrosValidacao>({});
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [resultadoEnvio, setResultadoEnvio] = useState<ResultadoEnvio | null>(null);
  const { toast } = useToast();

  /**
   * Validações do formulário
   */
  function validarFormulario(): boolean {
    const novosErros: ErrosValidacao = {};

    // Validar dados do requisitante
    if (!requisitante.unidadeGestoraId) {
      novosErros.requisitante = { ...novosErros.requisitante, unidadeGestoraId: "Selecione uma unidade gestora" };
    }
    if (!requisitante.areaRequisitanteId) {
      novosErros.requisitante = { ...novosErros.requisitante, areaRequisitanteId: "Selecione uma área requisitante" };
    }
    if (!requisitante.responsavel.trim()) {
      novosErros.requisitante = { ...novosErros.requisitante, responsavel: "Nome do responsável é obrigatório" };
    }
    if (!requisitante.cargo.trim()) {
      novosErros.requisitante = { ...novosErros.requisitante, cargo: "Cargo/função é obrigatório" };
    }
    if (!requisitante.email.trim()) {
      novosErros.requisitante = { ...novosErros.requisitante, email: "E-mail é obrigatório" };
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(requisitante.email)) {
      novosErros.requisitante = { ...novosErros.requisitante, email: "E-mail inválido" };
    }
    if (!requisitante.telefone.trim()) {
      novosErros.requisitante = { ...novosErros.requisitante, telefone: "Telefone é obrigatório" };
    }

    // Validar itens
    if (itens.length === 0) {
      novosErros.geral = "Adicione pelo menos 1 item para contratar";
    } else {
      novosErros.itens = [];
      itens.forEach((item, index) => {
        if (!item.descricao.trim()) {
          novosErros.itens![index] = `Item ${index + 1}: Descrição é obrigatória`;
        }
        if (item.quantidade <= 0) {
          novosErros.itens![index] = `Item ${index + 1}: Quantidade deve ser maior que zero`;
        }
        if (item.valorUnitario <= 0) {
          novosErros.itens![index] = `Item ${index + 1}: Valor unitário deve ser maior que zero`;
        }
        if (!item.justificativa.trim()) {
          novosErros.itens![index] = `Item ${index + 1}: Justificativa é obrigatória (Lei 14.133/2021)`;
        }
        if (!item.dataPretendida) {
          novosErros.itens![index] = `Item ${index + 1}: Data pretendida é obrigatória`;
        }
      });
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0 ||
           (Object.keys(novosErros).length === 1 && novosErros.itens?.every(e => !e));
  }

  /**
   * Enviar formulário para o Supabase
   */
  async function enviarFormulario() {
    if (!validarFormulario()) {
      toast({
        title: "Erro de Validação",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setEnviando(true);
    setErros({});

    try {
      // Verificar autenticação
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Você precisa estar autenticado");
      }

      // Calcular valor total
      const valorTotal = itens.reduce((acc, item) => acc + item.valorTotal, 0);

      // Criar requisição PCA (usando tabela DFDs adaptada)
      const { data: pcaData, error: pcaError } = await supabase
        .from("dfds")
        .insert([
          {
            user_id: user.id,
            area_requisitante_id: requisitante.areaRequisitanteId,
            descricao_sucinta: `Requisição PCA - ${requisitante.unidadeGestoraNome}`,
            justificativa_necessidade: `Requisição criada por ${requisitante.responsavel} (${requisitante.cargo})`,
            situacao: "Rascunho",
            valor_total: valorTotal,
            prioridade: "Média", // Prioridade geral do PCA
          },
        ])
        .select()
        .single();

      if (pcaError) throw pcaError;

      // Inserir itens em lote
      const itensParaSalvar = itens.map((item) => ({
        dfd_id: pcaData.id,
        tipo: item.tipo,
        descricao: item.descricao,
        unidade_medida: item.unidadeFornecimento,
        quantidade: item.quantidade,
        valor_unitario: item.valorUnitario,
        justificativa: item.justificativa,
        // Novos campos (precisarão da migration):
        // prioridade: item.prioridade,
        // data_pretendida: item.dataPretendida,
      }));

      const { error: itensError } = await supabase
        .from("materiais_servicos")
        .insert(itensParaSalvar);

      if (itensError) throw itensError;

      // Criar registro de responsável
      const { error: respError } = await supabase
        .from("responsaveis_dfd")
        .insert([
          {
            dfd_id: pcaData.id,
            nome: requisitante.responsavel,
            cargo: requisitante.cargo,
            email: requisitante.email,
            telefone: requisitante.telefone,
            funcao: "Requisitante",
          },
        ]);

      if (respError) throw respError;

      // Sucesso!
      const resultado: ResultadoEnvio = {
        sucesso: true,
        mensagem: `Requisição PCA enviada com sucesso! ${itens.length} item(ns) cadastrado(s).`,
        dados: {
          pcaId: pcaData.id,
          numeroItens: itens.length,
          valorTotal,
        },
      };

      setResultadoEnvio(resultado);
      setEnviado(true);

      toast({
        title: "Sucesso!",
        description: resultado.mensagem,
      });
    } catch (erro: any) {
      console.error("Erro ao enviar PCA:", erro);

      const mensagemErro = erro.message || "Erro ao enviar requisição. Verifique os dados.";

      setErros({
        geral: mensagemErro,
      });

      toast({
        title: "Erro ao enviar",
        description: mensagemErro,
        variant: "destructive",
      });
    } finally {
      setEnviando(false);
    }
  }

  /**
   * Gerenciamento de itens
   */
  function adicionarItem() {
    setItens([...itens, criarItemVazio()]);
  }

  function atualizarItem(index: number, item: ItemContratacao) {
    const novosItens = [...itens];
    novosItens[index] = item;
    setItens(novosItens);
  }

  function removerItem(index: number) {
    if (itens.length > 1) {
      const novosItens = itens.filter((_, i) => i !== index);
      setItens(novosItens);
    } else {
      toast({
        title: "Atenção",
        description: "É necessário ter pelo menos 1 item",
        variant: "destructive",
      });
    }
  }

  /**
   * Reset do formulário
   */
  function resetarFormulario() {
    setRequisitante(REQUISITANTE_INICIAL);
    setItens([criarItemVazio()]);
    setErros({});
    setEnviando(false);
    setEnviado(false);
    setResultadoEnvio(null);
  }

  return {
    // Estado
    requisitante,
    itens,
    erros,
    enviando,
    enviado,
    resultadoEnvio,

    // Ações
    setRequisitante,
    adicionarItem,
    atualizarItem,
    removerItem,
    enviarFormulario,
    resetarFormulario,
  };
}
