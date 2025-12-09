/**
 * Componente: Item de Contratação
 * Representa um item individual no formulário PCA (repetível)
 * Adaptado do MVP com componentes Shadcn-ui
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, AlertCircle, FileText } from "lucide-react";
import { ItemContratacao as ItemType, TipoItem, GrauPrioridade } from "@/hooks/useFormularioPCA";

interface Props {
  item: ItemType;
  numero: number;
  onChange: (item: ItemType) => void;
  onRemover: () => void;
  podeRemover: boolean;
}

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

export function ItemContratacao({ item, numero, onChange, onRemover, podeRemover }: Props) {
  function handleChange(campo: keyof ItemType, valor: any) {
    const itemAtualizado = { ...item, [campo]: valor };

    // Recalcular valor total se quantidade ou valor unitário mudaram
    if (campo === "quantidade" || campo === "valorUnitario") {
      const quantidade = campo === "quantidade" ? valor : item.quantidade;
      const valorUnitario = campo === "valorUnitario" ? valor : item.valorUnitario;
      itemAtualizado.valorTotal = quantidade * valorUnitario;
    }

    onChange(itemAtualizado);
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const prioridadeInfo = PRIORIDADES.find((p) => p.valor === item.prioridade);

  return (
    <Card className="mb-4 border-l-4 border-l-primary">
      <CardHeader className="bg-muted/50">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg">
              Item {numero.toString().padStart(2, "0")}
            </CardTitle>
            <Badge variant={prioridadeInfo?.cor as any}>
              Prioridade: {item.prioridade}
            </Badge>
            <Badge variant="outline">{item.tipo}</Badge>
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
          {/* Tipo do Item */}
          <div>
            <Label htmlFor={`tipo-${item.id}`}>
              Tipo do Item <span className="text-destructive">*</span>
            </Label>
            <Select value={item.tipo} onValueChange={(value) => handleChange("tipo", value as TipoItem)}>
              <SelectTrigger id={`tipo-${item.id}`}>
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
          </div>

          {/* Prioridade */}
          <div>
            <Label htmlFor={`prioridade-${item.id}`}>
              Grau de Prioridade <span className="text-destructive">*</span>
            </Label>
            <Select
              value={item.prioridade}
              onValueChange={(value) => handleChange("prioridade", value as GrauPrioridade)}
            >
              <SelectTrigger id={`prioridade-${item.id}`}>
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
          </div>

          {/* Descrição do Objeto */}
          <div className="md:col-span-2">
            <Label htmlFor={`descricao-${item.id}`}>
              Descrição do Objeto <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id={`descricao-${item.id}`}
              value={item.descricao}
              onChange={(e) => handleChange("descricao", e.target.value)}
              placeholder="Seja específico. Ex: Computador desktop, processador i5, 8GB RAM, SSD 256GB"
              rows={3}
            />
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
              <AlertCircle size={14} />
              Evite descrições genéricas. Detalhe especificações técnicas.
            </p>
          </div>

          {/* Unidade de Fornecimento */}
          <div>
            <Label htmlFor={`unidade-${item.id}`}>
              Unidade de Fornecimento <span className="text-destructive">*</span>
            </Label>
            <Input
              id={`unidade-${item.id}`}
              value={item.unidadeFornecimento}
              onChange={(e) => handleChange("unidadeFornecimento", e.target.value)}
              placeholder="un, kg, m², serviço, mês"
            />
          </div>

          {/* Quantidade */}
          <div>
            <Label htmlFor={`quantidade-${item.id}`}>
              Quantidade <span className="text-destructive">*</span>
            </Label>
            <Input
              id={`quantidade-${item.id}`}
              type="number"
              min="1"
              step="1"
              value={item.quantidade || ""}
              onChange={(e) => handleChange("quantidade", Number(e.target.value))}
            />
          </div>

          {/* Valor Unitário */}
          <div>
            <Label htmlFor={`valorUnitario-${item.id}`}>
              Valor Unitário Estimado (R$) <span className="text-destructive">*</span>
            </Label>
            <Input
              id={`valorUnitario-${item.id}`}
              type="number"
              min="0"
              step="0.01"
              value={item.valorUnitario || ""}
              onChange={(e) => handleChange("valorUnitario", Number(e.target.value))}
            />
          </div>

          {/* Valor Total (Calculado) */}
          <div>
            <Label htmlFor={`valorTotal-${item.id}`}>Valor Total Estimado (R$)</Label>
            <Input
              id={`valorTotal-${item.id}`}
              type="text"
              value={formatCurrency(item.valorTotal || 0)}
              disabled
              className="bg-muted font-semibold"
            />
          </div>

          {/* Data Pretendida */}
          <div className="md:col-span-2">
            <Label htmlFor={`dataPretendida-${item.id}`}>
              Data Pretendida para Contratação <span className="text-destructive">*</span>
            </Label>
            <Input
              id={`dataPretendida-${item.id}`}
              type="date"
              value={item.dataPretendida}
              onChange={(e) => handleChange("dataPretendida", e.target.value)}
            />
          </div>

          {/* Justificativa */}
          <div className="md:col-span-2">
            <Label htmlFor={`justificativa-${item.id}`}>
              Justificativa <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id={`justificativa-${item.id}`}
              value={item.justificativa}
              onChange={(e) => handleChange("justificativa", e.target.value)}
              placeholder="Por que esta contratação é necessária? Vincular à missão institucional da secretaria."
              rows={4}
            />
            <p className="text-sm text-destructive mt-1 flex items-center gap-1">
              <FileText size={14} />
              Obrigatório pela Lei 14.133/2021, art. 11, II
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
