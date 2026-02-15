import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Check, X, Search, Eye } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

interface DfdAprovacao {
  id: string;
  numero: number | null;
  descricao_sucinta: string;
  prioridade: string;
  valor_total: number;
  situacao: string;
  updated_at: string;
  areas_requisitantes: {
    nome: string;
    numero: number;
    numero_uasg: string;
  } | null;
}

export default function AprovacaoPCA() {
  const [dfds, setDfds] = useState<DfdAprovacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDfd, setSelectedDfd] = useState<DfdAprovacao | null>(null);
  const [actionDialog, setActionDialog] = useState<"approve" | "reject" | null>(null);
  const [motivoCorrecao, setMotivoCorrecao] = useState("");
  const navigate = useNavigate();

  const fetchDfds = async () => {
    setLoading(true);
    try {
      // Buscar DFDs que estão "Em Análise" ou "Enviado"
      const { data, error } = await supabase
        .from("dfds")
        .select(`
            *,
            areas_requisitantes ( nome, numero, numero_uasg )
        `)
        .in("situacao", ["Em Análise", "Enviado"])
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setDfds(data || []);
    } catch (error) {
      console.error("Erro ao buscar DFDs:", error);
      toast.error("Erro ao carregar DFDs para aprovação");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDfds();
  }, []);

  const handleApprove = async () => {
    if (!selectedDfd) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      // Buscar agente
      const { data: agente } = await supabase.from('agentes_publicos').select('id').eq('email', user?.email).maybeSingle();

      const { error } = await supabase
        .from("dfds")
        .update({
          situacao: "Aprovado",
          data_aprovacao: new Date().toISOString(),
          aprovado_por: agente?.id
        })
        .eq("id", selectedDfd.id);

      if (error) throw error;
      toast.success(`DFD ${selectedDfd.numero || "Novo"} aprovado com sucesso!`);
      setActionDialog(null);
      fetchDfds();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao aprovar DFD");
    }
  };

  const handleRequestCorrection = async () => {
    if (!selectedDfd || !motivoCorrecao) {
      toast.error("Informe o motivo da correção");
      return;
    }
    try {
      const { error } = await supabase
        .from("dfds")
        .update({
          situacao: "Correção Solicitada",
          motivo_correcao: motivoCorrecao
        })
        .eq("id", selectedDfd.id);

      if (error) throw error;
      toast.success(`Correção solicitada para DFD ${selectedDfd.numero || "Novo"}`);
      setActionDialog(null);
      setMotivoCorrecao("");
      fetchDfds();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao solicitar correção");
    }
  };

  const filteredDfds = dfds.filter(dfd =>
    dfd.descricao_sucinta?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dfd.areas_requisitantes?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(dfd.numero ?? "").includes(searchTerm)
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
              <h1 className="text-2xl font-bold text-foreground">Aprovação PCA</h1>
              <p className="text-sm text-muted-foreground">Analise e aprove os DFDs enviados pelos setores</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Card className="mb-6">
          <CardHeader><CardTitle>Filtros</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por descrição, área ou número..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>DFDs Pendentes de Aprovação</CardTitle><CardDescription>Lista de DFDs aguardando análise</CardDescription></CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Carregando...</div>
            ) : filteredDfds.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Nenhum DFD pendente de aprovação.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Área Requisitante</TableHead>
                    <TableHead>Objeto</TableHead>
                    <TableHead>Data Envio</TableHead>
                    <TableHead>Prioridade</TableHead>
                    <TableHead>Valor Total</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDfds.map(dfd => (
                    <TableRow key={dfd.id}>
                      <TableCell>{dfd.numero || "-"}</TableCell>
                      <TableCell>
                        <div>{dfd.areas_requisitantes?.nome}</div>
                        <div className="text-xs text-muted-foreground">UASG: {dfd.areas_requisitantes?.numero_uasg}</div>
                      </TableCell>
                      <TableCell className="max-w-md truncate">{dfd.descricao_sucinta}</TableCell>
                      <TableCell>{new Date(dfd.updated_at).toLocaleDateString()}</TableCell>
                      <TableCell><Badge variant="outline">{dfd.prioridade}</Badge></TableCell>
                      <TableCell>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dfd.valor_total || 0)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => navigate(`/dfds/${dfd.id}`)}>
                            <Eye className="h-4 w-4 mr-2" /> Ver
                          </Button>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => { setSelectedDfd(dfd); setActionDialog("approve"); }}>
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => { setSelectedDfd(dfd); setActionDialog("reject"); }}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Dialogs */}
      <Dialog open={actionDialog === "approve"} onOpenChange={(open) => !open && setActionDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Aprovar DFD</DialogTitle><DialogDescription>Tem certeza que deseja aprovar este DFD?</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(null)}>Cancelar</Button>
            <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">Confirmar Aprovação</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={actionDialog === "reject"} onOpenChange={(open) => !open && setActionDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Solicitar Correção</DialogTitle><DialogDescription>Indique o motivo para retornar o DFD ao requisitante.</DialogDescription></DialogHeader>
          <Textarea
            value={motivoCorrecao}
            onChange={e => setMotivoCorrecao(e.target.value)}
            placeholder="Descreva o que precisa ser corrigido..."
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleRequestCorrection}>Enviar Solicitação</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
