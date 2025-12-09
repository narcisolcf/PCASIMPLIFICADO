/**
 * Componente: Dados do Requisitante
 * Seção 1 do formulário PCA - Identificação da Unidade
 * Adaptado do MVP para usar Shadcn-ui e Supabase
 */
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle } from "lucide-react";
import { DadosRequisitante as DadosRequisitanteType } from "@/hooks/useFormularioPCA";
import { useUASGs } from "@/hooks/useUASGs";
import { useAreasRequisitantes } from "@/hooks/useAreasRequisitantes";

interface Props {
  dados: DadosRequisitanteType;
  onChange: (dados: DadosRequisitanteType) => void;
  erros?: Partial<Record<keyof DadosRequisitanteType, string>>;
}

export function DadosRequisitante({ dados, onChange, erros = {} }: Props) {
  const { uasgs, loading: loadingUASGs } = useUASGs();
  const { areas, loading: loadingAreas, reload: reloadAreas } = useAreasRequisitantes(dados.unidadeGestoraId || undefined);

  function handleUnidadeChange(unidadeId: string) {
    const unidadeSelecionada = uasgs.find((u) => u.id === unidadeId);

    onChange({
      ...dados,
      unidadeGestoraId: unidadeId,
      unidadeGestoraNome: unidadeSelecionada?.nome || "",
      areaRequisitanteId: "", // Reset área ao mudar unidade
      areaRequisitanteNome: "",
    });
  }

  function handleAreaChange(areaId: string) {
    const areaSelecionada = areas.find((a) => a.id === areaId);

    onChange({
      ...dados,
      areaRequisitanteId: areaId,
      areaRequisitanteNome: areaSelecionada?.nome || "",
    });
  }

  function handleChange(campo: keyof DadosRequisitanteType, valor: string) {
    onChange({ ...dados, [campo]: valor });
  }

  // Recarregar áreas quando unidade mudar
  useEffect(() => {
    if (dados.unidadeGestoraId) {
      reloadAreas();
    }
  }, [dados.unidadeGestoraId]);

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
          {/* Unidade Gestora */}
          <div className="md:col-span-2">
            <Label htmlFor="unidadeGestora">
              Unidade Gestora / Secretaria <span className="text-destructive">*</span>
            </Label>
            <Select
              value={dados.unidadeGestoraId}
              onValueChange={handleUnidadeChange}
              disabled={loadingUASGs}
            >
              <SelectTrigger id="unidadeGestora" className={erros.unidadeGestoraId ? "border-destructive" : ""}>
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
            {erros.unidadeGestoraId && (
              <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                <AlertCircle size={14} />
                {erros.unidadeGestoraId}
              </p>
            )}
          </div>

          {/* Área Requisitante */}
          <div className="md:col-span-2">
            <Label htmlFor="areaRequisitante">
              Área Requisitante <span className="text-destructive">*</span>
            </Label>
            <Select
              value={dados.areaRequisitanteId}
              onValueChange={handleAreaChange}
              disabled={!dados.unidadeGestoraId || loadingAreas}
            >
              <SelectTrigger id="areaRequisitante" className={erros.areaRequisitanteId ? "border-destructive" : ""}>
                <SelectValue
                  placeholder={
                    !dados.unidadeGestoraId
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
            {erros.areaRequisitanteId && (
              <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                <AlertCircle size={14} />
                {erros.areaRequisitanteId}
              </p>
            )}
            {!dados.unidadeGestoraId && (
              <p className="text-sm text-muted-foreground mt-1">
                Selecione uma Unidade Gestora para ver as áreas disponíveis
              </p>
            )}
          </div>

          {/* Responsável */}
          <div>
            <Label htmlFor="responsavel">
              Responsável <span className="text-destructive">*</span>
            </Label>
            <Input
              id="responsavel"
              value={dados.responsavel}
              onChange={(e) => handleChange("responsavel", e.target.value)}
              placeholder="Nome completo do responsável"
              className={erros.responsavel ? "border-destructive" : ""}
            />
            {erros.responsavel && (
              <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                <AlertCircle size={14} />
                {erros.responsavel}
              </p>
            )}
          </div>

          {/* Cargo */}
          <div>
            <Label htmlFor="cargo">
              Cargo / Função <span className="text-destructive">*</span>
            </Label>
            <Input
              id="cargo"
              value={dados.cargo}
              onChange={(e) => handleChange("cargo", e.target.value)}
              placeholder="Ex: Secretário de Educação"
              className={erros.cargo ? "border-destructive" : ""}
            />
            {erros.cargo && (
              <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                <AlertCircle size={14} />
                {erros.cargo}
              </p>
            )}
          </div>

          {/* E-mail */}
          <div>
            <Label htmlFor="email">
              E-mail <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={dados.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="email@camocim.ce.gov.br"
              className={erros.email ? "border-destructive" : ""}
            />
            {erros.email && (
              <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                <AlertCircle size={14} />
                {erros.email}
              </p>
            )}
          </div>

          {/* Telefone */}
          <div>
            <Label htmlFor="telefone">
              Telefone <span className="text-destructive">*</span>
            </Label>
            <Input
              id="telefone"
              type="tel"
              value={dados.telefone}
              onChange={(e) => handleChange("telefone", e.target.value)}
              placeholder="(88) 99999-9999"
              className={erros.telefone ? "border-destructive" : ""}
            />
            {erros.telefone && (
              <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                <AlertCircle size={14} />
                {erros.telefone}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
