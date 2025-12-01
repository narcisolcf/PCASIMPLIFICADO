import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Edit, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useUASGs } from "@/hooks/useUASGs";
import { useAgentesPublicos } from "@/hooks/useAgentesPublicos";
import { supabase } from "@/integrations/supabase/client";

const UnidadesGestoras = () => {
  const { uasgs, loading: loadingUASGs, reload } = useUASGs();
  const { agentes } = useAgentesPublicos();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUasg, setEditingUasg] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [formData, setFormData] = useState({
    numero_uasg: "",
    nome: "",
    unidades_orcamentarias: "",
    rubricas: "",
    ordenador_despesa_id: "",
    disponibilidade_orcamentaria: "",
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(value);
  };

  const handleSubmit = async () => {
    if (!formData.numero_uasg || !formData.nome) {
      toast.error("Preencha número e nome da UNIDADE GESTORA");
      return;
    }

    const disponibilidade = parseFloat(
      formData.disponibilidade_orcamentaria.replace(/\./g, "").replace(",", ".")
    ) || 0;

    const uasgData = {
      numero_uasg: formData.numero_uasg,
      nome: formData.nome,
      unidades_orcamentarias: formData.unidades_orcamentarias || null,
      rubricas: formData.rubricas || null,
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
      setFormData({
        numero_uasg: "",
        nome: "",
        unidades_orcamentarias: "",
        rubricas: "",
        ordenador_despesa_id: "",
        disponibilidade_orcamentaria: "",
      });
      setEditingUasg(null);
      reload();
    } catch (error: any) {
      console.error("Erro ao salvar UNIDADE GESTORA:", error);
      toast.error("Falha ao salvar UNIDADE GESTORA");
    }
  };

  const handleEdit = (uasg: any) => {
    setEditingUasg(uasg.id);
    setFormData({
      numero_uasg: uasg.numero_uasg,
      nome: uasg.nome,
      unidades_orcamentarias: uasg.unidades_orcamentarias || "",
      rubricas: uasg.rubricas || "",
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
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="gap-2"
                    onClick={() => {
                      setEditingUasg(null);
                      setFormData({
                        numero_uasg: "",
                        nome: "",
                        unidades_orcamentarias: "",
                        rubricas: "",
                        ordenador_despesa_id: "",
                        disponibilidade_orcamentaria: "",
                      });
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar UNIDADE GESTORA
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingUasg ? "Editar UNIDADE GESTORA" : "Nova UNIDADE GESTORA"}
                    </DialogTitle>
                    <DialogDescription>
                      Preencha os dados da unidade gestora
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Número da UNIDADE GESTORA *</Label>
                        <Input
                          value={formData.numero_uasg}
                          onChange={(e) => setFormData({ ...formData, numero_uasg: e.target.value })}
                          placeholder="Ex: 123456"
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
                      <Label>Unidades Orçamentárias</Label>
                      <Textarea
                        value={formData.unidades_orcamentarias}
                        onChange={(e) => setFormData({ ...formData, unidades_orcamentarias: e.target.value })}
                        placeholder="Liste as unidades orçamentárias"
                        className="min-h-[80px]"
                      />
                    </div>
                    <div>
                      <Label>Rubricas</Label>
                      <Textarea
                        value={formData.rubricas}
                        onChange={(e) => setFormData({ ...formData, rubricas: e.target.value })}
                        placeholder="Liste as rubricas orçamentárias"
                        className="min-h-[80px]"
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
                          <SelectItem value="">Nenhum</SelectItem>
                          {agentes.map((agente) => (
                            <SelectItem key={agente.id} value={agente.id}>
                              {agente.nome} - {agente.cpf}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSubmit}>
                      {editingUasg ? "Atualizar" : "Cadastrar"}
                    </Button>
                  </DialogFooter>
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
                        <TableCell>{getOrdenadorNome((uasg as any).ordenador_despesa_id)}</TableCell>
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
