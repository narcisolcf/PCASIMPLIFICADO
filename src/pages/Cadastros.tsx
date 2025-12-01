import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Building2, Users, DollarSign, Briefcase } from "lucide-react";

const Cadastros = () => {
  const menuItems = [
    {
      icon: Building2,
      title: "UNIDADES GESTORAS",
      description: "Gerencie as unidades gestoras, unidades orçamentárias e rubricas",
      href: "/cadastros/unidades-gestoras",
      color: "text-primary"
    },
    {
      icon: Users,
      title: "AGENTES PÚBLICOS",
      description: "Cadastre e gerencie agentes públicos e ordenadores de despesa",
      href: "/cadastros/agentes-publicos",
      color: "text-secondary"
    },
    {
      icon: Briefcase,
      title: "CARGOS",
      description: "Gerencie os cargos disponíveis para agentes públicos e responsáveis",
      href: "/cadastros/cargos",
      color: "text-accent"
    },
    {
      icon: DollarSign,
      title: "ORÇAMENTO",
      description: "Gerencie informações orçamentárias",
      href: "/cadastros/orcamento",
      color: "text-primary"
    }
  ];

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
              <h1 className="text-2xl font-bold text-foreground">CADASTROS</h1>
              <p className="text-sm text-muted-foreground">Gerenciamento de Cadastros Básicos</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardDescription>
              Nesta seção você pode gerenciar todos os cadastros básicos do sistema: Unidades Gestoras, 
              Agentes Públicos e informações de Orçamento.
            </CardDescription>
          </CardHeader>
        </Card>

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

        <div className="mt-6">
          <Link to="/">
            <Button variant="outline">Voltar</Button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Cadastros;
