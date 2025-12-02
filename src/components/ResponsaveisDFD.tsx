import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit } from "lucide-react";
import { useFuncoes } from "@/hooks/useFuncoes";
import { useCargos } from "@/hooks/useCargos";
import { useDocumentValidation } from "@/hooks/useDocumentValidation";

interface Responsavel {
  id: string;
  funcao: string;
  funcao_id: string | null;
  cargo: string | null;
  cargo_id: string | null;
  nome: string;
  cpf: string;
  email: string | null;
  telefone: string | null;
}

interface ResponsaveisDFDProps {
  dfdId: string | null;
  localResponsaveis?: Responsavel[];
  onLocalResponsaveisChange?: (responsaveis: Responsavel[]) => void;
}

export function ResponsaveisDFD({ dfdId, localResponsaveis = [], onLocalResponsaveisChange }: ResponsaveisDFDProps) {
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [novaFuncaoDialog, setNovaFuncaoDialog] = useState(false);
  const [novoCargoDialog, setNovoCargoDialog] = useState(false);
  const [novaFuncaoNome, setNovaFuncaoNome] = useState("");
  const [novoCargoNome, setNovoCargoNome] = useState("");
  const { toast } = useToast();
  const { funcoes, addFuncao, reload: reloadFuncoes } = useFuncoes();
  const { cargos, addCargo, reload: reloadCargos } = useCargos();
  const { validateCPFPure, formatCPF } = useDocumentValidation();

  // PADRÃO LOCAL-FIRST:
  // - Se dfdId for null: opera em modo local (memória) usando localResponsaveis
  // - Se dfdId existir: opera com banco de dados usando responsaveis do Supabase
  const responsaveisExibidos = dfdId ? responsaveis : localResponsaveis;
  const isLocalMode = !dfdId;

  const [formData, setFormData] = useState<{
    funcao_id: string;
    cargo_id: string;
    nome: string;
    cpf: string;
    email: string;
    telefone: string;
  }>({
    funcao_id: "",
    cargo_id: "",
    nome: "",
    cpf: "",
    email: "",
    telefone: "",
  });

  const loadResponsaveis = useCallback(async () => {
    if (!dfdId) return;

    const { data, error } = await supabase
      .from("responsaveis")
      .select("*, funcoes(nome), cargos(nome)")
      .eq("dfd_id", dfdId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Erro ao carregar responsáveis:", error);
      return;
    }

    const responsaveisFormatados = (data || []).map((r: any) => ({
      id: r.id,
      funcao: r.funcoes?.nome || r.funcao,
      funcao_id: r.funcao_id,
      cargo: r.cargos?.nome || r.cargo,
      cargo_id: r.cargo_id,
      nome: r.nome,
      cpf: r.cpf,
      email: r.email,
      telefone: r.telefone,
    }));

    setResponsaveis(responsaveisFormatados);
  }, [dfdId]);

  // Máscara de CPF: formata enquanto digita (000.000.000-00)
  const handleCPFChange = (value: string) => {
    // Remove tudo que não é número
    const apenasNumeros = value.replace(/\D/g, "");
    // Limita a 11 dígitos
    const limitado = apenasNumeros.slice(0, 11);
    // Aplica a formatação automática
    const formatted = formatCPF(limitado);
    setFormData({ ...formData, cpf: formatted });
  };

  // Máscara de Telefone: (00) 00000-0000
  const handleTelefoneChange = (value: string) => {
    const apenasNumeros = value.replace(/\D/g, "").slice(0, 11);
    let formatted = apenasNumeros;

    if (apenasNumeros.length > 10) {
      // Celular: (00) 00000-0000
      formatted = apenasNumeros.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    } else if (apenasNumeros.length > 6) {
      // Parcial
      formatted = apenasNumeros.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
    } else if (apenasNumeros.length > 2) {
      formatted = apenasNumeros.replace(/(\d{2})(\d{0,5})/, "($1) $2");
    }

    setFormData({ ...formData, telefone: formatted });
  };

  const formatTelefone = (tel: string) => {
    const numeros = tel.replace(/\D/g, "");
    if (numeros.length === 11) {
      return numeros.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    } else if (numeros.length === 10) {
      return numeros.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    }
    return tel;
  };

  const handleAddNovaFuncao = async () => {
    if (!novaFuncaoNome.trim()) {
      toast({
        title: "Erro",
        description: "Digite o nome da função",
        variant: "destructive",
      });
      return;
    }

    const success = await addFuncao(novaFuncaoNome.trim());
    if (success) {
      // Recarregar a lista de funções
      await reloadFuncoes();

      // Auto-selecionar a nova função criada
      // Aguardar um momento para garantir que a lista foi atualizada
      setTimeout(() => {
        const novaFuncao = funcoes.find(f => f.nome === novaFuncaoNome.trim());
        if (novaFuncao) {
          setFormData(prev => ({ ...prev, funcao_id: novaFuncao.id }));
        }
      }, 100);

      setNovaFuncaoDialog(false);
      setNovaFuncaoNome("");
    }
  };

  const handleAddNovoCargo = async () => {
    if (!novoCargoNome.trim()) {
      toast({
        title: "Erro",
        description: "Digite o nome do cargo",
        variant: "destructive",
      });
      return;
    }

    const success = await addCargo(novoCargoNome.trim());
    if (success) {
      // Recarregar a lista de cargos
      await reloadCargos();

      // Auto-selecionar o novo cargo criado
      setTimeout(() => {
        const novoCargo = cargos.find(c => c.nome === novoCargoNome.trim());
        if (novoCargo) {
          setFormData(prev => ({ ...prev, cargo_id: novoCargo.id }));
        }
      }, 100);

      setNovoCargoDialog(false);
      setNovoCargoNome("");
    }
  };

  const handleSubmit = async () => {
    if (!formData.nome || !formData.cpf || !formData.funcao_id) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios (Nome, CPF e Função)",
        variant: "destructive",
      });
      return;
    }

    const cpfLimpo = formData.cpf.replace(/\D/g, "");
    if (cpfLimpo.length !== 11) {
      toast({
        title: "Erro",
        description: "CPF deve conter 11 dígitos",
        variant: "destructive",
      });
      return;
    }

    // Validação de CPF usando algoritmo módulo 11
    if (!validateCPFPure(cpfLimpo)) {
      toast({
        title: "Erro",
        description: "CPF inválido. Verifique os dígitos verificadores.",
        variant: "destructive",
      });
      return;
    }

    const funcaoSelecionada = funcoes.find(f => f.id === formData.funcao_id);
    const cargoSelecionado = cargos.find(c => c.id === formData.cargo_id);

    // MODO LOCAL (DFD não foi salvo ainda)
    // Operações são feitas apenas em memória
    if (isLocalMode) {
      const novoResponsavel: Responsavel = {
        id: editingId || `temp-${Date.now()}`,
        funcao: funcaoSelecionada?.nome || "",
        funcao_id: formData.funcao_id,
        cargo: cargoSelecionado?.nome || null,
        cargo_id: formData.cargo_id || null,
        nome: formData.nome,
        cpf: cpfLimpo,
        email: formData.email || null,
        telefone: formData.telefone.replace(/\D/g, "") || null,
      };

      let novosResponsaveisLocais: Responsavel[];
      if (editingId) {
        // Editar responsável existente em memória
        novosResponsaveisLocais = localResponsaveis.map(r => r.id === editingId ? novoResponsavel : r);
        toast({ title: "Sucesso", description: "Responsável atualizado" });
      } else {
        // Adicionar novo responsável em memória
        novosResponsaveisLocais = [...localResponsaveis, novoResponsavel];
        toast({ title: "Sucesso", description: "Responsável adicionado" });
      }

      // Atualizar estado pai
      onLocalResponsaveisChange?.(novosResponsaveisLocais);

      setDialogOpen(false);
      resetForm();
      return;
    }

    // MODO BANCO DE DADOS (DFD já foi salvo)
    // Operações são feitas diretamente no Supabase
    try{
      if (editingId && !editingId.startsWith('temp-')) {
        const { error } = await supabase
          .from("responsaveis")
          .update({
            funcao: funcaoSelecionada?.nome || "",
            funcao_id: formData.funcao_id,
            cargo: cargoSelecionado?.nome || null,
            cargo_id: formData.cargo_id || null,
            nome: formData.nome,
            cpf: cpfLimpo,
            email: formData.email || null,
            telefone: formData.telefone.replace(/\D/g, "") || null,
          })
          .eq("id", editingId);

        if (error) throw error;
        toast({ title: "Sucesso", description: "Responsável atualizado" });
      } else {
        const { error } = await supabase.from("responsaveis").insert([
          {
            dfd_id: dfdId!,
            funcao: funcaoSelecionada?.nome || "",
            funcao_id: formData.funcao_id,
            cargo: cargoSelecionado?.nome || null,
            cargo_id: formData.cargo_id || null,
            nome: formData.nome,
            cpf: cpfLimpo,
            email: formData.email || null,
            telefone: formData.telefone.replace(/\D/g, "") || null,
          },
        ]);

        if (error) throw error;
        toast({ title: "Sucesso", description: "Responsável adicionado" });
      }

      loadResponsaveis();
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast({
        title: "Erro",
        description: "Falha ao salvar responsável",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (responsavel: Responsavel) => {
    setEditingId(responsavel.id);
    setFormData({
      funcao_id: responsavel.funcao_id || "",
      cargo_id: responsavel.cargo_id || "",
      nome: responsavel.nome,
      cpf: formatCPF(responsavel.cpf),
      email: responsavel.email || "",
      telefone: responsavel.telefone ? formatTelefone(responsavel.telefone) : "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    // MODO LOCAL: Remover apenas da memória
    if (isLocalMode) {
      const novosResponsaveisLocais = localResponsaveis.filter(r => r.id !== id);
      onLocalResponsaveisChange?.(novosResponsaveisLocais);
      toast({ title: "Sucesso", description: "Responsável removido" });
      return;
    }

    // MODO BANCO: Remover do Supabase
    try {
      const { error } = await supabase.from("responsaveis").delete().eq("id", id);

      if (error) throw error;

      toast({ title: "Sucesso", description: "Responsável removido" });
      loadResponsaveis();
    } catch (error) {
      console.error("Erro ao deletar:", error);
      toast({
        title: "Erro",
        description: "Falha ao remover responsável",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      funcao_id: "",
      cargo_id: "",
      nome: "",
      cpf: "",
      email: "",
      telefone: "",
    });
    setEditingId(null);
  };

  useEffect(() => {
    loadResponsaveis();
  }, [loadResponsaveis]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>3. Responsáveis</CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => {
                  resetForm();
                  setDialogOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                Adicionar Responsável
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Editar" : "Adicionar"} Responsável
                </DialogTitle>
                <DialogDescription>
                  Defina um responsável por esta demanda
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Função *</Label>
                    <Dialog open={novaFuncaoDialog} onOpenChange={setNovaFuncaoDialog}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 text-xs">
                          <Plus className="h-3 w-3 mr-1" />
                          Nova Função
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Adicionar Nova Função</DialogTitle>
                          <DialogDescription>
                            A nova função será automaticamente selecionada após criação
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div>
                            <Label>Nome da Função *</Label>
                            <Input
                              value={novaFuncaoNome}
                              onChange={(e) => setNovaFuncaoNome(e.target.value)}
                              placeholder="Ex: Coordenador de Projetos"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddNovaFuncao();
                                }
                              }}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setNovaFuncaoDialog(false)}>
                            Cancelar
                          </Button>
                          <Button onClick={handleAddNovaFuncao}>Adicionar</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <Select
                    value={formData.funcao_id}
                    onValueChange={(value) => setFormData({ ...formData, funcao_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma função" />
                    </SelectTrigger>
                    <SelectContent>
                      {funcoes.map((funcao) => (
                        <SelectItem key={funcao.id} value={funcao.id}>
                          {funcao.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nome Completo *</Label>
                    <Input
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      placeholder="Nome do responsável"
                    />
                  </div>
                  <div>
                    <Label>CPF *</Label>
                    <Input
                      value={formData.cpf}
                      onChange={(e) => handleCPFChange(e.target.value)}
                      placeholder="000.000.000-00"
                      maxLength={14}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Digite apenas números, a formatação é automática
                    </p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Cargo</Label>
                    <Dialog open={novoCargoDialog} onOpenChange={setNovoCargoDialog}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 text-xs">
                          <Plus className="h-3 w-3 mr-1" />
                          Novo Cargo
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Adicionar Novo Cargo</DialogTitle>
                          <DialogDescription>
                            O novo cargo será automaticamente selecionado após criação
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div>
                            <Label>Nome do Cargo *</Label>
                            <Input
                              value={novoCargoNome}
                              onChange={(e) => setNovoCargoNome(e.target.value)}
                              placeholder="Ex: Supervisor de Qualidade"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddNovoCargo();
                                }
                              }}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setNovoCargoDialog(false)}>
                            Cancelar
                          </Button>
                          <Button onClick={handleAddNovoCargo}>Adicionar</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <Select
                    value={formData.cargo_id}
                    onValueChange={(value) => setFormData({ ...formData, cargo_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cargo (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {cargos.map((cargo) => (
                        <SelectItem key={cargo.id} value={cargo.id}>
                          {cargo.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>E-mail</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                  <div>
                    <Label>Telefone</Label>
                    <Input
                      value={formData.telefone}
                      onChange={(e) => handleTelefoneChange(e.target.value)}
                      placeholder="(00) 00000-0000"
                      maxLength={15}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Digite apenas números
                    </p>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmit}>
                  {editingId ? "Atualizar" : "Adicionar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {responsaveisExibidos.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {isLocalMode
              ? "Defina os responsáveis por esta demanda. Eles serão salvos quando você salvar o DFD."
              : "Defina os responsáveis por esta demanda"
            }
          </p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Função</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {responsaveisExibidos.map((responsavel) => (
                  <TableRow key={responsavel.id}>
                    <TableCell className="font-medium">{responsavel.funcao}</TableCell>
                    <TableCell>{responsavel.nome}</TableCell>
                    <TableCell className="font-mono text-xs">{formatCPF(responsavel.cpf)}</TableCell>
                    <TableCell>{responsavel.cargo || "-"}</TableCell>
                    <TableCell>
                      {responsavel.email && (
                        <div className="text-xs">{responsavel.email}</div>
                      )}
                      {responsavel.telefone && (
                        <div className="text-xs">{formatTelefone(responsavel.telefone)}</div>
                      )}
                      {!responsavel.email && !responsavel.telefone && "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(responsavel)}
                        >
                          <Edit className="h-4 w-4 text-primary" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(responsavel.id)}
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
  );
}