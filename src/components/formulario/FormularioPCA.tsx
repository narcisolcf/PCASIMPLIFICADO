/**
 * Componente Principal: Formulário PCA (Adaptado para react-hook-form)
 * Gerencia todo o fluxo de preenchimento e envio da Requisição PCA
 *
 * @version 2.0 - Refatorado para usar react-hook-form + Controller
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Plus, Send, CheckCircle, AlertCircle } from "lucide-react";
import { DadosRequisitante } from "./DadosRequisitante";
import { ItemContratacao } from "./ItemContratacao";
import { useFormularioPCA } from "@/hooks/useFormularioPCA";

export function FormularioPCA() {
  // Novo hook API com react-hook-form
  const {
    form,
    itemsField,
    enviando,
    enviado,
    resultado,
    submitPCA,
    resetarFormulario,
    adicionarItem,
    removerItem,
    calcularValorTotal,
  } = useFormularioPCA();

  // Watch current form values for display
  const requisitante = form.watch("requisitante");
  const itens = form.watch("itens");

  // Calculate total value from watched items
  const valorTotalGeral = itens.reduce((acc, item) => acc + (item.valorTotal || 0), 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Tela de sucesso
  if (enviado && resultado) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <div className="flex flex-col items-center text-center gap-4">
              <CheckCircle className="h-16 w-16 text-green-600" />
              <div>
                <CardTitle className="text-2xl text-green-800">
                  Requisição PCA Enviada com Sucesso!
                </CardTitle>
                <CardDescription className="text-green-700 mt-2">
                  {resultado.mensagem}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="bg-white rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-800 mb-4">Detalhes da Requisição:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">ID da Requisição:</span>
                  <span className="font-mono font-medium">{resultado.dados?.pcaId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Número de Itens:</span>
                  <span className="font-medium">{resultado.dados?.numeroItens}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Valor Total:</span>
                  <span className="font-medium text-green-700">
                    {formatCurrency(resultado.dados?.valorTotal || 0)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-3">
              <Button onClick={resetarFormulario} size="lg">
                Enviar Nova Requisição
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Formulário principal com react-hook-form submission
  return (
    <form onSubmit={form.handleSubmit(submitPCA)} className="max-w-6xl mx-auto">
      {/* Seção 1: Dados do Requisitante */}
      <DadosRequisitante form={form} />

      {/* Seção 2: Itens a Contratar */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-blue-600">2. ITENS A CONTRATAR EM 2025</CardTitle>
          <CardDescription>
            Adicione os materiais, serviços, obras ou serviços de engenharia que deseja contratar
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {itemsField.fields.map((field, index) => (
            <ItemContratacao
              key={field.id}
              form={form}
              index={index}
              numero={index + 1}
              onRemover={() => removerItem(index)}
              podeRemover={itemsField.fields.length > 1}
              calcularValorTotal={calcularValorTotal}
            />
          ))}

          {/* Botão Adicionar Item */}
          <div className="flex justify-between items-center pt-4 border-t">
            <Button type="button" onClick={adicionarItem} variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Mais Um Item
            </Button>

            <div className="text-right">
              <p className="text-sm text-muted-foreground">Valor Total da Requisição</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(valorTotalGeral)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Erros de Formulário Geral (exibidos pelo react-hook-form) */}
      {form.formState.errors.itens && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erros de Validação</AlertTitle>
          <AlertDescription>
            {form.formState.errors.itens.message || "Corrija os erros nos itens acima antes de enviar."}
          </AlertDescription>
        </Alert>
      )}

      {/* Seção 3: Informações e Botão de Envio */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>3. REVISÃO E ENVIO</CardTitle>
          <CardDescription>
            Revise as informações antes de enviar a requisição PCA
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Importante</AlertTitle>
            <AlertDescription>
              Ao enviar esta requisição, os dados serão salvos no sistema e poderão ser
              revisados posteriormente. A requisição será criada com status "Rascunho" e
              poderá ser editada antes da aprovação final.
            </AlertDescription>
          </Alert>

          <div className="bg-muted rounded-lg p-4 mb-6">
            <h4 className="font-semibold mb-3">Resumo da Requisição:</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Unidade Gestora</p>
                <p className="font-medium">{requisitante.unidadeGestoraNome || "-"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Área Requisitante</p>
                <p className="font-medium">{requisitante.areaRequisitanteNome || "-"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Responsável</p>
                <p className="font-medium">{requisitante.responsavel || "-"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Número de Itens</p>
                <p className="font-medium">{itens.length}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Valor Total</p>
                <p className="font-medium text-primary">{formatCurrency(valorTotalGeral)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Contato</p>
                <p className="font-medium">{requisitante.email || "-"}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={resetarFormulario}
              disabled={enviando}
            >
              Limpar Formulário
            </Button>
            <Button type="submit" disabled={enviando} size="lg" className="gap-2">
              {enviando ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Enviar Requisição PCA
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
