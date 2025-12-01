import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Plus, Trash2, Edit } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useUASGs } from "@/hooks/useUASGs";
import { useAreasRequisitantes } from "@/hooks/useAreasRequisitantes";
const AreasRequisitantes = () => {
  const {
    uasgs,
    loading: loadingUASGs
  } = useUASGs();
  const [selectedUasgId, setSelectedUasgId] = useState<string>("");
  const {
    areas,
    loading: loadingAreas,
    addArea,
    deleteArea
  } = useAreasRequisitantes(selectedUasgId || undefined);
  const [newArea, setNewArea] = useState({
    nome: "",
    disponibilidadeOrcamentaria: ""
  });
  const [searchTerm, setSearchTerm] = useState("");
  const selectedUasg = uasgs.find(u => u.id === selectedUasgId);
  const handleAddArea = async () => {
    if (!newArea.nome || !selectedUasgId) {
      toast.error("Preencha todos os campos obrigatórios e selecione uma UNIDADE GESTORA");
      return;
    }
    const disponibilidade = parseFloat(newArea.disponibilidadeOrcamentaria.replace(/\./g, "").replace(",", ".")) || 0;
    const uasg = uasgs.find(u => u.id === selectedUasgId);
    if (!uasg) return;
    const success = await addArea({
      nome: newArea.nome,
      numero_uasg: uasg.numero_uasg,
      uasg_id: selectedUasgId,
      disponibilidade_orcamentaria: disponibilidade
    });
    if (success) {
      setNewArea({
        nome: "",
        disponibilidadeOrcamentaria: ""
      });
    }
  };
  const handleDeleteArea = async (id: string) => {
    await deleteArea(id);
  };
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(value);
  };
  const calcularSaldoParcial = () => {
    if (!selectedUasg) return 0;
    const usado = areas.reduce((acc, area) => acc + area.disponibilidade_orcamentaria, 0);
    return selectedUasg.disponibilidade_orcamentaria - usado;
  };
  const valorTotalAlocado = areas.reduce((acc, area) => acc + area.disponibilidade_orcamentaria, 0);
  const filteredAreas = areas.filter(area => searchTerm.length < 3 || area.nome.toLowerCase().includes(searchTerm.toLowerCase()) || area.numero_uasg.includes(searchTerm));
  if (loadingUASGs) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Carregando...</p>
      </div>;
  }
  return <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Gestão das Áreas Requisitantes</h1>
              <p className="text-sm text-muted-foreground">Planejamento e Gerenciamento de Contratações</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardDescription>Nesta tela o usuário deve cadastrar todas as áreas requisitantes vinculadas a sua UNIDADE GESTORA. Opcionalmente, poderá ser feita a distribuição da estimativa do seu orçamento anual da UNIDADE GESTORA, visando auxiliar na governança das contratações.</CardDescription>
          </CardHeader>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Selecione a UNIDADE GESTORA *</Label>
                <Select value={selectedUasgId} onValueChange={setSelectedUasgId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma UNIDADE GESTORA" />
                  </SelectTrigger>
                  <SelectContent>
                    {uasgs.map(uasg => <SelectItem key={uasg.id} value={uasg.id}>
                        {uasg.numero_uasg} - {uasg.nome}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Termo a ser pesquisado</Label>
                <Input placeholder="Pesquise pelos termos desejados, a partir de 3 caracteres" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedUasg && <Card className="mb-6">
            <CardHeader>
              <CardTitle>Disponibilidade orçamentária da UNIDADE GESTORA</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Disponibilidade orçamentária total</Label>
                  <Input value={formatCurrency(selectedUasg.disponibilidade_orcamentaria)} disabled className="font-semibold" />
                </div>
                <div>
                  <Label>Saldo disponível</Label>
                  <Input value={formatCurrency(calcularSaldoParcial())} disabled className={`font-semibold ${calcularSaldoParcial() < 0 ? "text-destructive" : "text-primary"}`} />
                </div>
                <div>
                  <Label>Valor total alocado</Label>
                  <Input value={formatCurrency(valorTotalAlocado)} disabled className="font-semibold" />
                </div>
              </div>
            </CardContent>
          </Card>}

        <Tabs defaultValue="minha-uasg" className="space-y-6">
          <TabsList className="grid w-full md:w-1/2 grid-cols-2">
            <TabsTrigger value="minha-uasg">Áreas da UNIDADE GESTORA</TabsTrigger>
            <TabsTrigger value="outras-uasgs" disabled>
              Áreas de outras UNIDADES GESTORAS
            </TabsTrigger>
          </TabsList>

          <TabsContent value="minha-uasg">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Adicionar Nova Área</CardTitle>
                  <Button onClick={handleAddArea} className="gap-2" disabled={!selectedUasgId}>
                    <Plus className="h-4 w-4" />
                    Adicionar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {!selectedUasgId && <div className="text-center py-4 mb-6 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Selecione uma UNIDADE GESTORA para gerenciar suas áreas requisitantes
                    </p>
                  </div>}

                {selectedUasgId && <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <Label>Nome desta área requisitante *</Label>
                      <Input value={newArea.nome} onChange={e => setNewArea({
                    ...newArea,
                    nome: e.target.value
                  })} placeholder="Ex: Departamento de Normas e Logística" />
                    </div>
                    <div>
                      <Label>Disponibilidade orçamentária desta área requisitante</Label>
                      <Input value={newArea.disponibilidadeOrcamentaria} onChange={e => setNewArea({
                    ...newArea,
                    disponibilidadeOrcamentaria: e.target.value
                  })} placeholder="0,00" />
                    </div>
                  </div>}

                {loadingAreas && <div className="text-center py-12 text-muted-foreground">
                    <p>Carregando áreas...</p>
                  </div>}

                {!loadingAreas && filteredAreas.length === 0 && selectedUasgId && <div className="text-center py-12 text-muted-foreground">
                    <p className="font-semibold">Atenção: Nenhuma área requisitante encontrada</p>
                  </div>}

                {!loadingAreas && filteredAreas.length > 0 && <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nº</TableHead>
                          <TableHead>Nome desta área requisitante</TableHead>
                          <TableHead>Disponibilidade orçamentária</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAreas.map(area => <TableRow key={area.id}>
                            <TableCell>{area.numero}</TableCell>
                            <TableCell>{area.nome}</TableCell>
                            <TableCell>
                              {formatCurrency(area.disponibilidade_orcamentaria)}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteArea(area.id)}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                  <Edit className="h-4 w-4 text-primary" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>)}
                      </TableBody>
                    </Table>
                  </div>}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="outras-uasgs">
            <Card>
              <CardHeader>
                <CardTitle>Áreas de outras UNIDADES GESTORAS</CardTitle>
                <CardDescription>
                  Aqui você pode associar áreas de outras UNIDADES GESTORAS ao seu PCA
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <p>Nenhuma área de outra UNIDADE GESTORA associada</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-between">
          <Link to="/">
            <Button variant="outline">Voltar</Button>
          </Link>
        </div>
      </main>
    </div>;
};
export default AreasRequisitantes;