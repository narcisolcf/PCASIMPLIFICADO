import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText, Download, FileCheck, FileCode } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

interface ModelItem {
    id: string;
    title: string;
    description: string;
    category: "Planejamento" | "Governança" | "Contratos";
    format: "DOCX" | "PDF" | "XLSX";
    icon: React.ComponentType<{ className?: string }>;
}

const ModelsPage = () => {
    const models: ModelItem[] = [
        {
            id: "1",
            title: "Modelo de ETP Digital",
            description: "Estudo Técnico Preliminar conforme lei 14.133/2021",
            category: "Planejamento",
            format: "DOCX",
            icon: FileText
        },
        {
            id: "2",
            title: "Termo de Referência Padrão",
            description: "Modelo de TR para aquisição de bens comuns",
            category: "Planejamento",
            format: "DOCX",
            icon: FileText
        },
        {
            id: "3",
            title: "Minuta de Contrato",
            description: "Cláusulas essenciais para contratos de serviços",
            category: "Contratos",
            format: "DOCX",
            icon: FileCheck
        },
        {
            id: "4",
            title: "Decreto de Nomeação de Gestor",
            description: "Modelo de decreto para nomear gestores de contratos",
            category: "Governança",
            format: "DOCX",
            icon: FileCode
        },
        {
            id: "5",
            title: "Planilha de Formação de Preços",
            description: "Planilha modelo para estimativa de custos",
            category: "Planejamento",
            format: "XLSX",
            icon: FileText
        }
    ];

    const handleDownload = (model: ModelItem) => {
        // In a real scenario, this would trigger a download from Supabase Storage or a public URL
        toast.success(`Iniciando download de: ${model.title}`);
        console.log(`Downloading ${model.id}`);
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case "Planejamento": return "bg-blue-100 text-blue-800 border-blue-200";
            case "Governança": return "bg-purple-100 text-purple-800 border-purple-200";
            case "Contratos": return "bg-green-100 text-green-800 border-green-200";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b border-border bg-card shadow-sm">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center gap-4">
                        <Link to="/">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Modelos de Documentos</h1>
                            <p className="text-sm text-muted-foreground">Biblioteca de templates e minutas padronizadas</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {models.map((model) => (
                        <Card key={model.id} className="hover:shadow-md transition-all">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <div className={`p-2 rounded-md ${getCategoryColor(model.category)}`}>
                                        <model.icon className="h-5 w-5" />
                                    </div>
                                    <span className="text-xs font-semibold px-2 py-1 rounded bg-secondary text-secondary-foreground">
                                        {model.format}
                                    </span>
                                </div>
                                <CardTitle className="mt-4 text-lg">{model.title}</CardTitle>
                                <CardDescription>{model.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="mt-2">
                                    <span className={`text-xs px-2 py-0.5 rounded-full border ${getCategoryColor(model.category)}`}>
                                        {model.category}
                                    </span>
                                </div>
                                <Button
                                    className="w-full mt-4 gap-2"
                                    variant="outline"
                                    onClick={() => handleDownload(model)}
                                >
                                    <Download className="h-4 w-4" />
                                    Baixar Modelo
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default ModelsPage;
