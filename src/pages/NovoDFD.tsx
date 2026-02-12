import { useState, useEffect, useCallback } from "react";
import { PCAYearSelect } from "@/components/PCAYearSelect";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar as CalendarIcon, Save, FileDown, Plus, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AnexosDFD } from "@/components/AnexosDFD";
import { MateriaisServicos } from "@/components/MateriaisServicos";
import { ResponsaveisDFD } from "@/components/ResponsaveisDFD";
import { useAreasRequisitantes } from "@/hooks/useAreasRequisitantes";
import { useUASGs } from "@/hooks/useUASGs";
import { supabase } from "@/integrations/supabase/client";
import { exportDFDtoPDF } from "@/utils/exportDFDtoPDF";

// ... imports 

const NovoDFD = () => {
  const { id } = useParams();
  const [date, setDate] = useState<Date>();
  const [prioridade, setPrioridade] = useState<"Baixa" | "Média" | "Alta">("Baixa");
  const [dfdId, setDfdId] = useState<string | null>(null);
  const [selectedUasgId, setSelectedUasgId] = useState<string>("");
  const [selectedAreaId, setSelectedAreaId] = useState<string>("");
  const [justificativa, setJustificativa] = useState("");
  const [descricaoSucinta, setDescricaoSucinta] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [valorTotal, setValorTotal] = useState(0);
  const [localMateriais, setLocalMateriais] = useState<any[]>([]);
  const [localResponsaveis, setLocalResponsaveis] = useState<any[]>([]);
  const [novaAreaDialog, setNovaAreaDialog] = useState(false);
  const [novaAreaNome, setNovaAreaNome] = useState("");
  const [novaAreaOrcamento, setNovaAreaOrcamento] = useState("");
  const [userName, setUserName] = useState("Carregando..."); // New state for user Name
  const { uasgs } = useUASGs();
  const { areas, reload: reloadAreas } = useAreasRequisitantes(selectedUasgId || undefined);

  // Dynamic years
  const nextYear = new Date().getFullYear() + 1;
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    // Fetch user info
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Try to fetch name from agentes_publicos if linked, or use email/metadata
        // For now, simpler approach or fetch from 'agentes_publicos' table if 'user.email' matches?
        // Let's assume user.email for now or User Metadata if available.
        // A more robust way:
        const { data: agente } = await supabase.from('agentes_publicos').select('nome').eq('email', user.email).single();
        setUserName(agente?.nome || user.email || "Usuário Autenticado");
      } else {
        setUserName("Não autenticado");
      }
    };
    getUser();
  }, []);

  // ... rest of code ...

  const fetchDfdData = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const { data: dfdData, error } = await supabase
        .from("dfds")
        .select(`
          *,
          areas_requisitantes (
            uasg_id
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;

      if (dfdData) {
        setDfdId(dfdData.id);
        setDescricaoSucinta(dfdData.descricao_sucinta);
        setJustificativa(dfdData.justificativa_necessidade);
        setPrioridade(dfdData.prioridade);
        if (dfdData.data_conclusao) {
          setDate(new Date(dfdData.data_conclusao));
        }
        setValorTotal(dfdData.valor_total);

        // Load relationships
        if (dfdData.areas_requisitantes) {
          // First set UASG to trigger areas load
          setSelectedUasgId(dfdData.areas_requisitantes.uasg_id);
          // Then set Area
          setSelectedAreaId(dfdData.area_requisitante_id);
        }

        // Fetch related data for local state if needed
        // Note: Components like MateriaisServicos might fetch their own data based on dfdId
        // But for initial consistency we rely on the subcomponents handling the fetch via dfdId prop
      }
    } catch (error) {
      console.error("Error fetching DFD:", error);
      toast.error("Erro ao carregar dados do DFD");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id) {
      fetchDfdData(id);
    }
  }, [id, fetchDfdData]);

  const handleCreateArea = async () => {
    if (!selectedUasgId) {
      toast.error("Selecione uma UNIDADE GESTORA primeiro");
      return;
    }

    if (!novaAreaNome || !novaAreaOrcamento) {
      toast.error("Preencha todos os campos");
      return;
    }

    try {
      const uasg = uasgs.find(u => u.id === selectedUasgId);
      if (!uasg) return;

      const orcamento = parseFloat(novaAreaOrcamento.replace(/\./g, "").replace(",", "."));

      const { data, error } = await supabase
        .from("areas_requisitantes")
        .insert([{
          numero_uasg: uasg.numero_uasg,
          uasg_id: selectedUasgId,
          nome: novaAreaNome,
          disponibilidade_orcamentaria: orcamento,
        }])
        .select()
        .single();

      if (error) {
        if (error.message.includes("excede o orçamento da UASG")) {
          toast.error("Orçamento excede o disponível na UNIDADE GESTORA");
        } else {
          throw error;
        }
        return;
      }

      toast.success("Área requisitante criada com sucesso!");
      setNovaAreaDialog(false);
      setNovaAreaNome("");
      setNovaAreaOrcamento("");
      reloadAreas();
      setSelectedAreaId(data.id);
    } catch (error) {
      console.error("Erro ao criar área:", error);
      toast.error("Erro ao criar área requisitante");
    }
  };

  const handleSave = async () => {
    // Validação 1: Campos obrigatórios
    if (!selectedUasgId || !selectedAreaId) {
      toast.error("Selecione a UNIDADE GESTORA e a Área Requisitante antes de salvar");
      return;
    }

    if (!justificativa || !descricaoSucinta) {
      toast.error("Preencha a justificativa e a descrição sucinta");
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Você precisa estar autenticado para criar um DFD");
        return;
      }

      const area = areas.find(a => a.id === selectedAreaId);
      if (!area) return;

      let novoDfdId = dfdId;

      if (dfdId) {
        // Update existing DFD
        const { error } = await supabase
          .from("dfds")
          .update({
            numero_uasg: area.numero_uasg,
            area_requisitante_id: selectedAreaId,
            justificativa_necessidade: justificativa,
            descricao_sucinta: descricaoSucinta,
            data_conclusao: date?.toISOString().split('T')[0] || null,
            prioridade: prioridade,
            valor_total: valorTotal,
          })
          .eq("id", dfdId);

        if (error) throw error;
      } else {
        // Create new DFD
        const { data, error } = await supabase
          .from("dfds")
          .insert([
            {
              user_id: user.id,
              numero_uasg: area.numero_uasg,
              area_requisitante_id: selectedAreaId,
              justificativa_necessidade: justificativa,
              descricao_sucinta: descricaoSucinta,
              data_conclusao: date?.toISOString().split('T')[0] || null,
              prioridade: prioridade,
              situacao: "Rascunho",
              valor_total: valorTotal,
            },
          ])
          .select()
          .single();

        if (error) throw error;
        novoDfdId = data.id;
      }

      // Passo 3: Fazer INSERT em lote de materiais/serviços (apenas se for novo? ou lidar com update?)
      // Por simplicidade, assumindo que subcomponentes lidam com adição direta se tiver ID, 
      // mas se for NOVO (não tem ID ainda), salvamos os locais.
      if (!dfdId && novoDfdId) {
        if (localMateriais.length > 0) {
          const materiaisParaSalvar = localMateriais.map(m => ({
            dfd_id: novoDfdId,
            tipo: m.tipo,
            descricao: m.descricao,
            quantidade: m.quantidade,
            unidade_medida: m.unidade_medida,
            valor_unitario: m.valor_unitario,
            justificativa: m.justificativa,
          }));

          const { error: materiaisError } = await supabase
            .from("materiais_servicos")
            .insert(materiaisParaSalvar);

          if (materiaisError) {
            console.error("Erro ao salvar materiais:", materiaisError);
            throw materiaisError;
          }
        }

        // Passo 3: Fazer INSERT em lote de responsáveis
        if (localResponsaveis.length > 0) {
          const responsaveisParaSalvar = localResponsaveis.map(r => ({
            dfd_id: novoDfdId,
            funcao: r.funcao,
            funcao_id: r.funcao_id,
            cargo: r.cargo,
            cargo_id: r.cargo_id,
            nome: r.nome,
            cpf: r.cpf,
            email: r.email,
            telefone: r.telefone,
          }));

          const { error: responsaveisError } = await supabase
            .from("responsaveis")
            .insert(responsaveisParaSalvar);

          if (responsaveisError) {
            console.error("Erro ao salvar responsáveis:", responsaveisError);
            throw responsaveisError;
          }
        }
      }

      // Passo 4: Limpar estados locais
      setLocalMateriais([]);
      setLocalResponsaveis([]);

      // Passo 5: Atualizar dfdId (muda status para "Rascunho" e trava campos)
      setDfdId(novoDfdId);

      toast.success("DFD salvo com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar DFD:", error);
      toast.error("Erro ao salvar DFD. Verifique os dados e tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleEnviar = async () => {
    if (!dfdId) {
      toast.error("Salve o DFD antes de enviá-lo");
      return;
    }

    try {
      const { error } = await supabase
        .from("dfds")
        .update({ situacao: "Enviado" })
        .eq("id", dfdId);

      if (error) throw error;

      toast.success("DFD enviado para análise");
    } catch (error) {
      console.error("Erro ao enviar DFD:", error);
      toast.error("Erro ao enviar DFD");
    }
  };

  const handleExportarPDF = async () => {
    if (!dfdId) {
      toast.error("Salve o DFD antes de exportar para PDF");
      return;
    }

    try {
      // Buscar dados completos do DFD
      const { data: dfdData, error: dfdError } = await supabase
        .from("dfds")
        .select(`
          *,
          areas_requisitantes(nome)
        `)
        .eq("id", dfdId)
        .single();

      if (dfdError) throw dfdError;

      // Buscar materiais
      const { data: materiais, error: materiaisError } = await supabase
        .from("materiais_servicos")
        .select("*")
        .eq("dfd_id", dfdId)
        .order("created_at", { ascending: true });

      if (materiaisError) throw materiaisError;

      // Buscar responsáveis
      const { data: responsaveis, error: responsaveisError } = await supabase
        .from("responsaveis")
        .select("*")
        .eq("dfd_id", dfdId)
        .order("created_at", { ascending: true });

      if (responsaveisError) throw responsaveisError;

      // Buscar anexos
      const { data: anexos, error: anexosError } = await supabase
        .from("anexos_dfd")
        .select("*")
        .eq("dfd_id", dfdId)
        .order("created_at", { ascending: true });

      if (anexosError) throw anexosError;

      // Preparar dados para exportação
      const pdfData = {
        numero: dfdData.numero,
        numero_uasg: dfdData.numero_uasg,
        area_requisitante: dfdData.areas_requisitantes?.nome || "Não especificada",
        descricao_sucinta: dfdData.descricao_sucinta,
        justificativa_necessidade: dfdData.justificativa_necessidade,
        prioridade: dfdData.prioridade,
        valor_total: dfdData.valor_total,
        materiais: materiais || [],
        responsaveis: responsaveis || [],
        anexos: anexos || [],
      };

      exportDFDtoPDF(pdfData);
      toast.success("PDF exportado com sucesso!");
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      toast.error("Erro ao exportar PDF");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link to="/dfds">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    {dfdId ? "Documento de Formalização da Demanda" : "Novo Documento de Formalização da Demanda"}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {dfdId ? "Todas as alterações foram salvas automaticamente" : "Preencha os dados e clique em Salvar"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={dfdId ? "outline" : "secondary"}>
                    {dfdId ? "RASCUNHO" : "NÃO SALVO"}
                  </Badge>
                  {dfdId && (
                    <Button variant="outline" size="sm" onClick={handleExportarPDF}>
                      <FileDown className="h-4 w-4 mr-2" />
                      Exportar PDF
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {!dfdId && (
          <Card className="mb-6 bg-info/10 border-info">
            <CardContent className="pt-6">
              <p className="text-sm text-foreground">
                <strong>Informação:</strong> Preencha as informações gerais e clique em <strong>"Salvar"</strong> para
                poder adicionar materiais/serviços, responsáveis e anexos ao DFD.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>1. Informações Gerais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Número do Documento de Formalização da Demanda</Label>
                    <Input value={dfdId ? "Gerado Automaticamente" : "Será gerado ao salvar"} disabled />
                  </div>
                  <div>
                    <Label>Editado por</Label>
                    <Input value={userName} disabled />
                  </div>
                </div>

                <div>
                  <Label>Data da conclusão da Contratação</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : "Selecione a data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>UNIDADE GESTORA Destino do DFD *</Label>
                    <Select
                      value={selectedUasgId}
                      onValueChange={setSelectedUasgId}
                      disabled={!!dfdId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma UNIDADE GESTORA" />
                      </SelectTrigger>
                      <SelectContent>
                        {uasgs.map((uasg) => (
                          <SelectItem key={uasg.id} value={uasg.id}>
                            {uasg.numero_uasg} - {uasg.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Área Requisitante *</Label>
                    <div className="flex gap-2">
                      <Select
                        value={selectedAreaId}
                        onValueChange={setSelectedAreaId}
                        disabled={!selectedUasgId || !!dfdId}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Selecione uma Área Requisitante" />
                        </SelectTrigger>
                        <SelectContent>
                          {areas.map((area) => (
                            <SelectItem key={area.id} value={area.id}>
                              {area.numero} - {area.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setNovaAreaDialog(true)}
                        disabled={!selectedUasgId || !!dfdId}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Justificativa de Necessidade *</Label>
                  <Textarea
                    value={justificativa}
                    onChange={(e) => setJustificativa(e.target.value)}
                    placeholder="Descreva a justificativa da necessidade..."
                    className="min-h-[120px]"
                    disabled={!!dfdId && !id} // Allow editing if we are in "edit mode" (id present) but maybe we want to allow editing always? The original logic locked fields if dfdId was present. I'll keep it consistent with "Rascunho" logic later, but for now assuming user wants to edit.
                  />
                </div>

                <div>
                  <Label>Descrição sucinta do objeto * ({200 - descricaoSucinta.length} caracteres restantes)</Label>
                  <Textarea
                    value={descricaoSucinta}
                    onChange={(e) => setDescricaoSucinta(e.target.value)}
                    placeholder="Descreva brevemente o objeto da contratação..."
                    maxLength={200}
                    disabled={!!dfdId && !id}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="mt-6">
              <MateriaisServicos
                dfdId={dfdId}
                onTotalChange={setValorTotal}
                localMateriais={localMateriais}
                onLocalMateriaisChange={setLocalMateriais}
              />
            </div>

            <div className="mt-6">
              <ResponsaveisDFD
                dfdId={dfdId}
                localResponsaveis={localResponsaveis}
                onLocalResponsaveisChange={setLocalResponsaveis}
              />
            </div>

            <div className="mt-6">
              <AnexosDFD dfdId={dfdId} />
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>PCA</CardTitle>
              </CardHeader>
              <CardContent>
                <PCAYearSelect />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Prioridade</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={prioridade} onValueChange={(value) => setPrioridade(value as "Baixa" | "Média" | "Alta")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Baixa">Baixa</SelectItem>
                    <SelectItem value="Média">Média</SelectItem>
                    <SelectItem value="Alta">Alta</SelectItem>
                  </SelectContent>
                </Select>

                <div className="mt-4">
                  <Label>Justificativa de Prioridade</Label>
                  <Textarea
                    placeholder="Justifique a prioridade selecionada..."
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>4. Acompanhamento</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Registre aqui o acompanhamento do DFD
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-between">
          <Link to="/dfds">
            <Button variant="outline">Voltar</Button>
          </Link>
          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              <Save className="h-4 w-4" />
              {saving ? "Salvando..." : "Salvar DFD"}
            </Button>
            {dfdId && (
              <Button onClick={handleEnviar}>Enviar DFD</Button>
            )}
          </div>
        </div>
      </main>

      {/* Dialog para criar nova área requisitante */}
      <Dialog open={novaAreaDialog} onOpenChange={setNovaAreaDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Área Requisitante</DialogTitle>
            <DialogDescription>
              Crie uma nova área requisitante para a UNIDADE GESTORA selecionada
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="nome-area">Nome da Área *</Label>
              <Input
                id="nome-area"
                value={novaAreaNome}
                onChange={(e) => setNovaAreaNome(e.target.value)}
                placeholder="Ex: Departamento de TI"
              />
            </div>
            <div>
              <Label htmlFor="orcamento-area">Disponibilidade Orçamentária (R$) *</Label>
              <Input
                id="orcamento-area"
                value={novaAreaOrcamento}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  const formatted = (parseInt(value) / 100 || 0).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  });
                  setNovaAreaOrcamento(formatted);
                }}
                placeholder="0,00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNovaAreaDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateArea}>Criar Área</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NovoDFD;
