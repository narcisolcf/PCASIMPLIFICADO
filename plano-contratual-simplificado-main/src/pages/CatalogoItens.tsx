import { useState } from "react";
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

export default function CatalogoItens() {
  const navigate = useNavigate();
  const { itens, loading, createItem, updateItem, deleteItem } = useCatalogoItens();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogoItem | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    codigo_item: "",
    tipo: "Material" as "Material" | "Serviço",
    descricao: "",
    unidade_medida: "",
    valor_unitario_referencia: "",
    especificacoes: "",
  });

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
      tipo: formData.tipo,
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
                    <Label htmlFor="tipo">Tipo *</Label>
                    <Select value={formData.tipo} onValueChange={(value: "Material" | "Serviço") => setFormData({ ...formData, tipo: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Material">Material</SelectItem>
                        <SelectItem value="Serviço">Serviço</SelectItem>
                      </SelectContent>
                    </Select>
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
                    <Input
                      id="unidade_medida"
                      value={formData.unidade_medida}
                      onChange={(e) => setFormData({ ...formData, unidade_medida: e.target.value })}
                      placeholder="un, kg, m², etc."
                      required
                    />
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
