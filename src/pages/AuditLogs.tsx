import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Download, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AuditLog {
    id: string;
    user_id: string;
    action: string;
    table_name: string;
    record_id: string;
    old_data: Record<string, unknown>;
    new_data: Record<string, unknown>;
    created_at: string;
    agentes_publicos?: {
        nome: string;
        email: string;
    };
}

const AuditLogs = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("audit_logs")
                .select(`
          *,
          agentes_publicos (
            nome,
            email
          )
        `)
                .order("created_at", { ascending: false })
                .limit(100);

            if (error) throw error;
            setLogs(data || []);
        } catch (error) {
            console.error("Erro ao buscar logs:", error);
            toast.error("Erro ao carregar logs de auditoria");
        } finally {
            setLoading(false);
        }
    };

    const getActionColor = (action: string) => {
        switch (action) {
            case "INSERT": return "bg-green-100 text-green-800 hover:bg-green-200 border-green-200";
            case "UPDATE": return "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200";
            case "DELETE": return "bg-red-100 text-red-800 hover:bg-red-200 border-red-200";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    const formatData = (data: Record<string, unknown> | null) => {
        if (!data) return "-";
        return <pre className="text-xs max-w-[200px] overflow-hidden text-ellipsis">{JSON.stringify(data, null, 2)}</pre>;
    };

    const filteredLogs = logs.filter(log =>
        log.table_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.agentes_publicos?.nome || "").toLowerCase().includes(searchTerm.toLowerCase())
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
                            <h1 className="text-2xl font-bold text-foreground">Logs de Auditoria</h1>
                            <p className="text-sm text-muted-foreground">Monitoramento de segurança e conformidade</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-8">
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Filtros</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <Label>Buscar</Label>
                                <div className="relative mt-1">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Filtrar por tabela, ação ou usuário..."
                                        className="pl-8"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="flex items-end">
                                <Button variant="outline" onClick={fetchLogs} className="gap-2">
                                    <Loader2 className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                    Atualizar
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Histórico de Eventos</CardTitle>
                            <CardDescription>Últimos 100 registros de atividade no sistema (DFDs)</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-12 text-muted-foreground">Carregando logs...</div>
                        ) : filteredLogs.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">Nenhum registro encontrado.</div>
                        ) : (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Data/Hora</TableHead>
                                            <TableHead>Usuário</TableHead>
                                            <TableHead>Ação</TableHead>
                                            <TableHead>Entidade</TableHead>
                                            <TableHead>ID Registro</TableHead>
                                            <TableHead>Detalhes (Novo)</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredLogs.map((log) => (
                                            <TableRow key={log.id}>
                                                <TableCell className="text-sm">
                                                    {format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-sm">{log.agentes_publicos?.nome || "Sistema"}</span>
                                                        <span className="text-xs text-muted-foreground">{log.agentes_publicos?.email}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={getActionColor(log.action)}>
                                                        {log.action}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-mono text-xs">{log.table_name}</TableCell>
                                                <TableCell className="font-mono text-xs" title={log.record_id}>
                                                    {log.record_id.substring(0, 8)}...
                                                </TableCell>
                                                <TableCell>
                                                    {log.action === "DELETE" ? formatData(log.old_data) : formatData(log.new_data)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
};

export default AuditLogs;
