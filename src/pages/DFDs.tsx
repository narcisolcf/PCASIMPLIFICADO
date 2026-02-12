import { PCAYearSelect } from "@/components/PCAYearSelect";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Eye, Edit, Trash2, Loader2, RefreshCcw } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DFD {
  id: string;
  numero: number | null;
  area_requisitante_id: string | null;
  descricao_sucinta: string | null;
  valor_total: number | null;
  situacao: string | null;
  prioridade: string | null;
  created_at: string | null;
  // Joins
  areas_requisitantes?: {
    nome: string;
    uasgs?: {
      nome: string;
      numero_uasg: string;
    }
  };
}

const DFDs = () => {
  const [dfds, setDfds] = useState<DFD[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchDfds = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("dfds")
        .select(`
          id,
          numero,
          area_requisitante_id,
          descricao_sucinta,
          valor_total,
          situacao,
          prioridade,
          created_at,
          areas_requisitantes (
            nome,
            uasgs (
                nome,
                numero_uasg
            )
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDfds(data as DFD[]);
    } catch (error) {
      console.error("Erro ao buscar DFDs:", error);
      toast.error("Erro ao carregar DFDs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDfds();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from("dfds")
        .delete()
        .eq("id", deleteId);

      if (error) throw error;

      toast.success("DFD excluído com sucesso");
      fetchDfds(); // Reload list
    } catch (error) {
      console.error("Erro ao excluir DFD:", error);
      toast.error("Erro ao excluir DFD");
    } finally {
      setDeleteId(null);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getSituacaoBadgeColor = (situacao: string) => {
    switch (situacao) {
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
                <div className="w-[180px]">
                  <PCAYearSelect />
                </div>
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
            <TabsTrigger value="meus-dfds">Todos os DFDs</TabsTrigger>
            <TabsTrigger value="dfds-uasg">Minha UNIDADE GESTORA</TabsTrigger>
            <TabsTrigger value="lixeira">Lixeira</TabsTrigger>
          </TabsList>

          <TabsContent value="meus-dfds">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Lista de DFDs</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={fetchDfds}>
                      <RefreshCcw className="h-4 w-4" />
                    </Button>
                    <Link to="/dfds/novo">
                      <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Criar novo DFD
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-12 text-muted-foreground flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p>Carregando DFDs...</p>
                  </div>
                ) : dfds.length === 0 ? (
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
                            <TableCell className="font-medium">{dfd.numero || "—"}</TableCell>
                            <TableCell>{dfd.areas_requisitantes?.uasgs?.nome || "—"}</TableCell>
                            <TableCell>{dfd.areas_requisitantes?.nome || "—"}</TableCell>
                            <TableCell>{dfd.descricao_sucinta}</TableCell>
                            <TableCell>{formatCurrency(dfd.valor_total || 0)}</TableCell>
                            <TableCell>
                              <Badge className={getSituacaoBadgeColor(dfd.situacao)}>
                                {dfd.situacao}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Link to={`/dfds/${dfd.id}`}>
                                  <Button variant="ghost" size="icon" title="Visualizar/Editar">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <Link to={`/dfds/${dfd.id}`}>
                                  <Button variant="ghost" size="icon" title="Editar">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="Excluir"
                                  className="text-destructive hover:bg-destructive/10"
                                  onClick={() => setDeleteId(dfd.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
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
                  <p>Implementação futura: Filtrar pelo contexto do usuário logado.</p>
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

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o DFD e todos os seus itens associados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DFDs;
