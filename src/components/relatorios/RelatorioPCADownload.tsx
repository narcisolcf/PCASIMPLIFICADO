import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { generatePCAReport, PCAReportData, PCASecretaria } from "@/utils/pca-report-generator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const RelatorioPCADownload = () => {
    const [loading, setLoading] = useState(false);

    const handleDownload = async () => {
        setLoading(true);
        try {
            toast.info("Processando dados...", {
                description: "Isso pode levar alguns segundos."
            });

            // Fetch Real Data
            const { data: areas, error: areasError } = await supabase
                .from("areas_requisitantes")
                .select(`
                    id,
                    nome,
                    numero_uasg,
                    uasgs ( nome ),
                    dfds!inner (
                        id,
                        valor_total,
                        created_at,
                        situacao,
                        materiais_servicos (
                            descricao,
                            tipo,
                            valor_total,
                            justificativa,
                            created_at
                        ),
                        prioridade
                    )
                `)
                .neq('dfds.situacao', 'Rascunho');

            if (areasError) throw areasError;

            // Transform Data
            const secretariasMap: Record<string, PCASecretaria> = {};
            let totalItens = 0;
            let totalValor = 0;
            const currentYear = new Date().getFullYear();

            areas?.forEach(area => {
                const uasgName = area.uasgs?.nome || area.nome;
                const sigla = area.numero_uasg;

                if (!secretariasMap[sigla]) {
                    secretariasMap[sigla] = {
                        nome: uasgName,
                        sigla: sigla,
                        corGrafico: generateColor(sigla),
                        valorTotal: 0,
                        itens: []
                    };
                }

                area.dfds?.forEach(dfd => {
                    dfd.materiais_servicos?.forEach(item => {
                        totalItens++;
                        const valor = item.valor_total || 0;
                        totalValor += valor;
                        secretariasMap[sigla].valorTotal += valor;

                        secretariasMap[sigla].itens.push({
                            tipo: item.tipo as "IT" | "Obra" | "Servico", // Cast enum
                            descricao: item.descricao,
                            valor: valor,
                            prazo: dfd.created_at ? new Date(dfd.created_at).toLocaleDateString() : "-",
                            prioridade: (dfd.prioridade as "Altíssima" | "Alta" | "Média" | "Baixa") || "Média",
                            justificativa: item.justificativa || "-"
                        });
                    });
                });
            });

            const reportData: PCAReportData = {
                ano: currentYear,
                unidadeGestora: "Prefeitura Municipal de Camocim", // Nome da Entidade (Tenant)
                quantidadeItensGeral: totalItens,
                valorTotalGeral: totalValor,
                secretarias: Object.values(secretariasMap).sort((a, b) => b.valorTotal - a.valorTotal)
            };

            generatePCAReport(reportData);
            toast.success("Relatório gerado com sucesso!");

        } catch (error) {
            console.error(error);
            toast.error("Erro ao gerar relatório");
        } finally {
            setLoading(false);
        }
    };

    // Helper to generate consistent colors based on string
    const generateColor = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
        return "#" + "00000".substring(0, 6 - c.length) + c;
    };

    return (
        <Button
            onClick={handleDownload}
            disabled={loading}
            className="bg-primary hover:bg-primary/90 text-white gap-2"
        >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Baixar Relatório Consolidado
        </Button>
    );
};
