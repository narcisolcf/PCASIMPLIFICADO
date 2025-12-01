import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ArrowLeft, Plus, Edit, Trash2, Check, ChevronsUpDown } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useAgentesPublicos } from "@/hooks/useAgentesPublicos";
import { useCargos } from "@/hooks/useCargos";
import { cn } from "@/lib/utils";

const AgentesPublicos = () => {
  const { agentes, loading, createAgente, updateAgente, deactivateAgente } = useAgentesPublicos();
  const { cargos, loading: loadingCargos, addCargo } = useCargos();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cargoComboOpen, setCargoComboOpen] = useState(false);
  const [editingAgente, setEditingAgente] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewCargoInput, setShowNewCargoInput] = useState(false);
  const [newCargoNome, setNewCargoNome] = useState("");
  
  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    email: "",
    email_corporativo: "",
    telefone: "",
    cargo_id: "",
  });

  const formatTelefone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2")
        .replace(/(-\d{4})\d+?$/, "$1");
    }
    return value;
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatTelefone(e.target.value);
    setFormData({ ...formData, telefone: formatted });
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})/, "$1-$2")
        .replace(/(-\d{2})\d+?$/, "$1");
    }
    return value;
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setFormData({ ...formData, cpf: formatted });
  };

  const handleAddNewCargo = async () => {
    if (!newCargoNome.trim()) {
      toast.error("Digite o nome do cargo");
      return;
    }
    
    const success = await addCargo(newCargoNome.trim());
    if (success) {
      setNewCargoNome("");
      setShowNewCargoInput(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.nome || !formData.cpf) {
      toast.error("Preencha nome e CPF");
      return;
    }

    const cpfNumbers = formData.cpf.replace(/\D/g, "");
    if (cpfNumbers.length !== 11) {
      toast.error("CPF inválido");
      return;
    }

    const telefoneNumbers = formData.telefone.replace(/\D/g, "");

    const agenteData = {
      nome: formData.nome,
      cpf: cpfNumbers,
      email: formData.email || undefined,
      email_corporativo: formData.email_corporativo || undefined,
      telefone: telefoneNumbers || undefined,
      cargo_id: formData.cargo_id || undefined,
    };

    let success = false;
    if (editingAgente) {
      success = await updateAgente(editingAgente, agenteData);
    } else {
      success = await createAgente(agenteData);
    }

    if (success) {
      setDialogOpen(false);
      setFormData({ nome: "", cpf: "", email: "", email_corporativo: "", telefone: "", cargo_id: "" });
      setEditingAgente(null);
      setShowNewCargoInput(false);
      setNewCargoNome("");
    }
  };

  const handleEdit = (agente: any) => {
    setEditingAgente(agente.id);
    setFormData({
      nome: agente.nome,
      cpf: formatCPF(agente.cpf),
      email: agente.email || "",
      email_corporativo: agente.email_corporativo || "",
      telefone: formatTelefone(agente.telefone || ""),
      cargo_id: agente.cargo_id || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Deseja realmente desativar este agente público?")) {
      await deactivateAgente(id);
    }
  };

  const filteredAgentes = agentes.filter(
    (agente) =>
      searchTerm.length < 3 ||
      agente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agente.cpf.includes(searchTerm.replace(/\D/g, ""))
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
              <h1 className="text-2xl font-bold text-foreground">Agentes Públicos</h1>
              <p className="text-sm text-muted-foreground">Cadastro e Gerenciamento de Agentes Públicos</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardDescription>
              Cadastre e gerencie os agentes públicos que atuam como ordenadores de despesa e demais responsáveis.
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
                placeholder="Pesquise por nome ou CPF, a partir de 3 caracteres"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Lista de Agentes Públicos</CardTitle>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="gap-2"
                    onClick={() => {
                      setEditingAgente(null);
                      setFormData({ nome: "", cpf: "", email: "", email_corporativo: "", telefone: "", cargo_id: "" });
                      setShowNewCargoInput(false);
                      setNewCargoNome("");
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar Agente
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingAgente ? "Editar Agente Público" : "Novo Agente Público"}
                    </DialogTitle>
                    <DialogDescription>
                      Preencha os dados do agente público
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Nome Completo *</Label>
                      <Input
                        value={formData.nome}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        placeholder="Nome completo"
                      />
                    </div>
                    <div>
                      <Label>CPF *</Label>
                      <Input
                        value={formData.cpf}
                        onChange={handleCPFChange}
                        placeholder="000.000.000-00"
                        maxLength={14}
                      />
                    </div>
                    <div>
                      <Label>Cargo</Label>
                      <Popover open={cargoComboOpen} onOpenChange={setCargoComboOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={cargoComboOpen}
                            className="w-full justify-between"
                          >
                            {formData.cargo_id
                              ? cargos.find((cargo) => cargo.id === formData.cargo_id)?.nome
                              : "Selecione um cargo"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Buscar cargo..." />
                            <CommandList>
                              <CommandEmpty>Nenhum cargo encontrado.</CommandEmpty>
                              <CommandGroup>
                                {cargos.map((cargo) => (
                                  <CommandItem
                                    key={cargo.id}
                                    value={cargo.nome}
                                    onSelect={() => {
                                      setFormData({ ...formData, cargo_id: cargo.id });
                                      setCargoComboOpen(false);
                                      setShowNewCargoInput(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        formData.cargo_id === cargo.id ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {cargo.nome}
                                  </CommandItem>
                                ))}
                                <CommandItem
                                  value="novo"
                                  onSelect={() => {
                                    setShowNewCargoInput(true);
                                    setFormData({ ...formData, cargo_id: "" });
                                    setCargoComboOpen(false);
                                  }}
                                >
                                  <Plus className="mr-2 h-4 w-4" />
                                  Adicionar Novo Cargo
                                </CommandItem>
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      
                      {showNewCargoInput && (
                        <div className="mt-2 flex gap-2">
                          <Input
                            value={newCargoNome}
                            onChange={(e) => setNewCargoNome(e.target.value)}
                            placeholder="Nome do novo cargo"
                          />
                          <Button onClick={handleAddNewCargo} size="sm">
                            Adicionar
                          </Button>
                          <Button 
                            onClick={() => {
                              setShowNewCargoInput(false);
                              setNewCargoNome("");
                            }} 
                            size="sm" 
                            variant="outline"
                          >
                            Cancelar
                          </Button>
                        </div>
                      )}
                    </div>
                    <div>
                      <Label>E-mail Pessoal</Label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="email@exemplo.com"
                      />
                    </div>
                    <div>
                      <Label>E-mail Corporativo</Label>
                      <Input
                        type="email"
                        value={formData.email_corporativo}
                        onChange={(e) => setFormData({ ...formData, email_corporativo: e.target.value })}
                        placeholder="email@empresa.gov.br"
                      />
                    </div>
                    <div>
                      <Label>Telefone</Label>
                      <Input
                        value={formData.telefone}
                        onChange={handleTelefoneChange}
                        placeholder="(00) 00000-0000"
                        maxLength={15}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSubmit}>
                      {editingAgente ? "Atualizar" : "Cadastrar"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="text-center py-12 text-muted-foreground">
                <p>Carregando agentes públicos...</p>
              </div>
            )}

            {!loading && filteredAgentes.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p className="font-semibold">Nenhum agente público encontrado</p>
              </div>
            )}

            {!loading && filteredAgentes.length > 0 && (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>CPF</TableHead>
                      <TableHead>Cargo</TableHead>
                      <TableHead>E-mail Pessoal</TableHead>
                      <TableHead>E-mail Corporativo</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAgentes.map((agente) => {
                      const cargo = cargos.find((c) => c.id === agente.cargo_id);
                      return (
                        <TableRow key={agente.id}>
                          <TableCell className="font-medium">{agente.nome}</TableCell>
                          <TableCell>{formatCPF(agente.cpf)}</TableCell>
                          <TableCell>{cargo?.nome || "-"}</TableCell>
                          <TableCell>{agente.email || "-"}</TableCell>
                          <TableCell>{agente.email_corporativo || "-"}</TableCell>
                          <TableCell>{formatTelefone(agente.telefone || "")}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(agente)}
                            >
                              <Edit className="h-4 w-4 text-primary" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(agente.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                        </TableRow>
                      );
                    })}
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

export default AgentesPublicos;
