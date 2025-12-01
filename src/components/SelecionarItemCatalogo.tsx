import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { useCatalogoItens, CatalogoItem } from "@/hooks/useCatalogoItens";
import { Search, CheckSquare } from "lucide-react";

interface SelecionarItemCatalogoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectItem: (item: CatalogoItem) => void;
  onSelectMultiple?: (items: CatalogoItem[]) => void;
  itensJaAdicionados?: string[]; // IDs dos itens já adicionados ao DFD
}

export function SelecionarItemCatalogo({ open, onOpenChange, onSelectItem, onSelectMultiple, itensJaAdicionados = [] }: SelecionarItemCatalogoProps) {
  const { itens, loading, loadItens } = useCatalogoItens();
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [filtroUnidade, setFiltroUnidade] = useState<string>("todos");
  const [busca, setBusca] = useState("");
  const [modoMultiplo, setModoMultiplo] = useState(false);
  const [itensSelecionados, setItensSelecionados] = useState<string[]>([]);

  // Obter lista única de unidades de medida
  const unidadesDisponiveis = Array.from(new Set(itens.map(item => item.unidade_medida))).sort();

  // Aplicar filtros
  useEffect(() => {
    loadItens({
      tipo: filtroTipo === "todos" ? undefined : filtroTipo,
      unidade_medida: filtroUnidade === "todos" ? undefined : filtroUnidade,
    });
  }, [filtroTipo, filtroUnidade]);

  // Filtrar por busca de texto e remover itens já adicionados
  const itensFiltrados = itens.filter(item => {
    // Filtrar itens já adicionados ao DFD
    if (itensJaAdicionados.includes(item.id)) {
      return false;
    }
    
    // Filtrar por busca
    if (busca.length >= 3) {
      return item.descricao.toLowerCase().includes(busca.toLowerCase()) ||
             item.codigo_item?.toLowerCase().includes(busca.toLowerCase());
    }
    
    return true;
  });

  const formatCurrency = (value: number | null) => {
    if (!value) return "-";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handleSelectItem = (item: CatalogoItem) => {
    if (modoMultiplo) {
      // Modo múltiplo: adicionar/remover da seleção
      setItensSelecionados(prev => {
        if (prev.includes(item.id)) {
          return prev.filter(id => id !== item.id);
        } else {
          return [...prev, item.id];
        }
      });
    } else {
      // Modo único: selecionar e fechar
      onSelectItem(item);
      onOpenChange(false);
      resetState();
    }
  };

  const handleConfirmarSelecaoMultipla = () => {
    if (onSelectMultiple && itensSelecionados.length > 0) {
      const itemsSelecionados = itens.filter(item => itensSelecionados.includes(item.id));
      onSelectMultiple(itemsSelecionados);
      onOpenChange(false);
      resetState();
    }
  };

  const resetState = () => {
    setFiltroTipo("todos");
    setFiltroUnidade("todos");
    setBusca("");
    setModoMultiplo(false);
    setItensSelecionados([]);
  };

  const toggleModoMultiplo = () => {
    setModoMultiplo(!modoMultiplo);
    setItensSelecionados([]);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) resetState();
    }}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Selecionar Item do Catálogo</DialogTitle>
              <DialogDescription>
                Escolha um item já cadastrado no sistema
              </DialogDescription>
            </div>
            <Button
              variant={modoMultiplo ? "default" : "outline"}
              size="sm"
              onClick={toggleModoMultiplo}
            >
              <CheckSquare className="h-4 w-4 mr-2" />
              {modoMultiplo ? "Seleção Múltipla Ativa" : "Selecionar Vários Itens"}
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Tipo</Label>
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os tipos</SelectItem>
                  <SelectItem value="Material">Material</SelectItem>
                  <SelectItem value="Serviço">Serviço</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Unidade de Medida</Label>
              <Select value={filtroUnidade} onValueChange={setFiltroUnidade}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as unidades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas as unidades</SelectItem>
                  {unidadesDisponiveis.map((unidade) => (
                    <SelectItem key={unidade} value={unidade}>
                      {unidade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar por descrição ou código..."
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          {/* Tabela de itens */}
          <div className="border rounded-lg overflow-auto max-h-[calc(90vh-300px)]">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">
                Carregando itens...
              </div>
            ) : itensFiltrados.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                Nenhum item encontrado com os filtros selecionados
              </div>
            ) : (
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow>
                    {modoMultiplo && <TableHead className="w-12"></TableHead>}
                    <TableHead>Código</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Unidade</TableHead>
                    <TableHead>Valor Ref.</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itensFiltrados.map((item) => (
                    <TableRow key={item.id} className="hover:bg-muted/50 cursor-pointer">
                      {modoMultiplo && (
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={itensSelecionados.includes(item.id)}
                            onCheckedChange={() => handleSelectItem(item)}
                          />
                        </TableCell>
                      )}
                      <TableCell className="font-mono text-xs">{item.codigo_item || "-"}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          item.tipo === "Material" 
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        }`}>
                          {item.tipo}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.descricao}</div>
                          {item.especificacoes && (
                            <div className="text-xs text-muted-foreground line-clamp-1">
                              {item.especificacoes}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{item.unidade_medida}</TableCell>
                      <TableCell>{formatCurrency(item.valor_unitario_referencia)}</TableCell>
                      <TableCell className="text-right">
                        {!modoMultiplo && (
                          <Button
                            size="sm"
                            onClick={() => handleSelectItem(item)}
                          >
                            Selecionar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Mostrando {itensFiltrados.length} {itensFiltrados.length === 1 ? "item" : "itens"}
            </div>
            {modoMultiplo && (
              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">
                  {itensSelecionados.length} item(ns) selecionado(s)
                </div>
                <Button
                  onClick={handleConfirmarSelecaoMultipla}
                  disabled={itensSelecionados.length === 0}
                >
                  Confirmar Seleção
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}