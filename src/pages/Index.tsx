import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ClipboardList, FolderKanban, CheckCircle2, BarChart3, Package, Database } from "lucide-react";

const Index = () => {
  const menuItems = [
    {
      icon: Database,
      title: "CADASTROS",
      description: "Gerencie cadastros básicos: UNIDADES GESTORAS, Agentes Públicos e Orçamento",
      href: "/cadastros",
      color: "text-info"
    },
    {
      icon: FileText,
      title: "Gestão das Áreas Requisitantes",
      description: "Cadastre e gerencie as áreas requisitantes e distribua o orçamento anual",
      href: "/areas-requisitantes",
      color: "text-primary"
    },
    {
      icon: Package,
      title: "Catálogo de Itens",
      description: "Gerencie o catálogo de materiais e serviços",
      href: "/catalogo-itens",
      color: "text-secondary"
    },
    {
      icon: ClipboardList,
      title: "Elaboração de DFDs",
      description: "Crie e gerencie Documentos de Formalização de Demandas",
      href: "/dfds",
      color: "text-accent"
    },
    {
      icon: FolderKanban,
      title: "Consolidação das Demandas",
      description: "Consolide demandas por classe ou grupo",
      href: "/consolidacao",
      color: "text-info"
    },
    {
      icon: BarChart3,
      title: "Formação do PCA",
      description: "Forme o Plano de Contratação Anual",
      href: "/formacao-pca",
      color: "text-warning"
    },
    {
      icon: CheckCircle2,
      title: "Aprovação do PCA",
      description: "Aprovar e acompanhar o Plano de Contratação Anual",
      href: "/aprovacao-pca",
      color: "text-success"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Sistema PCA</h1>
              <p className="text-sm text-muted-foreground">Planejamento e Gerenciamento de Contratações</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Bem-vindo ao sistema</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Área de Trabalho</h2>
          <p className="text-muted-foreground">
            Esta é a sua área de trabalho do Sistema PCA. Selecione uma das opções abaixo para começar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <Link key={item.href} to={item.href}>
              <Card className="hover:shadow-lg transition-all duration-300 hover:border-primary h-full cursor-pointer">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg bg-secondary ${item.color}`}>
                      <item.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{item.title}</CardTitle>
                      <CardDescription>{item.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>

        <Card className="mt-8 bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-primary">Sobre o Sistema PCA</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              O Sistema de Planejamento e Gerenciamento de Contratações (PCA) permite gerenciar todo o ciclo
              de planejamento de contratações anuais da sua organização.
            </p>
            <p>
              Através deste sistema você pode cadastrar áreas requisitantes, elaborar DFDs (Documentos de
              Formalização de Demandas), consolidar demandas e formar o plano anual de contratações.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Index;
