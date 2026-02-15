import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCatalogoItens, CatalogoItem } from "@/hooks/useCatalogoItens";
import { ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ClassificacaoItem {
  id: string;
  nome: string;
  tipo: "Material" | "Serviço";
}

interface UnidadeMedida {
  id: string;
  sigla: string;
  nome: string;
}

export default function CatalogoItens() {
  const navigate = useNavigate();
  const { itens, loading, createItem, updateItem, deleteItem } = useCatalogoItens();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogoItem | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Estados para listas auxiliares
  const [classificacoes, setClassificacoes] = useState<ClassificacaoItem[]>([]);
  const [unidades, setUnidades] = useState<UnidadeMedida[]>([]);

  // Estados para novos cadastros auxiliares
  const [newClassificacaoOpen, setNewClassificacaoOpen] = useState(false);
  const [newUnidadeOpen, setNewUnidadeOpen] = useState(false);
  const [newClassificacaoNome, setNewClassificacaoNome] = useState("");
  const [newClassificacaoTipo, setNewClassificacaoTipo] = useState<"Material" | "Serviço">("Material");
  const [newUnidadeSigla, setNewUnidadeSigla] = useState("");
  const [newUnidadeNome, setNewUnidadeNome] = useState("");

  const [formData, setFormData] = useState({
    codigo_item: "",
    tipo: "Material" as "Material" | "Serviço",
    descricao: "",
    unidade_medida: "",
    valor_unitario_referencia: "",
    especificacoes: "",
  });

  useEffect(() => {
    loadAuxiliaryData();
  }, []);

  const loadAuxiliaryData = async () => {
    const { data: classData } = await supabase.from("classificacao_itens").select("*").order("nome");
    if (classData) setClassificacoes(classData as ClassificacaoItem[]);

    const { data: unitData } = await supabase.from("unidade_medidas").select("*").order("nome");
    if (unitData) setUnidades(unitData as UnidadeMedida[]);
  };

  const handleCreateClassificacao = async () => {
    if (!newClassificacaoNome.trim()) return;
    const { error } = await supabase.from("classificacao_itens").insert([
      { nome: newClassificacaoNome, tipo: newClassificacaoTipo }
    ]);

    if (error) {
      toast.error("Erro ao criar classificação");
    } else {
      toast.success("Classificação criada!");
      setNewClassificacaoOpen(false);
      setNewClassificacaoNome("");
      loadAuxiliaryData();
    }
  };

  const handleCreateUnidade = async () => {
    if (!newUnidadeSigla.trim() || !newUnidadeNome.trim()) return;
    const { error } = await supabase.from("unidade_medidas").insert([
      { sigla: newUnidadeSigla, nome: newUnidadeNome }
    ]);

    if (error) {
      toast.error("Erro ao criar unidade");
    } else {
      toast.success("Unidade criada!");
      setNewUnidadeOpen(false);
      setNewUnidadeSigla("");
      setNewUnidadeNome("");
      loadAuxiliaryData();
    }
  };


  const handleOpenDialog = (item?: CatalogoItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        codigo_item: item.codigo_item || "",
        tipo: item.tipo,
        descricao: item.descricao,
        unidade_medida: item.unidade_medida,
        valor_unitario_referencia: item.valor_unitario_referencia?.toString() || "",
        especificacoes: item.especificacoes || "",
      });
    } else {
      setEditingItem(null);
      setFormData({
        codigo_item: "",
        tipo: "Material",
        descricao: "",
        unidade_medida: "",
        valor_unitario_referencia: "",
        especificacoes: "",
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const itemData = {
      codigo_item: formData.codigo_item || null,
      tipo: formData.tipo, // Tipo agora vem da Classificação ou do Select
      descricao: formData.descricao,
      unidade_medida: formData.unidade_medida,
      valor_unitario_referencia: formData.valor_unitario_referencia ? parseFloat(formData.valor_unitario_referencia) : null,
      especificacoes: formData.especificacoes || null,
    };

    if (editingItem) {
      await updateItem(editingItem.id, itemData);
    } else {
      await createItem(itemData);
    }

    setDialogOpen(false);
    setEditingItem(null);
  };

  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      await deleteItem(itemToDelete);
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold">Catálogo de Itens</h1>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingItem ? "Editar Item" : "Novo Item"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="codigo_item">Código do Item (opcional)</Label>
                    <Input
                      id="codigo_item"
                      value={formData.codigo_item}
                      onChange={(e) => setFormData({ ...formData, codigo_item: e.target.value })}
                      placeholder="MS-000001"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo / Classificação *</Label>
                    <div className="flex gap-2">
                      <Select
                        value={formData.tipo}
                        onValueChange={(value: "Material" | "Serviço") => setFormData({ ...formData, tipo: value })}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Material">Material</SelectItem>
                          <SelectItem value="Serviço">Serviço</SelectItem>
                          {classificacoes.map((c) => (
                            <SelectItem key={c.id} value={c.tipo}>{c.nome} ({c.tipo})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Dialog open={newClassificacaoOpen} onOpenChange={setNewClassificacaoOpen}>
                        <DialogTrigger asChild>
                          <Button size="icon" variant="outline" type="button" title="Nova Classificação">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>Nova Classificação</DialogTitle></DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label>Nome</Label>
                              <Input value={newClassificacaoNome} onChange={e => setNewClassificacaoNome(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                              <Label>Tipo</Label>
                              <Select value={newClassificacaoTipo} onValueChange={(v: "Material" | "Serviço") => setNewClassificacaoTipo(v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Material">Material</SelectItem>
                                  <SelectItem value="Serviço">Serviço</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <Button onClick={handleCreateClassificacao} type="button">Salvar Classificação</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição *</Label>
                  <Input
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="unidade_medida">Unidade de Medida *</Label>
                    <div className="flex gap-2">
                      <Select
                        value={formData.unidade_medida}
                        onValueChange={(value) => setFormData({ ...formData, unidade_medida: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {unidades.map((u) => (
                            <SelectItem key={u.id} value={u.sigla}>{u.sigla} - {u.nome}</SelectItem>
                          ))}
                          <SelectItem value="un">un - Unidade (Padrão)</SelectItem>
                        </SelectContent>
                      </Select>
                      <Dialog open={newUnidadeOpen} onOpenChange={setNewUnidadeOpen}>
                        <DialogTrigger asChild>
                          <Button size="icon" variant="outline" type="button" title="Nova Unidade">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>Nova Unidade de Medida</DialogTitle></DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label>Sigla (ex: cx, kg)</Label>
                              <Input value={newUnidadeSigla} onChange={e => setNewUnidadeSigla(e.target.value)} maxLength={5} />
                            </div>
                            <div className="space-y-2">
                              <Label>Nome (ex: Caixa, Quilograma)</Label>
                              <Input value={newUnidadeNome} onChange={e => setNewUnidadeNome(e.target.value)} />
                            </div>
                            <Button onClick={handleCreateUnidade} type="button">Salvar Unidade</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="valor_unitario_referencia">Valor Unitário de Referência</Label>
                    <Input
                      id="valor_unitario_referencia"
                      type="number"
                      step="0.01"
                      value={formData.valor_unitario_referencia}
                      onChange={(e) => setFormData({ ...formData, valor_unitario_referencia: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="especificacoes">Especificações</Label>
                  <Textarea
                    id="especificacoes"
                    value={formData.especificacoes}
                    onChange={(e) => setFormData({ ...formData, especificacoes: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingItem ? "Atualizar" : "Criar"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-card rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead>Valor Ref.</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : itens.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhum item cadastrado
                  </TableCell>
                </TableRow>
              ) : (
                itens.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-sm">{item.codigo_item || "—"}</TableCell>
                    <TableCell>{item.tipo}</TableCell>
                    <TableCell className="max-w-md truncate">{item.descricao}</TableCell>
                    <TableCell>{item.unidade_medida}</TableCell>
                    <TableCell>
                      {item.valor_unitario_referencia
                        ? `R$ ${item.valor_unitario_referencia.toFixed(2)}`
                        : "—"
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(item)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja desativar este item do catálogo? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
