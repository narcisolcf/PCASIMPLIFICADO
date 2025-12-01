import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ChevronDown, ChevronRight, Plus } from "lucide-react";
import { Link } from "react-router-dom";

interface ClasseDFD {
  classe: string;
  quantidadeDFDs: number;
  valorEstimado: number;
  dfds?: DFDItem[];
  expanded?: boolean;
}

interface DFDItem {
  dfd: string;
  uasg: string;
  areaRequisitante: string;
  descricao: string;
  dataConclusao: string;
  valorEstimado: number;
  prioridade: string;
}

const Consolidacao = () => {
  const [classes, setClasses] = useState<ClasseDFD[]>([
    {
      classe: "3610-Equipamento para impressão, duplicação e encadernação",
      quantidadeDFDs: 1,
      valorEstimado: 4000,
      expanded: false,
      dfds: [
        {
          dfd: "115/2022",
          uasg: "200999",
          areaRequisitante: "Almoxarifado Central",
          descricao: "Impressora",
          dataConclusao: "02/05/2023",
          valorEstimado: 4000,
          prioridade: "Média"
        }
      ]
    },
    {
      classe: "6530-Mobiliário, equipamentos, utensílios e suprimentos hospitalares",
      quantidadeDFDs: 1,
      valorEstimado: 300000,
      expanded: false
    },
    {
      classe: "7021-Unidades centrais de processamento digitais",
      quantidadeDFDs: 1,
      valorEstimado: 3000,
      expanded: false
    },
    {
      classe: "7110-Mobiliário para escritório",
      quantidadeDFDs: 1,
      valorEstimado: 300000,
      expanded: false
    },
  ]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const toggleExpand = (index: number) => {
    setClasses(classes.map((classe, i) => 
      i === index ? { ...classe, expanded: !classe.expanded } : classe
    ));
  };

  const getPrioridadeBadgeColor = (prioridade: string) => {
    switch(prioridade) {
      case "Alta": return "bg-destructive text-destructive-foreground";
      case "Média": return "bg-warning text-warning-foreground";
      case "Baixa": return "bg-info text-info-foreground";
      default: return "bg-secondary text-secondary-foreground";
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
              <h1 className="text-2xl font-bold text-foreground">Consolidação das Demandas</h1>
              <p className="text-sm text-muted-foreground">Planejamento e Gerenciamento de Contratações</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardDescription>
              Nesta tela os setores de contratações deverão realizar a consolidação das demandas 
              enviadas pelos setores requisitantes.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Selecione o contexto do PCA</Label>
                <Select defaultValue="pca-2023">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pca-2023">PCA 2023 - Em elaboração</SelectItem>
                    <SelectItem value="pca-2022">PCA 2022 - Em execução</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Área Requisitante</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma Área" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas as áreas</SelectItem>
                    <SelectItem value="almoxarifado">Almoxarifado Central</SelectItem>
                    <SelectItem value="saude">Centro de Ciências da Saúde</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Termo a ser pesquisado</Label>
                <Input placeholder="Pesquise pelos termos desejados, a partir de 3 caracteres" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lista de demandas consolidadas por classe ou grupo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {classes.map((classe, index) => (
                <div key={index} className="border rounded-lg overflow-hidden">
                  <div 
                    className="p-4 bg-secondary/50 hover:bg-secondary cursor-pointer flex items-center justify-between"
                    onClick={() => toggleExpand(index)}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {classe.expanded ? 
                        <ChevronDown className="h-5 w-5 text-muted-foreground" /> : 
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      }
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{classe.classe}</h3>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Quantidade de DFDs</p>
                        <p className="font-semibold">{classe.quantidadeDFDs}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Valor estimado da classe</p>
                        <p className="font-semibold text-primary">{formatCurrency(classe.valorEstimado)}</p>
                      </div>
                    </div>
                  </div>

                  {classe.expanded && classe.dfds && (
                    <div className="p-4 bg-card">
                      <p className="text-sm text-muted-foreground mb-4">
                        Foi encontrado {classe.quantidadeDFDs} DFD associado a esta Classe
                      </p>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>DFD</TableHead>
                              <TableHead>UASG</TableHead>
                              <TableHead>Área requisitante</TableHead>
                              <TableHead>Descrição sucinta do objeto</TableHead>
                              <TableHead>Data da conclusão da contratação</TableHead>
                              <TableHead>Valor estimado do DFD</TableHead>
                              <TableHead>Prioridade</TableHead>
                              <TableHead className="text-right">Ação</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {classe.dfds.map((dfd, dfdIndex) => (
                              <TableRow key={dfdIndex}>
                                <TableCell className="font-medium">{dfd.dfd}</TableCell>
                                <TableCell>{dfd.uasg}</TableCell>
                                <TableCell>{dfd.areaRequisitante}</TableCell>
                                <TableCell>{dfd.descricao}</TableCell>
                                <TableCell>{dfd.dataConclusao}</TableCell>
                                <TableCell>{formatCurrency(dfd.valorEstimado)}</TableCell>
                                <TableCell>
                                  <Badge className={getPrioridadeBadgeColor(dfd.prioridade)}>
                                    {dfd.prioridade}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button variant="ghost" size="icon">
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                </div>
              ))}
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

export default Consolidacao;
