import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit, BookOpen, AlertTriangle } from "lucide-react";
import { SelecionarItemCatalogo } from "./SelecionarItemCatalogo";
import { useCatalogoItens, type CatalogoItem } from "@/hooks/useCatalogoItens";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface Material {
  id: string;
  tipo: "Material" | "Serviço";
  codigo_item: string | null;
  descricao: string;
  quantidade: number;
  unidade_medida: string;
  valor_unitario: number;
  valor_total: number;
  justificativa: string | null;
}

interface MateriaisServicosProps {
  dfdId: string | null;
  onTotalChange?: (total: number) => void;
  localMateriais?: Material[];
  onLocalMateriaisChange?: (materiais: Material[]) => void;
}

export function MateriaisServicos({ dfdId, onTotalChange, localMateriais = [], onLocalMateriaisChange }: MateriaisServicosProps) {
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [catalogoDialogOpen, setCatalogoDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [alertaSimilaridade, setAlertaSimilaridade] = useState<{ item: CatalogoItem; show: boolean } | null>(null);
  const { toast } = useToast();
  const { itens: catalogoItens } = useCatalogoItens();

  // PADRÃO LOCAL-FIRST:
  // - Se dfdId for null: opera em modo local (memória) usando localMateriais
  // - Se dfdId existir: opera com banco de dados usando materiais do Supabase
  const materiaisExibidos = dfdId ? materiais : localMateriais;
  const isLocalMode = !dfdId;

  const [formData, setFormData] = useState<{
    tipo: "Material" | "Serviço";
    descricao: string;
    quantidade: string;
    unidade_medida: string;
    valor_unitario: string;
    justificativa: string;
  }>({
    tipo: "Material",
    descricao: "",
    quantidade: "1",
    unidade_medida: "UN",
    valor_unitario: "",
    justificativa: "",
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const calcularValorTotal = () => {
    const quantidade = parseFloat(formData.quantidade) || 0;
    const valorUnitario = parseFloat(formData.valor_unitario.replace(/\./g, "").replace(",", ".")) || 0;
    return quantidade * valorUnitario;
  };

  const loadMateriais = async () => {
    if (!dfdId) return;

    const { data, error } = await supabase
      .from("materiais_servicos")
      .select("*")
      .eq("dfd_id", dfdId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Erro ao carregar materiais/serviços:", error);
      return;
    }

    setMateriais(data || []);
    
    // Calcular total e notificar
    const total = (data || []).reduce((acc, m) => acc + (m.valor_total || 0), 0);
    onTotalChange?.(total);
  };

  // Função para verificar similaridade com catálogo
  const verificarSimilaridade = (descricao: string): CatalogoItem | null => {
    const descricaoNormalizada = descricao.toLowerCase().trim();
    
    // Verificar se já existe no catálogo com descrição exata ou muito similar
    for (const item of catalogoItens) {
      const itemDescricaoNormalizada = item.descricao.toLowerCase().trim();
      
      // Verificação exata
      if (itemDescricaoNormalizada === descricaoNormalizada) {
        return item;
      }
      
      // Verificação de similaridade (>80% de palavras em comum)
      const palavrasItem = itemDescricaoNormalizada.split(/\s+/);
      const palavrasUsuario = descricaoNormalizada.split(/\s+/);
      
      if (palavrasItem.length >= 3 && palavrasUsuario.length >= 3) {
        const palavrasComuns = palavrasItem.filter(p => palavrasUsuario.includes(p));
        const similaridade = palavrasComuns.length / Math.max(palavrasItem.length, palavrasUsuario.length);
        
        if (similaridade > 0.8) {
          return item;
        }
      }
    }
    
    return null;
  };

  const handleSubmit = async () => {
    if (!formData.descricao || !formData.quantidade || !formData.unidade_medida) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    // Verificar se já existe no DFD (evitar duplicação)
    const descricaoNormalizada = formData.descricao.toLowerCase().trim();
    const jaExiste = materiaisExibidos.some(m => 
      m.descricao.toLowerCase().trim() === descricaoNormalizada && m.id !== editingId
    );
    
    if (jaExiste) {
      toast({
        title: "Item duplicado",
        description: "Este item já foi adicionado ao DFD",
        variant: "destructive",
      });
      return;
    }

    // Verificar similaridade com catálogo (apenas para novos itens)
    if (!editingId) {
      const itemSimilar = verificarSimilaridade(formData.descricao);
      if (itemSimilar) {
        setAlertaSimilaridade({ item: itemSimilar, show: true });
        return;
      }
    }

    const quantidade = parseFloat(formData.quantidade);
    const valorUnitario = parseFloat(formData.valor_unitario.replace(/\./g, "").replace(",", ".")) || 0;
    const valorTotal = quantidade * valorUnitario;

    await salvarMaterial(quantidade, valorUnitario, valorTotal);
  };

  const salvarMaterial = async (quantidade: number, valorUnitario: number, valorTotal: number) => {
    // MODO LOCAL (DFD não foi salvo ainda)
    // Operações são feitas apenas em memória (localMateriais)
    if (isLocalMode) {
      const novoMaterial: Material = {
        id: editingId || `temp-${Date.now()}`,
        tipo: formData.tipo,
        codigo_item: null, // Será gerado pela trigger do banco quando DFD for salvo
        descricao: formData.descricao,
        quantidade,
        unidade_medida: formData.unidade_medida,
        valor_unitario: valorUnitario,
        valor_total: valorTotal,
        justificativa: formData.justificativa || null,
      };

      let novosMateriaisLocais: Material[];
      if (editingId) {
        // Editar item existente em memória
        novosMateriaisLocais = localMateriais.map(m => m.id === editingId ? novoMaterial : m);
        toast({ title: "Sucesso", description: "Material/serviço atualizado" });
      } else {
        // Adicionar novo item em memória
        novosMateriaisLocais = [...localMateriais, novoMaterial];
        toast({ title: "Sucesso", description: "Material/serviço adicionado" });
      }

      // Atualizar estado pai
      onLocalMateriaisChange?.(novosMateriaisLocais);

      // Calcular e notificar valor total
      const total = novosMateriaisLocais.reduce((acc, m) => acc + (m.valor_total || 0), 0);
      onTotalChange?.(total);

      setDialogOpen(false);
      resetForm();
      return;
    }

    // MODO BANCO DE DADOS (DFD já foi salvo)
    // Operações são feitas diretamente no Supabase
    try {
      if (editingId && !editingId.startsWith('temp-')) {
        const { error } = await supabase
          .from("materiais_servicos")
          .update({
            tipo: formData.tipo,
            descricao: formData.descricao,
            quantidade,
            unidade_medida: formData.unidade_medida,
            valor_unitario: valorUnitario,
            valor_total: valorTotal,
            justificativa: formData.justificativa || null,
          })
          .eq("id", editingId);

        if (error) throw error;
        toast({ title: "Sucesso", description: "Material/serviço atualizado" });
      } else {
        const { error } = await supabase.from("materiais_servicos").insert([
          {
            dfd_id: dfdId!,
            tipo: formData.tipo,
            descricao: formData.descricao,
            quantidade,
            unidade_medida: formData.unidade_medida,
            valor_unitario: valorUnitario,
            valor_total: valorTotal,
            justificativa: formData.justificativa || null,
          },
        ]);

        if (error) throw error;
        toast({ title: "Sucesso", description: "Material/serviço adicionado" });
      }

      loadMateriais();
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast({
        title: "Erro",
        description: "Falha ao salvar material/serviço",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (material: Material) => {
    setEditingId(material.id);
    setFormData({
      tipo: material.tipo,
      descricao: material.descricao,
      quantidade: material.quantidade.toString(),
      unidade_medida: material.unidade_medida,
      valor_unitario: material.valor_unitario.toFixed(2).replace(".", ","),
      justificativa: material.justificativa || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    // MODO LOCAL: Remover apenas da memória
    if (isLocalMode) {
      const novosMateriaisLocais = localMateriais.filter(m => m.id !== id);
      onLocalMateriaisChange?.(novosMateriaisLocais);

      const total = novosMateriaisLocais.reduce((acc, m) => acc + (m.valor_total || 0), 0);
      onTotalChange?.(total);

      toast({ title: "Sucesso", description: "Material/serviço removido" });
      return;
    }

    // MODO BANCO: Remover do Supabase
    try {
      const { error } = await supabase.from("materiais_servicos").delete().eq("id", id);

      if (error) throw error;

      toast({ title: "Sucesso", description: "Material/serviço removido" });
      loadMateriais();
    } catch (error) {
      console.error("Erro ao deletar:", error);
      toast({
        title: "Erro",
        description: "Falha ao remover material/serviço",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      tipo: "Material",
      descricao: "",
      quantidade: "1",
      unidade_medida: "UN",
      valor_unitario: "",
      justificativa: "",
    });
    setEditingId(null);
  };

  const handleSelectFromCatalogo = (item: CatalogoItem) => {
    setFormData({
      tipo: item.tipo,
      descricao: item.descricao,
      quantidade: "1",
      unidade_medida: item.unidade_medida,
      valor_unitario: item.valor_unitario_referencia?.toFixed(2).replace(".", ",") || "",
      justificativa: item.especificacoes || "",
    });
    setDialogOpen(true);
  };

  const handleConfirmarCriacaoManual = async () => {
    setAlertaSimilaridade(null);
    const quantidade = parseFloat(formData.quantidade);
    const valorUnitario = parseFloat(formData.valor_unitario.replace(/\./g, "").replace(",", ".")) || 0;
    const valorTotal = quantidade * valorUnitario;
    await salvarMaterial(quantidade, valorUnitario, valorTotal);
  };

  const handleUsarItemCatalogo = () => {
    if (alertaSimilaridade?.item) {
      handleSelectFromCatalogo(alertaSimilaridade.item);
      setAlertaSimilaridade(null);
    }
  };

  // Obter IDs de itens do catálogo já adicionados ao DFD
  const getItensJaAdicionadosIds = (): string[] => {
    return materiaisExibidos
      .map(m => {
        // Tentar encontrar o item no catálogo pela descrição ou código
        const itemCatalogo = catalogoItens.find(c => 
          (c.codigo_item && c.codigo_item === m.codigo_item) ||
          c.descricao.toLowerCase() === m.descricao.toLowerCase()
        );
        return itemCatalogo?.id;
      })
      .filter((id): id is string => id !== undefined);
  };

  const handleSelectMultipleFromCatalogo = async (items: CatalogoItem[]) => {
    // Filtrar itens que já foram adicionados
    const itensParaAdicionar = items.filter(item => {
      const jaExiste = materiaisExibidos.some(m => 
        (item.codigo_item && m.codigo_item === item.codigo_item) ||
        m.descricao.toLowerCase().trim() === item.descricao.toLowerCase().trim()
      );
      return !jaExiste;
    });

    if (itensParaAdicionar.length === 0) {
      toast({
        title: "Aviso",
        description: "Todos os itens selecionados já foram adicionados ao DFD",
        variant: "destructive",
      });
      return;
    }

    if (itensParaAdicionar.length < items.length) {
      toast({
        title: "Aviso",
        description: `${items.length - itensParaAdicionar.length} item(ns) já estavam no DFD e foram ignorados`,
      });
    }

    // MODO LOCAL: Adicionar múltiplos itens em memória
    if (isLocalMode) {
      // Acumular todos os novos materiais de uma vez
      const novosMateriais = itensParaAdicionar.map(item => {
        const valorUnitario = item.valor_unitario_referencia || 0;
        const quantidade = 1;
        const valorTotal = quantidade * valorUnitario;

        return {
          id: `temp-${Date.now()}-${Math.random()}`,
          tipo: item.tipo,
          codigo_item: item.codigo_item,
          descricao: item.descricao,
          quantidade,
          unidade_medida: item.unidade_medida,
          valor_unitario: valorUnitario,
          valor_total: valorTotal,
          justificativa: item.especificacoes,
        } as Material;
      });

      // Adicionar todos de uma vez ao estado local
      const novosMateriaisLocais = [...localMateriais, ...novosMateriais];
      onLocalMateriaisChange?.(novosMateriaisLocais);

      // Calcular e notificar total
      const total = novosMateriaisLocais.reduce((acc, m) => acc + (m.valor_total || 0), 0);
      onTotalChange?.(total);
    } else {
      // MODO BANCO: Inserir múltiplos itens no Supabase de uma vez
      const materiaisParaInserir = itensParaAdicionar.map(item => {
        const valorUnitario = item.valor_unitario_referencia || 0;
        const quantidade = 1;
        const valorTotal = quantidade * valorUnitario;

        return {
          dfd_id: dfdId!,
          tipo: item.tipo,
          codigo_item: item.codigo_item,
          descricao: item.descricao,
          quantidade,
          unidade_medida: item.unidade_medida,
          valor_unitario: valorUnitario,
          valor_total: valorTotal,
          justificativa: item.especificacoes,
        };
      });

      const { error } = await supabase
        .from("materiais_servicos")
        .insert(materiaisParaInserir);

      if (error) {
        console.error("Erro ao inserir múltiplos materiais:", error);
        toast({
          title: "Erro",
          description: "Falha ao adicionar alguns itens",
          variant: "destructive",
        });
        return;
      }

      loadMateriais();
    }
    
    toast({
      title: "Sucesso",
      description: `${itensParaAdicionar.length} item(ns) adicionado(s) com sucesso`,
    });
  };

  // Carregar materiais quando o componente montar
  useEffect(() => {
    if (dfdId) {
      loadMateriais();
    }
  }, [dfdId]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>2. Materiais/Serviços</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setCatalogoDialogOpen(true)}
            >
              <BookOpen className="h-4 w-4" />
              Adicionar do Catálogo
            </Button>
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
                  Criar Novo
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Editar" : "Adicionar"} Material/Serviço
                </DialogTitle>
                <DialogDescription>
                  Preencha as informações do material ou serviço
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div>
                  <Label>Tipo *</Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(value) => setFormData({ ...formData, tipo: value as "Material" | "Serviço" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Material">Material</SelectItem>
                      <SelectItem value="Serviço">Serviço</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    ℹ️ Código do item será gerado automaticamente no formato MS-XXXXXX
                  </p>
                </div>

                <div>
                  <Label>Descrição *</Label>
                  <Textarea
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    placeholder="Descreva o material ou serviço"
                    className="min-h-[80px]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Quantidade *</Label>
                    <Input
                      type="number"
                      value={formData.quantidade}
                      onChange={(e) =>
                        setFormData({ ...formData, quantidade: e.target.value })
                      }
                      min="1"
                    />
                  </div>
                  <div>
                    <Label>Unidade de Medida *</Label>
                    <Select
                      value={formData.unidade_medida}
                      onValueChange={(value) =>
                        setFormData({ ...formData, unidade_medida: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UN">Unidade (UN)</SelectItem>
                        <SelectItem value="KG">Quilograma (KG)</SelectItem>
                        <SelectItem value="M">Metro (M)</SelectItem>
                        <SelectItem value="M2">Metro Quadrado (M²)</SelectItem>
                        <SelectItem value="L">Litro (L)</SelectItem>
                        <SelectItem value="CX">Caixa (CX)</SelectItem>
                        <SelectItem value="PC">Peça (PC)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Valor Unitário (R$) *</Label>
                    <Input
                      value={formData.valor_unitario}
                      onChange={(e) =>
                        setFormData({ ...formData, valor_unitario: e.target.value })
                      }
                      placeholder="0,00"
                    />
                  </div>
                </div>

                <div>
                  <Label>Valor Total</Label>
                  <Input value={formatCurrency(calcularValorTotal())} disabled />
                </div>

                <div>
                  <Label>Justificativa</Label>
                  <Textarea
                    value={formData.justificativa}
                    onChange={(e) =>
                      setFormData({ ...formData, justificativa: e.target.value })
                    }
                    placeholder="Justifique a necessidade deste item"
                    className="min-h-[80px]"
                  />
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
        </div>
      </CardHeader>
      
      <SelecionarItemCatalogo
        open={catalogoDialogOpen}
        onOpenChange={setCatalogoDialogOpen}
        onSelectItem={handleSelectFromCatalogo}
        onSelectMultiple={handleSelectMultipleFromCatalogo}
        itensJaAdicionados={getItensJaAdicionadosIds()}
      />

      <AlertDialog open={alertaSimilaridade?.show} onOpenChange={(open) => !open && setAlertaSimilaridade(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Item similar encontrado no catálogo
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>
                Encontramos um item no catálogo muito similar ao que você está tentando criar:
              </p>
              {alertaSimilaridade?.item && (
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <div className="font-medium">{alertaSimilaridade.item.descricao}</div>
                  <div className="text-sm space-y-1">
                    {alertaSimilaridade.item.codigo_item && (
                      <div>Código: {alertaSimilaridade.item.codigo_item}</div>
                    )}
                    <div>Tipo: {alertaSimilaridade.item.tipo}</div>
                    <div>Unidade: {alertaSimilaridade.item.unidade_medida}</div>
                    {alertaSimilaridade.item.valor_unitario_referencia && (
                      <div>Valor: R$ {alertaSimilaridade.item.valor_unitario_referencia.toFixed(2)}</div>
                    )}
                  </div>
                </div>
              )}
              <p className="text-sm">
                Deseja usar este item do catálogo ou criar um novo mesmo assim?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleConfirmarCriacaoManual}>
              Criar Novo Mesmo Assim
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleUsarItemCatalogo}>
              Usar Item do Catálogo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <CardContent>
        {materiaisExibidos.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {isLocalMode 
              ? "Adicione os materiais ou serviços necessários. Eles serão salvos quando você salvar o DFD."
              : "Adicione os materiais ou serviços necessários para esta contratação"
            }
          </p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Qtd</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Valor Unit.</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materiaisExibidos.map((material) => (
                  <TableRow key={material.id}>
                    <TableCell className="font-mono text-xs">
                      {isLocalMode ? (
                        <span className="text-muted-foreground italic">Aguardando</span>
                      ) : (
                        material.codigo_item || "-"
                      )}
                    </TableCell>
                    <TableCell>{material.tipo}</TableCell>
                    <TableCell className="max-w-xs truncate">{material.descricao}</TableCell>
                    <TableCell>{material.quantidade}</TableCell>
                    <TableCell>{material.unidade_medida}</TableCell>
                    <TableCell>{formatCurrency(material.valor_unitario)}</TableCell>
                    <TableCell>{formatCurrency(material.valor_total)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(material)}
                        >
                          <Edit className="h-4 w-4 text-primary" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(material.id)}
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