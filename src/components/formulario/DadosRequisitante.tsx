/**
 * Componente: Dados do Requisitante (Adaptado para react-hook-form)
 * Seção 1 do formulário PCA - Identificação da Unidade
 *
 * @version 2.0 - Refatorado para usar react-hook-form + Controller
 */
import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle } from "lucide-react";
import { FormularioPCAData } from "@/hooks/useFormularioPCA";
import { useUASGs } from "@/hooks/useUASGs";
import { useAreasRequisitantes } from "@/hooks/useAreasRequisitantes";

interface Props {
  form: UseFormReturn<FormularioPCAData>;
}

/**
 * Componente de apresentação para dados do requisitante
 * Integrado com react-hook-form via Controller (para Selects) e register (para Inputs)
 */
export function DadosRequisitante({ form }: Props) {
  const { uasgs, loading: loadingUASGs } = useUASGs();

  // Watch para reagir a mudanças na unidade gestora
  const unidadeGestoraId = form.watch("requisitante.unidadeGestoraId");

  const { areas, loading: loadingAreas, reload: reloadAreas } = useAreasRequisitantes(
    unidadeGestoraId || undefined
  );

  // Recarregar áreas quando unidade mudar
  useEffect(() => {
    if (unidadeGestoraId) {
      reloadAreas();
      // Reset área ao mudar unidade
      form.setValue("requisitante.areaRequisitanteId", "");
      form.setValue("requisitante.areaRequisitanteNome", "");
    }
  }, [unidadeGestoraId, reloadAreas, form]);

  // Extrair erros do form state
  const errors = form.formState.errors.requisitante;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-blue-600">1. IDENTIFICAÇÃO DA UNIDADE</CardTitle>
        <CardDescription>
          Dados da unidade gestora e do responsável pela requisição PCA
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Unidade Gestora - CONTROLLED (Select Shadcn requer Controller) */}
          <div className="md:col-span-2">
            <Label htmlFor="unidadeGestora">
              Unidade Gestora / Secretaria <span className="text-destructive">*</span>
            </Label>
            <Controller
              name="requisitante.unidadeGestoraId"
              control={form.control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    // Atualizar nome da unidade selecionada
                    const unidadeSelecionada = uasgs.find((u) => u.id === value);
                    form.setValue("requisitante.unidadeGestoraNome", unidadeSelecionada?.nome || "");
                  }}
                  disabled={loadingUASGs}
                >
                  <SelectTrigger
                    id="unidadeGestora"
                    className={`bg-white text-gray-900 ${errors?.unidadeGestoraId ? "border-destructive" : ""}`}
                  >
                    <SelectValue placeholder={loadingUASGs ? "Carregando..." : "Selecione a Unidade Gestora"} />
                  </SelectTrigger>
                  <SelectContent>
                    {uasgs.map((uasg) => (
                      <SelectItem key={uasg.id} value={uasg.id}>
                        {uasg.nome} ({uasg.numero_uasg})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors?.unidadeGestoraId && (
              <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.unidadeGestoraId.message}
              </p>
            )}
          </div>

          {/* Área Requisitante - CONTROLLED */}
          <div className="md:col-span-2">
            <Label htmlFor="areaRequisitante">
              Área Requisitante <span className="text-destructive">*</span>
            </Label>
            <Controller
              name="requisitante.areaRequisitanteId"
              control={form.control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    // Atualizar nome da área selecionada
                    const areaSelecionada = areas.find((a) => a.id === value);
                    form.setValue("requisitante.areaRequisitanteNome", areaSelecionada?.nome || "");
                  }}
                  disabled={!unidadeGestoraId || loadingAreas}
                >
                  <SelectTrigger
                    id="areaRequisitante"
                    className={`bg-white text-gray-900 ${errors?.areaRequisitanteId ? "border-destructive" : ""}`}
                  >
                    <SelectValue
                      placeholder={
                        !unidadeGestoraId
                          ? "Selecione uma Unidade Gestora primeiro"
                          : loadingAreas
                          ? "Carregando..."
                          : "Selecione a Área Requisitante"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {areas.length === 0 && !loadingAreas ? (
                      <SelectItem value="sem-areas" disabled>
                        Nenhuma área cadastrada para esta unidade
                      </SelectItem>
                    ) : (
                      areas.map((area) => (
                        <SelectItem key={area.id} value={area.id}>
                          {area.nome}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            />
            {errors?.areaRequisitanteId && (
              <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.areaRequisitanteId.message}
              </p>
            )}
            {!unidadeGestoraId && (
              <p className="text-sm text-muted-foreground mt-1">
                Selecione uma Unidade Gestora para ver as áreas disponíveis
              </p>
            )}
          </div>

          {/* Responsável - REGISTERED (Input compatível com register) */}
          <div>
            <Label htmlFor="responsavel">
              Responsável <span className="text-destructive">*</span>
            </Label>
            <Input
              id="responsavel"
              {...form.register("requisitante.responsavel")}
              placeholder="Nome completo do responsável"
              className={`bg-white text-gray-900 ${errors?.responsavel ? "border-destructive" : ""}`}
            />
            {errors?.responsavel && (
              <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.responsavel.message}
              </p>
            )}
          </div>

          {/* Cargo - REGISTERED */}
          <div>
            <Label htmlFor="cargo">
              Cargo / Função <span className="text-destructive">*</span>
            </Label>
            <Input
              id="cargo"
              {...form.register("requisitante.cargo")}
              placeholder="Ex: Secretário de Educação"
              className={`bg-white text-gray-900 ${errors?.cargo ? "border-destructive" : ""}`}
            />
            {errors?.cargo && (
              <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.cargo.message}
              </p>
            )}
          </div>

          {/* E-mail - REGISTERED */}
          <div>
            <Label htmlFor="email">
              E-mail <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              {...form.register("requisitante.email")}
              placeholder="email@camocim.ce.gov.br"
              className={`bg-white text-gray-900 ${errors?.email ? "border-destructive" : ""}`}
            />
            {errors?.email && (
              <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Telefone - REGISTERED */}
          <div>
            <Label htmlFor="telefone">
              Telefone <span className="text-destructive">*</span>
            </Label>
            <Input
              id="telefone"
              type="tel"
              {...form.register("requisitante.telefone")}
              placeholder="(88) 99999-9999"
              className={`bg-white text-gray-900 ${errors?.telefone ? "border-destructive" : ""}`}
            />
            {errors?.telefone && (
              <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.telefone.message}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
