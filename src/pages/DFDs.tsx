import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Eye, Edit, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

interface DFD {
  id: string;
  numero: string;
  uasg: string;
  areaRequisitante: string;
  descricao: string;
  valorContratacao: number;
  situacao: string;
}

const DFDs = () => {
  const [dfds, setDfds] = useState<DFD[]>([
    {
      id: "1",
      numero: "11/2022",
      uasg: "413002",
      areaRequisitante: "Gerência Regional 01 SP",
      descricao: "Equipamentos diversos para sup.",
      valorContratacao: 142600,
      situacao: "Vinculado a contratação"
    }
  ]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getSituacaoBadgeColor = (situacao: string) => {
    switch(situacao) {
      case "Vinculado a contratação": return "bg-success text-success-foreground";
      case "Rascunho": return "bg-muted text-muted-foreground";
      case "Enviado": return "bg-info text-info-foreground";
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
              <h1 className="text-2xl font-bold text-foreground">Elaboração de DFDs</h1>
              <p className="text-sm text-muted-foreground">Planejamento e Gerenciamento de Contratações</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardDescription>
              Nesta tela as áreas requisitantes poderão elaborar os Documentos de Formalização de Demandas - DFDs 
              que fundamentam o plano de contratações anual, evidenciam e detalham as necessidades de contratação.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>PCA</Label>
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
                <Label>Termo a ser pesquisado</Label>
                <Input placeholder="Pesquise pelos termos desejados, a partir de 3 caracteres" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="meus-dfds" className="space-y-6">
          <TabsList className="grid w-full md:w-2/3 grid-cols-3">
            <TabsTrigger value="meus-dfds">Meus DFDs</TabsTrigger>
            <TabsTrigger value="dfds-uasg">DFDs da minha UNIDADE GESTORA</TabsTrigger>
            <TabsTrigger value="lixeira">Lixeira</TabsTrigger>
          </TabsList>

          <TabsContent value="meus-dfds">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Lista de DFDs</CardTitle>
                  <Link to="/dfds/novo">
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Criar novo DFD
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {dfds.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="font-semibold">Nenhum DFD encontrado</p>
                    <p className="text-sm mt-2">Clique em "Criar novo DFD" para começar</p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>DFD</TableHead>
                          <TableHead>UNIDADE GESTORA</TableHead>
                          <TableHead>Área requisitante</TableHead>
                          <TableHead>Descrição sucinta do objeto</TableHead>
                          <TableHead>Valor da contratação</TableHead>
                          <TableHead>Situação</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dfds.map((dfd) => (
                          <TableRow key={dfd.id}>
                            <TableCell className="font-medium">{dfd.numero}</TableCell>
                            <TableCell>{dfd.uasg}</TableCell>
                            <TableCell>{dfd.areaRequisitante}</TableCell>
                            <TableCell>{dfd.descricao}</TableCell>
                            <TableCell>{formatCurrency(dfd.valorContratacao)}</TableCell>
                            <TableCell>
                              <Badge className={getSituacaoBadgeColor(dfd.situacao)}>
                                {dfd.situacao}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dfds-uasg">
            <Card>
              <CardHeader>
                <CardTitle>DFDs da minha UNIDADE GESTORA</CardTitle>
                <CardDescription>Visualize todos os DFDs criados na sua UNIDADE GESTORA</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <p>Nenhum DFD encontrado para esta UNIDADE GESTORA</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lixeira">
            <Card>
              <CardHeader>
                <CardTitle>DFDs excluídos</CardTitle>
                <CardDescription>Documentos que foram movidos para a lixeira</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <p>Nenhum DFD na lixeira</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6">
          <Link to="/">
            <Button variant="outline">Voltar</Button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default DFDs;
