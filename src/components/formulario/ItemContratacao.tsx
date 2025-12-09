/**
 * Componente: Item de Contratação (Adaptado para react-hook-form)
 * Representa um item individual no formulário PCA (repetível)
 *
 * @version 2.0 - Refatorado para usar react-hook-form + Controller
 */
import { UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, AlertCircle, FileText } from "lucide-react";
import { FormularioPCAData } from "@/hooks/useFormularioPCA";

interface Props {
  form: UseFormReturn<FormularioPCAData>;
  index: number;
  numero: number;
  onRemover: () => void;
  podeRemover: boolean;
  calcularValorTotal: (index: number) => void;
}

// Tipos inferidos do schema Zod
type TipoItem = "Material" | "Serviço" | "Obra" | "Serviço de Engenharia";
type GrauPrioridade = "Alta" | "Média" | "Baixa";

const TIPOS_ITEM: Array<{ valor: TipoItem; texto: string }> = [
  { valor: "Material", texto: "Material" },
  { valor: "Serviço", texto: "Serviço" },
  { valor: "Obra", texto: "Obra" },
  { valor: "Serviço de Engenharia", texto: "Serviço de Engenharia" },
];

const PRIORIDADES: Array<{ valor: GrauPrioridade; texto: string; cor: string }> = [
  { valor: "Alta", texto: "Alta", cor: "destructive" },
  { valor: "Média", texto: "Média", cor: "default" },
  { valor: "Baixa", texto: "Baixa", cor: "secondary" },
];

/**
 * Componente de apresentação para item de contratação
 * Integrado com react-hook-form via Controller (para Selects) e register (para Inputs)
 */
