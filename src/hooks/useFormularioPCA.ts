/**
 * Hook: Gerenciamento do Formulário PCA (Plano de Contratações Anual)
 *
 * Arquitetura: Local-First Form State (react-hook-form + zod) -> Supabase Transactional Insert
 *
 * @module useFormularioPCA
 * @description Hook responsável pela lógica de estado, validação e persistência do formulário PCA.
 *              Segue o padrão SoC (Separation of Concerns): apenas lógica, zero UI.
 *
 * Fluxo de Salvamento:
 * 1. Validação local (Zod)
 * 2. Autenticação (Supabase Auth)
 * 3. Criação do DFD (Documento de Formalização de Demanda)
 * 4. Inserção em lote dos itens (materiais_servicos)
 * 5. Associação do responsável (responsaveis_dfd)
 * 6. Feedback ao usuário (toast)
 */

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// ============================================================================
// SCHEMAS ZOD (Validação)
// ============================================================================

/**
 * Schema: Dados do Requisitante
 * Validações compatíveis com as tabelas: uasgs, areas_requisitantes, responsaveis_dfd
 */
const DadosRequisitanteSchema = z.object({
  unidadeGestoraId: z
    .string()
    .uuid("ID da unidade gestora inválido")
    .min(1, "Selecione uma unidade gestora"),

  unidadeGestoraNome: z.string().min(1, "Nome da unidade é obrigatório"),

  areaRequisitanteId: z
    .string()
    .uuid("ID da área requisitante inválido")
    .min(1, "Selecione uma área requisitante"),

  areaRequisitanteNome: z.string().min(1, "Nome da área é obrigatório"),

  responsavel: z
    .string()
    .min(3, "Nome do responsável deve ter no mínimo 3 caracteres")
    .max(255, "Nome muito longo"),

  cargo: z
    .string()
    .min(3, "Cargo deve ter no mínimo 3 caracteres")
    .max(100, "Cargo muito longo"),

  email: z
    .string()
    .email("E-mail inválido")
    .min(1, "E-mail é obrigatório"),

  telefone: z
    .string()
    .regex(/^\(\d{2}\)\s?\d{4,5}-?\d{4}$/, "Telefone inválido. Use (XX) XXXXX-XXXX")
    .min(1, "Telefone é obrigatório"),
});

/**
 * Schema: Item de Contratação
 * Compatível com tabela: materiais_servicos
 *
 * ATENÇÃO: Campos 'prioridade' e 'data_pretendida' requerem migration no banco.
 * Ver: supabase/migrations/20251209000000_add_pca_fields.sql
 */
const ItemContratacaoSchema = z.object({
  id: z.string().uuid(),

  tipo: z.enum(["Material", "Serviço", "Obra", "Serviço de Engenharia"], {
    errorMap: () => ({ message: "Tipo de item inválido" }),
  }),

  descricao: z
    .string()
    .min(10, "Descrição deve ter no mínimo 10 caracteres")
    .max(1000, "Descrição muito longa"),

  unidadeFornecimento: z
    .string()
    .min(1, "Unidade de fornecimento é obrigatória")
    .max(20, "Unidade muito longa"),

  quantidade: z
    .number()
    .int("Quantidade deve ser um número inteiro")
    .positive("Quantidade deve ser maior que zero")
    .min(1, "Quantidade mínima é 1"),

  valorUnitario: z
    .number()
    .positive("Valor unitário deve ser maior que zero")
    .multipleOf(0.01, "Valor unitário deve ter no máximo 2 casas decimais"),

  valorTotal: z.number().nonnegative("Valor total não pode ser negativo"),

  // ⚠️ MIGRATION NECESSÁRIA: Campo não existe na tabela materiais_servicos atual
  // Após aplicar migration 20251209000000_add_pca_fields.sql, este campo será persistido
  prioridade: z.enum(["Alta", "Média", "Baixa"], {
    errorMap: () => ({ message: "Prioridade inválida" }),
  }),

  // ⚠️ MIGRATION NECESSÁRIA: Campo não existe na tabela materiais_servicos atual
  // Após aplicar migration 20251209000000_add_pca_fields.sql, este campo será persistido
  dataPretendida: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD")
    .refine(
      (date) => {
        const d = new Date(date);
        return d >= new Date("2025-01-01") && d <= new Date("2025-12-31");
      },
      { message: "Data deve estar dentro do exercício de 2025" }
    ),

  justificativa: z
    .string()
    .min(50, "Justificativa deve ter no mínimo 50 caracteres (Lei 14.133/2021, art. 11, II)")
    .max(2000, "Justificativa muito longa"),
});

/**
 * Schema: Formulário PCA Completo
 * Orquestra validação de requisitante + múltiplos itens
 */
