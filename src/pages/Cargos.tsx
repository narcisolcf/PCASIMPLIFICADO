import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Edit, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useCargos } from "@/hooks/useCargos";

const Cargos = () => {
  const { cargos, loading, addCargo, updateCargo, deactivateCargo } = useCargos();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCargo, setEditingCargo] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
  });

  const handleSubmit = async () => {
    if (!formData.nome.trim()) {
      toast.error("Preencha o nome do cargo");
      return;
    }

    let success = false;
    if (editingCargo) {
      success = await updateCargo(editingCargo, formData.nome.trim(), formData.descricao.trim() || undefined);
    } else {
      success = await addCargo(formData.nome.trim(), formData.descricao.trim() || undefined);
    }

    if (success) {
      setDialogOpen(false);
      setFormData({ nome: "", descricao: "" });
      setEditingCargo(null);
    }
  };

  const handleEdit = (cargo: any) => {
    setEditingCargo(cargo.id);
    setFormData({
      nome: cargo.nome,
      descricao: cargo.descricao || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Deseja realmente desativar este cargo?")) {
      await deactivateCargo(id);
    }
  };

  const filteredCargos = cargos.filter(
    (cargo) =>
      searchTerm.length < 3 ||
      cargo.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <h1 className="text-2xl font-bold text-foreground">Gerenciamento de Cargos</h1>
              <p className="text-sm text-muted-foreground">Cadastro e Gerenciamento de Cargos</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardDescription>
              Gerencie os cargos que podem ser atribuídos aos agentes públicos e responsáveis do sistema.
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
                placeholder="Pesquise por nome do cargo, a partir de 3 caracteres"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Lista de Cargos</CardTitle>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="gap-2"
                    onClick={() => {
                      setEditingCargo(null);
                      setFormData({ nome: "", descricao: "" });
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar Cargo
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingCargo ? "Editar Cargo" : "Novo Cargo"}
                    </DialogTitle>
                    <DialogDescription>
                      Preencha os dados do cargo
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Nome do Cargo *</Label>
                      <Input
                        value={formData.nome}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        placeholder="Ex: Ordenador de Despesa"
                      />
                    </div>
                    <div>
                      <Label>Descrição</Label>
                      <Textarea
                        value={formData.descricao}
                        onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                        placeholder="Descrição opcional do cargo"
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSubmit}>
                      {editingCargo ? "Atualizar" : "Cadastrar"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="text-center py-12 text-muted-foreground">
                <p>Carregando cargos...</p>
              </div>
            )}

            {!loading && filteredCargos.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p className="font-semibold">Nenhum cargo encontrado</p>
              </div>
            )}

            {!loading && filteredCargos.length > 0 && (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCargos.map((cargo) => (
                      <TableRow key={cargo.id}>
                        <TableCell className="font-medium">{cargo.nome}</TableCell>
                        <TableCell>{cargo.descricao || "-"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(cargo)}
                            >
                              <Edit className="h-4 w-4 text-primary" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(cargo.id)}
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

export default Cargos;
