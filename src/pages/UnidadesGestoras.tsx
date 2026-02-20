import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Edit, Trash2, Save } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useUASGs, UASG } from "@/hooks/useUASGs";
import { useAgentesPublicos } from "@/hooks/useAgentesPublicos";
import { useUnidadesOrcamentarias } from "@/hooks/useUnidadesOrcamentarias";
import { useRubricas } from "@/hooks/useRubricas";
import { supabase } from "@/integrations/supabase/client";

const UnidadesGestoras = () => {
  const { uasgs, loading: loadingUASGs, reload } = useUASGs();
  const { agentes } = useAgentesPublicos();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUasg, setEditingUasg] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { unidades, addUnidade, deleteUnidade } = useUnidadesOrcamentarias(editingUasg);
  const { rubricas, addRubrica, deleteRubrica } = useRubricas(editingUasg);

  const [formData, setFormData] = useState({
    numero_uasg: "",
    nome: "",
    ordenador_despesa_id: "",
    disponibilidade_orcamentaria: "",
  });

  // States for sub-items forms
  const [newUnidade, setNewUnidade] = useState({ codigo: "", nome: "" });
  const [newRubrica, setNewRubrica] = useState({ codigo: "", descricao: "" });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(value);
  };

  const handleSubmit = async () => {
    if (!formData.nome) {
      toast.error("Preencha o nome da UNIDADE GESTORA");
      return;
    }

    const disponibilidade = parseFloat(
      formData.disponibilidade_orcamentaria.replace(/\./g, "").replace(",", ".")
    ) || 0;

    const uasgData = {
      nome: formData.nome,
      ordenador_despesa_id: formData.ordenador_despesa_id || null,
      disponibilidade_orcamentaria: disponibilidade,
    };

    try {
      if (editingUasg) {
        const { error } = await supabase
          .from("uasgs")
          .update(uasgData)
          .eq("id", editingUasg);

        if (error) throw error;
        toast.success("UNIDADE GESTORA atualizada com sucesso");
      } else {
        const { error } = await supabase
          .from("uasgs")
          .insert([uasgData]);

        if (error) throw error;
        toast.success("UNIDADE GESTORA cadastrada com sucesso");
      }

      setDialogOpen(false);
      resetForm();
      reload();
    } catch (error: unknown) {
      console.error("Erro ao salvar UNIDADE GESTORA:", error);
      toast.error("Falha ao salvar UNIDADE GESTORA");
    }
  };

  const resetForm = () => {
    setFormData({
      numero_uasg: "",
      nome: "",
      ordenador_despesa_id: "",
      disponibilidade_orcamentaria: "",
    });
    setEditingUasg(null);
    setNewUnidade({ codigo: "", nome: "" });
    setNewRubrica({ codigo: "", descricao: "" });
  };

  const handleEdit = (uasg: UASG) => {
    setEditingUasg(uasg.id);
    setFormData({
      numero_uasg: uasg.numero_uasg,
      nome: uasg.nome,
      ordenador_despesa_id: uasg.ordenador_despesa_id || "",
      disponibilidade_orcamentaria: uasg.disponibilidade_orcamentaria.toString(),
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Deseja realmente excluir esta UNIDADE GESTORA?")) {
      try {
        const { error } = await supabase
          .from("uasgs")
          .delete()
          .eq("id", id);

        if (error) throw error;
        toast.success("UNIDADE GESTORA excluída com sucesso");
        reload();
      } catch (error) {
        console.error("Erro ao excluir UNIDADE GESTORA:", error);
        toast.error("Falha ao excluir UNIDADE GESTORA");
      }
    }
  };

  const handleAddUnidade = async () => {
    if (!editingUasg || !newUnidade.codigo || !newUnidade.nome) {
      toast.error("Preencha código e nome");
      return;
    }
    await addUnidade({
      uasg_id: editingUasg,
      codigo: newUnidade.codigo,
      nome: newUnidade.nome
    });
    setNewUnidade({ codigo: "", nome: "" });
  };

  const handleAddRubrica = async () => {
    if (!editingUasg || !newRubrica.codigo || !newRubrica.descricao) {
      toast.error("Preencha código e descrição");
      return;
    }
    await addRubrica({
      uasg_id: editingUasg,
      codigo: newRubrica.codigo,
      descricao: newRubrica.descricao
    });
    setNewRubrica({ codigo: "", descricao: "" });
  };

  const filteredUASGs = uasgs.filter(
    (uasg) =>
      searchTerm.length < 3 ||
      uasg.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      uasg.numero_uasg.includes(searchTerm)
  );

  const getOrdenadorNome = (ordenadorId: string | null) => {
    if (!ordenadorId) return "-";
    const agente = agentes.find((a) => a.id === ordenadorId);
    return agente ? agente.nome : "-";
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link to="/cadastros">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">UNIDADES GESTORAS</h1>
              <p className="text-sm text-muted-foreground">Gerenciamento de Unidades Gestoras</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardDescription>
              Cadastre e gerencie as unidades gestoras, incluindo unidades orçamentárias, rubricas e ordenadores de despesa.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtro</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label>Termo a ser pesquisado</Label>
              <Input
                placeholder="Pesquise por nome ou número, a partir de 3 caracteres"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Lista de UNIDADES GESTORAS</CardTitle>
              <Dialog open={dialogOpen} onOpenChange={(open) => {
                setDialogOpen(open);
                if (!open) resetForm();
              }}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Adicionar UNIDADE GESTORA
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingUasg ? "Editar UNIDADE GESTORA" : "Nova UNIDADE GESTORA"}
                    </DialogTitle>
                    <DialogDescription>
                      Gerencie os detalhes da unidade gestora
                    </DialogDescription>
                  </DialogHeader>

                  <Tabs defaultValue="dados-basicos" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="dados-basicos">Dados Básicos</TabsTrigger>
                      <TabsTrigger value="unidades-orcamentarias" disabled={!editingUasg}>
                        Unidades Orçamentárias
                      </TabsTrigger>
                      <TabsTrigger value="rubricas" disabled={!editingUasg}>
                        Rubricas
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="dados-basicos" className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Número UASG</Label>
                          <Input
                            value={editingUasg ? formData.numero_uasg : "Gerado automaticamente"}
                            disabled
                            className="bg-muted"
                          />
                        </div>
                        <div>
                          <Label>Disponibilidade Orçamentária</Label>
                          <Input
                            value={formData.disponibilidade_orcamentaria}
                            onChange={(e) => setFormData({ ...formData, disponibilidade_orcamentaria: e.target.value })}
                            placeholder="0,00"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Nome da UNIDADE GESTORA *</Label>
                        <Input
                          value={formData.nome}
                          onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                          placeholder="Nome completo da unidade"
                        />
                      </div>
                      <div>
                        <Label>Ordenador de Despesa</Label>
                        <Select
                          value={formData.ordenador_despesa_id}
                          onValueChange={(value) => setFormData({ ...formData, ordenador_despesa_id: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um agente público" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none_selection">Nenhum</SelectItem>
                            {agentes && agentes.length > 0 ? (
                              agentes.map((agente) => (
                                <SelectItem key={agente.id} value={agente.id}>
                                  {agente.nome} - {agente.cpf}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="loading" disabled>Carregando agentes...</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-end pt-4">
                        {!editingUasg && (
                          <div className="text-sm text-yellow-600 mr-auto self-center bg-yellow-50 px-3 py-1 rounded-md">
                            Salve a UASG para adicionar Unidades Orçamentárias e Rubricas.
                          </div>
                        )}
                        <Button onClick={handleSubmit}>
                          <Save className="h-4 w-4 mr-2" />
                          {editingUasg ? "Salvar Alterações" : "Cadastrar UASG"}
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="unidades-orcamentarias" className="space-y-4 py-4">
                      <div className="flex gap-2 items-end border p-4 rounded-md bg-muted/20">
                        <div className="w-1/3">
                          <Label>Código</Label>
                          <Input
                            value={newUnidade.codigo}
                            onChange={(e) => setNewUnidade({ ...newUnidade, codigo: e.target.value })}
                            placeholder="Ex: 10.01"
                          />
                        </div>
                        <div className="flex-1">
                          <Label>Nome</Label>
                          <Input
                            value={newUnidade.nome}
                            onChange={(e) => setNewUnidade({ ...newUnidade, nome: e.target.value })}
                            placeholder="Ex: Gabinete do Secretário"
                          />
                        </div>
                        <Button onClick={handleAddUnidade}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Código</TableHead>
                              <TableHead>Nome</TableHead>
                              <TableHead className="w-[100px]">Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {unidades.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell>{item.codigo}</TableCell>
                                <TableCell>{item.nome}</TableCell>
                                <TableCell>
                                  <Button variant="ghost" size="icon" onClick={() => deleteUnidade(item.id)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                            {unidades.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={3} className="text-center text-muted-foreground">
                                  Nenhuma unidade cadastrada.
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </TabsContent>

                    <TabsContent value="rubricas" className="space-y-4 py-4">
                      <div className="flex gap-2 items-end border p-4 rounded-md bg-muted/20">
                        <div className="w-1/3">
                          <Label>Código</Label>
                          <Input
                            value={newRubrica.codigo}
                            onChange={(e) => setNewRubrica({ ...newRubrica, codigo: e.target.value })}
                            placeholder="Ex: 33.90.30"
                          />
                        </div>
                        <div className="flex-1">
                          <Label>Descrição</Label>
                          <Input
                            value={newRubrica.descricao}
                            onChange={(e) => setNewRubrica({ ...newRubrica, descricao: e.target.value })}
                            placeholder="Ex: Material de Consumo"
                          />
                        </div>
                        <Button onClick={handleAddRubrica}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Código</TableHead>
                              <TableHead>Descrição</TableHead>
                              <TableHead className="w-[100px]">Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {rubricas.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell>{item.codigo}</TableCell>
                                <TableCell>{item.descricao}</TableCell>
                                <TableCell>
                                  <Button variant="ghost" size="icon" onClick={() => deleteRubrica(item.id)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                            {rubricas.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={3} className="text-center text-muted-foreground">
                                  Nenhuma rubrica cadastrada.
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {loadingUASGs && (
              <div className="text-center py-12 text-muted-foreground">
                <p>Carregando UNIDADES GESTORAS...</p>
              </div>
            )}

            {!loadingUASGs && filteredUASGs.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p className="font-semibold">Nenhuma UNIDADE GESTORA encontrada</p>
              </div>
            )}

            {!loadingUASGs && filteredUASGs.length > 0 && (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Ordenador de Despesa</TableHead>
                      <TableHead>Disponibilidade</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUASGs.map((uasg) => (
                      <TableRow key={uasg.id}>
                        <TableCell className="font-medium">{uasg.numero_uasg}</TableCell>
                        <TableCell>{uasg.nome}</TableCell>
                        <TableCell>{getOrdenadorNome(uasg.ordenador_despesa_id || null)}</TableCell>
                        <TableCell>{formatCurrency(uasg.disponibilidade_orcamentaria)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(uasg)}
                            >
                              <Edit className="h-4 w-4 text-primary" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(uasg.id)}
                            >
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

        <div className="mt-6">
          <Link to="/cadastros">
            <Button variant="outline">Voltar</Button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default UnidadesGestoras;