export const FormularioPCASchema = z.object({
  requisitante: DadosRequisitanteSchema,
  itens: z
    .array(ItemContratacaoSchema)
    .min(1, "Adicione pelo menos 1 item para contratar")
    .max(50, "Máximo de 50 itens por requisição"),
});

// ============================================================================
// TIPOS TYPESCRIPT (Inferidos dos Schemas)
// ============================================================================

export type DadosRequisitante = z.infer<typeof DadosRequisitanteSchema>;
export type ItemContratacao = z.infer<typeof ItemContratacaoSchema>;
export type FormularioPCAData = z.infer<typeof FormularioPCASchema>;

/**
 * Tipo: Resultado do envio
 */
export interface ResultadoEnvioPCA {
  sucesso: boolean;
  mensagem: string;
  dados?: {
    pcaId: string;
    numeroItens: number;
    valorTotal: number;
  };
}

// ============================================================================
// CONSTANTES E HELPERS
// ============================================================================

/**
 * Valores padrão para novo item
 */
const ITEM_VAZIO: Omit<ItemContratacao, "id"> = {
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

/**
 * Gera ID único para novos itens (client-side)
 */
function gerarIdItem(): string {
  return crypto.randomUUID();
}

/**
 * Cria item vazio com ID único
 */
function criarItemVazio(): ItemContratacao {
  return {
    id: gerarIdItem(),
    ...ITEM_VAZIO,
  };
}

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

/**
 * Hook: useFormularioPCA
 *
 * @returns {Object} API do formulário
 * @property {UseFormReturn} form - Instância do react-hook-form
 * @property {FieldArrayMethods} itemsField - Controle do array de itens
 * @property {Function} submitPCA - Função de envio ao Supabase
 * @property {boolean} enviando - Estado de carregamento durante envio
 * @property {boolean} enviado - Flag de sucesso no envio
 * @property {ResultadoEnvioPCA | null} resultado - Resultado do último envio
 *
 * @example
 * const { form, itemsField, submitPCA, enviando } = useFormularioPCA();
 *
 * // Adicionar item
 * itemsField.append(criarItemVazio());
 *
 * // Enviar formulário
 * await submitPCA(form.getValues());
 */
export function useFormularioPCA() {
  const { toast } = useToast();
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [resultado, setResultado] = useState<ResultadoEnvioPCA | null>(null);

  // Configuração do react-hook-form com validação Zod
  const form = useForm<FormularioPCAData>({
    resolver: zodResolver(FormularioPCASchema),
    defaultValues: {
      requisitante: {
        unidadeGestoraId: "",
        unidadeGestoraNome: "",
        areaRequisitanteId: "",
        areaRequisitanteNome: "",
        responsavel: "",
        cargo: "",
        email: "",
        telefone: "",
      },
      itens: [criarItemVazio()],
    },
    mode: "onChange", // Validação em tempo real
  });

  // Controle do array de itens (FieldArray)
  const itemsField = useFieldArray({
    control: form.control,
    name: "itens",
  });

  /**
   * Função: submitPCA
   * Orquestra a inserção transacional no Supabase
   *
   * Fluxo:
   * 1. Valida autenticação do usuário
   * 2. Cria registro na tabela 'dfds' (Documento de Formalização de Demanda)
   * 3. Insere itens em lote na tabela 'materiais_servicos'
   * 4. Associa responsável na tabela 'responsaveis_dfd'
   * 5. Retorna resultado com ID gerado
   *
   * @param {FormularioPCAData} dados - Dados validados do formulário
   * @returns {Promise<ResultadoEnvioPCA>} Resultado da operação
   * @throws {Error} Se houver erro de autenticação ou persistência
   */
  async function submitPCA(dados: FormularioPCAData): Promise<ResultadoEnvioPCA> {
    setEnviando(true);

    try {
      // PASSO 1: Verificar autenticação
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("Você precisa estar autenticado para criar uma requisição PCA");
      }

      // PASSO 2: Calcular valor total geral
      const valorTotalGeral = dados.itens.reduce((acc, item) => acc + item.valorTotal, 0);

      // PASSO 3: Criar DFD (Documento de Formalização de Demanda)
      const { data: dfdData, error: dfdError } = await supabase
        .from("dfds")
        .insert([
          {
            user_id: user.id,
            area_requisitante_id: dados.requisitante.areaRequisitanteId,
            numero_uasg: "", // Será preenchido por trigger ou deixado vazio
            descricao_sucinta: `Requisição PCA 2025 - ${dados.requisitante.unidadeGestoraNome}`,
            justificativa_necessidade: `Requisição criada por ${dados.requisitante.responsavel} (${dados.requisitante.cargo}) via formulário PCA`,
            situacao: "Rascunho",
            prioridade: "Média", // Prioridade geral do DFD (não dos itens)
            valor_total: valorTotalGeral,
          },
        ])
        .select("id")
        .single();

      if (dfdError) {
        console.error("Erro ao criar DFD:", dfdError);
        throw new Error(`Falha ao criar requisição: ${dfdError.message}`);
      }

      const dfdId = dfdData.id;

      // PASSO 4: Inserir itens em lote (materiais_servicos)
      const itensParaInserir = dados.itens.map((item) => ({
        dfd_id: dfdId,
        tipo: item.tipo,
        descricao: item.descricao,
        unidade_medida: item.unidadeFornecimento,
        quantidade: item.quantidade,
        valor_unitario: item.valorUnitario,
        justificativa: item.justificativa,

        // ⚠️ MIGRATION NECESSÁRIA: Campos abaixo só serão persistidos após aplicar migration
        // Descomente as linhas abaixo APÓS executar: supabase/migrations/20251209000000_add_pca_fields.sql
        // prioridade: item.prioridade,
        // data_pretendida: item.dataPretendida,
      }));

      const { error: itensError } = await supabase
        .from("materiais_servicos")
        .insert(itensParaInserir);

      if (itensError) {
        console.error("Erro ao inserir itens:", itensError);

        // Rollback: Deletar DFD criado se inserção de itens falhar
        await supabase.from("dfds").delete().eq("id", dfdId);

        throw new Error(`Falha ao salvar itens: ${itensError.message}`);
      }

      // PASSO 5: Associar responsável (responsaveis_dfd)
      const { error: responsavelError } = await supabase
        .from("responsaveis_dfd")
        .insert([
          {
            dfd_id: dfdId,
            nome: dados.requisitante.responsavel,
            cargo: dados.requisitante.cargo,
            email: dados.requisitante.email,
            telefone: dados.requisitante.telefone,
            funcao: "Requisitante",
          },
        ]);

      if (responsavelError) {
        console.error("Erro ao associar responsável:", responsavelError);
        // Não faz rollback aqui, pois responsável é opcional para o DFD
      }

      // PASSO 6: Preparar resultado de sucesso
      const resultadoSucesso: ResultadoEnvioPCA = {
        sucesso: true,
        mensagem: `Requisição PCA enviada com sucesso! ${dados.itens.length} item(ns) cadastrado(s).`,
        dados: {
          pcaId: dfdId,
          numeroItens: dados.itens.length,
          valorTotal: valorTotalGeral,
        },
      };

      setResultado(resultadoSucesso);
      setEnviado(true);

      toast({
        title: "✅ Requisição enviada!",
        description: resultadoSucesso.mensagem,
      });

      return resultadoSucesso;
    } catch (erro) {
      const mensagemErro = erro instanceof Error ? erro.message : "Erro desconhecido ao enviar requisição";

      const resultadoErro: ResultadoEnvioPCA = {
        sucesso: false,
        mensagem: mensagemErro,
      };

      setResultado(resultadoErro);

      toast({
        title: "❌ Erro ao enviar",
        description: mensagemErro,
        variant: "destructive",
      });

      console.error("Erro em submitPCA:", erro);
      throw erro;
    } finally {
      setEnviando(false);
    }
  }

  /**
   * Função: resetarFormulario
   * Limpa todos os campos e retorna ao estado inicial
   */
  function resetarFormulario() {
    form.reset();
    itemsField.replace([criarItemVazio()]);
    setEnviado(false);
    setResultado(null);
  }

  /**
   * Função: adicionarItem
   * Adiciona um novo item vazio ao array
   */
  function adicionarItem() {
    itemsField.append(criarItemVazio());
  }

  /**
   * Função: removerItem
   * Remove um item do array (mínimo 1 item)
   * @param {number} index - Índice do item a ser removido
   */
  function removerItem(index: number) {
    if (itemsField.fields.length > 1) {
      itemsField.remove(index);
    } else {
      toast({
        title: "⚠️ Atenção",
        description: "É necessário ter pelo menos 1 item na requisição",
        variant: "destructive",
      });
    }
  }

  /**
   * Função: calcularValorTotal
   * Recalcula valor total de um item (quantidade × valorUnitario)
   * @param {number} index - Índice do item
   */
  function calcularValorTotal(index: number) {
    const item = form.getValues(`itens.${index}`);
    const valorTotal = (item.quantidade || 0) * (item.valorUnitario || 0);
    form.setValue(`itens.${index}.valorTotal`, valorTotal, { shouldValidate: true });
  }

  // API pública do hook
  return {
    // React Hook Form
    form,
    itemsField,

    // Estado
    enviando,
    enviado,
    resultado,

    // Ações
    submitPCA,
    resetarFormulario,
    adicionarItem,
    removerItem,
    calcularValorTotal,

    // Helpers
    criarItemVazio,
  };
}
