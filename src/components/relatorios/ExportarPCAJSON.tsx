import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const ExportarPCAJSON = () => {
    const [loading, setLoading] = useState(false);

    const handleDownload = async () => {
        setLoading(true);
        try {
            toast.info("Gerando JSON do PCA...", {
                description: "Coletando os dados atuais das requisições aprovadas."
            });

            // Busca dados com a mesma lógica do Relatório PDF, ou dados completos
            const { data: areas, error: areasError } = await supabase
                .from("areas_requisitantes")
                .select(`
            id,
            nome,
            numero_uasg,
            uasgs ( nome ),
            dfds!inner (
                id,
                numero,
                valor_total,
                created_at,
                situacao,
                prioridade,
                materiais_servicos (
                    descricao,
                    tipo,
                    codigo_item,
                    valor_total,
                    valor_unitario,
                    quantidade,
                    justificativa,
                    created_at,
                    prioridade,
                    data_pretendida
                ),
                responsaveis_dfd (
                    nome,
                    cargo,
                    email,
                    telefone
                )
            )
        `)
                .neq('dfds.situacao', 'Rascunho'); // Apenas dados enviados/em analise/aprovados

            if (areasError) throw areasError;

            const pcaData = {
                exportType: "Plano de Contratações Anual (PCA)",
                anoReferencia: new Date().getFullYear(),
                unidadeGestora: "Prefeitura Municipal de Camocim",
                dataExportacao: new Date().toISOString(),
                areasRequisitantes: areas
            };

            // Gerar arquivo JSON
            const jsonStr = JSON.stringify(pcaData, null, 2);
            const blob = new Blob([jsonStr], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `PCA_Camocim_${pcaData.anoReferencia}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast.success("JSON exportado com sucesso!");
        } catch (error) {
            console.error(error);
            toast.error("Erro ao gerar JSON");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            onClick={handleDownload}
            disabled={loading}
            variant="outline"
            className="gap-2"
        >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
            Exportar JSON
        </Button>
    );
};
