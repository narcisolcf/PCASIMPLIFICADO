import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ChevronDown, ChevronRight, Plus, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getCatalogClassDescription } from "@/utils/catalog-utils";
import { PCAYearSelect } from "@/components/PCAYearSelect";

interface DFDItem {
  id: string;
  dfd_numero: number | null;
  dfd_ano: number;
  uasg_nome: string;
  area_nome: string;
  descricao_item: string;
  data_conclusao: string | null;
  valor_total_item: number;
  prioridade: string;
  codigo_item: string | null;
}

interface ClasseDFD {
  classe: string;
  quantidadeDFDs: number;
  valorEstimado: number;
  itens: DFDItem[];
  expanded?: boolean;
}

const Consolidacao = () => {
  const [classes, setClasses] = useState<ClasseDFD[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [areas, setAreas] = useState<{ id: string, nome: string }[]>([]);
  const [selectedArea, setSelectedArea] = useState<string>("todas");

  // Dynamic Year
  const nextYear = new Date().getFullYear() + 1;
  const currentYear = new Date().getFullYear();

  const handleAddToPurchase = (item: DFDItem) => {
    toast.info(`Item "${item.descricao_item}" adicionado ao planejamento de compra (Simulação).`, {
      description: "Funcionalidade de criação de processo de compra em desenvolvimento."
    });
  };

  const fetchAreas = async () => {
    try {
      const { data } = await supabase.from("areas_requisitantes").select("id, nome").order("nome");
      if (data) setAreas(data);
    } catch (error) {
      console.error("Erro ao buscar áreas", error);
    }
  };

  const fetchConsolidacao = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("materiais_servicos")
        .select(`
          id,
          descricao,
          valor_total,
          codigo_item,
          dfds!inner (
            id,
            numero,
            created_at,
            data_conclusao,
            prioridade,
            situacao,
            area_requisitante_id,
            areas_requisitantes (nome),
            uasgs (nome)
          )
        `)
        .neq('dfds.situacao', 'Rascunho'); // Only finalized DFDs

      if (selectedArea !== "todas") {
        query = query.eq('dfds.area_requisitante_id', selectedArea);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Process and aggregate data
      const aggregated: Record<string, ClasseDFD> = {};

      data?.forEach((item: any) => {
        // Derive class from codigo_item or generic
        const codigo = item.codigo_item || "000000";
        // Simple logic: key is the first 4 digits of code or "Outros"
        const classeKey = codigo.length >= 4 ? codigo.substring(0, 4) : "Outros";

        // Use utility function
        const classeNome = getCatalogClassDescription(classeKey);

        const classeLabel = `${classeKey} - ${classeNome}`;

        if (!aggregated[classeLabel]) {
          aggregated[classeLabel] = {
            classe: classeLabel,
            quantidadeDFDs: 0,
            valorEstimado: 0,
            itens: [],
            expanded: false
          };
        }

        const dfd = item.dfds;
        const dfdYear = dfd.created_at ? new Date(dfd.created_at).getFullYear() : new Date().getFullYear();

        aggregated[classeLabel].quantidadeDFDs += 1; // Actually counting items here
        aggregated[classeLabel].valorEstimado += item.valor_total || 0;
        aggregated[classeLabel].itens.push({
          id: item.id,
          dfd_numero: dfd.numero,
          dfd_ano: dfdYear,
          uasg_nome: dfd.uasgs?.nome || "N/A",
          area_nome: dfd.areas_requisitantes?.nome || "N/A",
          descricao_item: item.descricao,
          data_conclusao: dfd.data_conclusao,
          valor_total_item: item.valor_total || 0,
          prioridade: dfd.prioridade || "Média",
          codigo_item: item.codigo_item
        });
      });

      setClasses(Object.values(aggregated));

    } catch (error) {
      console.error("Erro ao buscar dados de consolidação:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAreas();
  }, []);

  useEffect(() => {
    fetchConsolidacao();
  }, [selectedArea]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const toggleExpand = (index: number) => {
    setClasses(classes.map((classe, i) =>
      i === index ? { ...classe, expanded: !classe.expanded } : classe
    ));
  };

  const getPrioridadeBadgeColor = (prioridade: string) => {
    switch (prioridade) {
      case "Alta": return "bg-destructive text-destructive-foreground";
      case "Média": return "bg-warning text-warning-foreground";
      case "Baixa": return "bg-info text-info-foreground";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  const filteredClasses = classes.filter(c =>
    c.classe.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.itens.some(i => i.descricao_item.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Consolidação das Demandas</h1>
              <p className="text-sm text-muted-foreground">Planejamento e Gerenciamento de Contratações</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardDescription>
              Nesta tela os setores de contratações deverão realizar a consolidação das demandas
              enviadas pelos setores requisitantes.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Selecione o contexto do PCA</Label>
                <PCAYearSelect />
              </div>
              <div>
                <Label>Área Requisitante</Label>
                <Select value={selectedArea} onValueChange={setSelectedArea}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as áreas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas as áreas</SelectItem>
                    {areas.map(area => (
                      <SelectItem key={area.id} value={area.id}>{area.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Termo a ser pesquisado</Label>
                <Input
                  placeholder="Pesquise por classe ou item..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lista de demandas consolidadas por classe ou grupo</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12 text-muted-foreground flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p>Calculando consolidação...</p>
              </div>
            ) : filteredClasses.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>Nenhuma demanda encontrada para consolidação.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredClasses.map((classe, index) => (
                  <div key={index} className="border rounded-lg overflow-hidden">
                    <div
                      className="p-4 bg-secondary/50 hover:bg-secondary cursor-pointer flex items-center justify-between"
                      onClick={() => toggleExpand(index)}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {classe.expanded ?
                          <ChevronDown className="h-5 w-5 text-muted-foreground" /> :
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        }
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{classe.classe}</h3>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Qtd. Itens</p>
                          <p className="font-semibold">{classe.quantidadeDFDs}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Valor Estimado</p>
                          <p className="font-semibold text-primary">{formatCurrency(classe.valorEstimado)}</p>
                        </div>
                      </div>
                    </div>

                    {classe.expanded && (
                      <div className="p-4 bg-card">
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>DFD</TableHead>
                                <TableHead>UNIDADE GESTORA</TableHead>
                                <TableHead>Área Req.</TableHead>
                                <TableHead>Descrição do Item</TableHead>
                                <TableHead>Previsão</TableHead>
                                <TableHead>Valor Total</TableHead>
                                <TableHead>Prioridade</TableHead>
                                <TableHead className="text-right">Ação</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {classe.itens.map((item, itemIndex) => (
                                <TableRow key={itemIndex}>
                                  <TableCell className="font-medium">{item.dfd_numero || "N/A"}/{item.dfd_ano}</TableCell>
                                  <TableCell>{item.uasg_nome}</TableCell>
                                  <TableCell>{item.area_nome}</TableCell>
                                  <TableCell>{item.descricao_item}</TableCell>
                                  <TableCell>{item.data_conclusao ? new Date(item.data_conclusao).toLocaleDateString() : "-"}</TableCell>
                                  <TableCell>{formatCurrency(item.valor_total_item)}</TableCell>
                                  <TableCell>
                                    <Badge className={getPrioridadeBadgeColor(item.prioridade)}>
                                      {item.prioridade}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      title="Adicionar à Compra"
                                      onClick={() => handleAddToPurchase(item)}
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6">
          <Link to="/">
            <Button variant="outline">Voltar</Button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Consolidacao;
