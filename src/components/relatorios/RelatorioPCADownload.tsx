import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { generatePCAReport } from "@/utils/pca-report-generator";
import { toast } from "sonner";

export const RelatorioPCADownload = () => {
    const handleDownload = async () => {
        try {
            toast.info("Gerando relatório...", {
                description: "Aguarde enquanto o PDF é processado."
            });

            // Small delay to allow toast to show before main thread blocks
            setTimeout(() => {
                generatePCAReport();
                toast.success("Relatório gerado!", {
                    description: "O download deve iniciar automaticamente."
                });
            }, 100);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao gerar relatório");
        }
    };

    return (
        <Button
            onClick={handleDownload}
            className="bg-primary hover:bg-primary/90 text-white gap-2"
        >
            <Download className="h-4 w-4" />
            Baixar Relatório Consolidado 2025
        </Button>
    );
};
