import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const AprovacaoPCA = () => {
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
              <h1 className="text-2xl font-bold text-foreground">Aprovação do PCA</h1>
              <p className="text-sm text-muted-foreground">Planejamento e Gerenciamento de Contratações</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Aprovação do Plano de Contratação Anual</CardTitle>
            <CardDescription>
              Nesta etapa, você irá aprovar o PCA formado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg font-semibold mb-2">Módulo em desenvolvimento</p>
              <p>Esta funcionalidade estará disponível em breve</p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6">
          <Link to="/">
            <Button variant="outline">Voltar</Button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default AprovacaoPCA;