export function ItemContratacao({ form, index, numero, onRemover, podeRemover, calcularValorTotal }: Props) {
  // Watch current item values for display and calculations
  const item = form.watch(`itens.${index}`);
  const errors = form.formState.errors.itens?.[index];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const prioridadeInfo = PRIORIDADES.find((p) => p.valor === item?.prioridade);

  return (
    <Card className="mb-4 border-l-4 border-l-primary">
      <CardHeader className="bg-muted/50">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg">
              Item {numero.toString().padStart(2, "0")}
            </CardTitle>
            <Badge variant={prioridadeInfo?.cor as any}>
              Prioridade: {item?.prioridade || "Média"}
            </Badge>
            <Badge variant="outline">{item?.tipo || "Material"}</Badge>
          </div>
          {podeRemover && (
            <Button variant="ghost" size="sm" onClick={onRemover} type="button">
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tipo do Item - CONTROLLED (Select Shadcn requer Controller) */}
          <div>
            <Label htmlFor={`tipo-${index}`}>
              Tipo do Item <span className="text-destructive">*</span>
            </Label>
            <Controller
              name={`itens.${index}.tipo`}
              control={form.control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id={`tipo-${index}`}
                    className={`bg-white text-gray-900 ${errors?.tipo ? "border-destructive" : ""}`}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_ITEM.map((tipo) => (
                      <SelectItem key={tipo.valor} value={tipo.valor}>
                        {tipo.texto}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors?.tipo && (
              <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.tipo.message}
              </p>
            )}
          </div>

          {/* Prioridade - CONTROLLED */}
          <div>
            <Label htmlFor={`prioridade-${index}`}>
              Grau de Prioridade <span className="text-destructive">*</span>
            </Label>
            <Controller
              name={`itens.${index}.prioridade`}
              control={form.control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id={`prioridade-${index}`}
                    className={`bg-white text-gray-900 ${errors?.prioridade ? "border-destructive" : ""}`}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORIDADES.map((prioridade) => (
                      <SelectItem key={prioridade.valor} value={prioridade.valor}>
                        {prioridade.texto}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors?.prioridade && (
              <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.prioridade.message}
              </p>
            )}
          </div>

          {/* Descrição do Objeto - REGISTERED */}
          <div className="md:col-span-2">
            <Label htmlFor={`descricao-${index}`}>
              Descrição do Objeto <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id={`descricao-${index}`}
              {...form.register(`itens.${index}.descricao`)}
              placeholder="Seja específico. Ex: Computador desktop, processador i5, 8GB RAM, SSD 256GB"
              rows={3}
              className={`bg-white text-gray-900 ${errors?.descricao ? "border-destructive" : ""}`}
            />
            {errors?.descricao ? (
              <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.descricao.message}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                <AlertCircle size={14} />
                Evite descrições genéricas. Detalhe especificações técnicas.
              </p>
            )}
          </div>

          {/* Unidade de Fornecimento - REGISTERED */}
          <div>
            <Label htmlFor={`unidade-${index}`}>
              Unidade de Fornecimento <span className="text-destructive">*</span>
            </Label>
            <Input
              id={`unidade-${index}`}
              {...form.register(`itens.${index}.unidadeFornecimento`)}
              placeholder="un, kg, m², serviço, mês"
              className={`bg-white text-gray-900 ${errors?.unidadeFornecimento ? "border-destructive" : ""}`}
            />
            {errors?.unidadeFornecimento && (
              <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.unidadeFornecimento.message}
              </p>
            )}
          </div>

          {/* Quantidade - REGISTERED (com cálculo automático) */}
          <div>
            <Label htmlFor={`quantidade-${index}`}>
              Quantidade <span className="text-destructive">*</span>
            </Label>
            <Input
              id={`quantidade-${index}`}
              type="number"
              min="1"
              step="1"
              {...form.register(`itens.${index}.quantidade`, {
                valueAsNumber: true,
                onChange: () => calcularValorTotal(index),
              })}
              className={`bg-white text-gray-900 ${errors?.quantidade ? "border-destructive" : ""}`}
            />
            {errors?.quantidade && (
              <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.quantidade.message}
              </p>
            )}
          </div>

          {/* Valor Unitário - REGISTERED (com cálculo automático) */}
          <div>
            <Label htmlFor={`valorUnitario-${index}`}>
              Valor Unitário Estimado (R$) <span className="text-destructive">*</span>
            </Label>
            <Input
              id={`valorUnitario-${index}`}
              type="number"
              min="0"
              step="0.01"
              {...form.register(`itens.${index}.valorUnitario`, {
                valueAsNumber: true,
                onChange: () => calcularValorTotal(index),
              })}
              className={`bg-white text-gray-900 ${errors?.valorUnitario ? "border-destructive" : ""}`}
            />
            {errors?.valorUnitario && (
              <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.valorUnitario.message}
              </p>
            )}
          </div>

          {/* Valor Total (Calculado - Read Only) */}
          <div>
            <Label htmlFor={`valorTotal-${index}`}>Valor Total Estimado (R$)</Label>
            <Input
              id={`valorTotal-${index}`}
              type="text"
              value={formatCurrency(item?.valorTotal || 0)}
              disabled
              className="bg-muted font-semibold text-gray-900"
            />
          </div>

          {/* Data Pretendida - REGISTERED */}
          <div className="md:col-span-2">
            <Label htmlFor={`dataPretendida-${index}`}>
              Data Pretendida para Contratação <span className="text-destructive">*</span>
            </Label>
            <Input
              id={`dataPretendida-${index}`}
              type="date"
              {...form.register(`itens.${index}.dataPretendida`)}
              className={`bg-white text-gray-900 ${errors?.dataPretendida ? "border-destructive" : ""}`}
            />
            {errors?.dataPretendida && (
              <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.dataPretendida.message}
              </p>
            )}
          </div>

          {/* Justificativa - REGISTERED */}
          <div className="md:col-span-2">
            <Label htmlFor={`justificativa-${index}`}>
              Justificativa <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id={`justificativa-${index}`}
              {...form.register(`itens.${index}.justificativa`)}
              placeholder="Por que esta contratação é necessária? Vincular à missão institucional da secretaria."
              rows={4}
              className={`bg-white text-gray-900 ${errors?.justificativa ? "border-destructive" : ""}`}
            />
            {errors?.justificativa ? (
              <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.justificativa.message}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                <FileText size={14} />
                Obrigatório pela Lei 14.133/2021, art. 11, II
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
