import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { FormularioPCA } from "@/components/formulario/FormularioPCA";

const FormacaoPCA = () => {
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
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                Formação do PCA 2025
              </h1>
              <p className="text-sm text-muted-foreground">
                Plano de Contratações Anual - Requisição de Materiais, Serviços e Obras
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Informações Iniciais */}
        <Card className="mb-6 border-l-4 border-l-primary">
          <CardHeader>
            <CardTitle>Instruções para Preenchimento</CardTitle>
            <CardDescription>
              Preencha o formulário abaixo com as informações sobre os itens que sua unidade
              gestora pretende contratar no exercício de 2025
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p className="flex items-start gap-2">
                <span className="text-primary font-bold">1.</span>
                <span>Identifique a Unidade Gestora e a Área Requisitante responsável</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-primary font-bold">2.</span>
                <span>
                  Adicione todos os itens (materiais, serviços, obras ou serviços de engenharia)
                  que deseja contratar
                </span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-primary font-bold">3.</span>
                <span>
                  Para cada item, forneça justificativa detalhada (obrigatório pela Lei 14.133/2021)
                </span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-primary font-bold">4.</span>
                <span>Revise todas as informações antes de enviar</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Formulário PCA */}
        <FormularioPCA />

        {/* Botão Voltar */}
        <div className="mt-6">
          <Link to="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Dashboard
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default FormacaoPCA;
