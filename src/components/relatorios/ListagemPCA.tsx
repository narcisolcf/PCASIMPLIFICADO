import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Eye, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export function ListagemPCA() {
    const [pcas, setPcas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPCAs = async () => {
        setLoading(true);
        try {
            // Obtém DFDs que são requisições PCA
            const { data, error } = await supabase
                .from("dfds")
                .select(`
          id,
          numero,
          descricao_sucinta,
          valor_total,
          situacao,
          created_at,
          areas_requisitantes (nome)
        `)
                .ilike("descricao_sucinta", "Requisição PCA - %")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setPcas(data || []);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao buscar requisições PCA");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPCAs();
    }, []);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    if (loading) return <div className="text-center py-4 text-muted-foreground">Carregando requisições...</div>;
    if (pcas.length === 0) return null; // Não exibe se não houver nenhuma

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle>Minhas Requisições PCA</CardTitle>
                <CardDescription>Acompanhe e edite as requisições enviadas</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Número/Ano</TableHead>
                                <TableHead>Área Requisitante</TableHead>
                                <TableHead>Valor Total</TableHead>
                                <TableHead>Situação</TableHead>
                                <TableHead>Data</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pcas.map((pca) => (
                                <TableRow key={pca.id}>
                                    <TableCell className="font-medium">
                                        {pca.numero ? `${pca.numero}/${new Date(pca.created_at).getFullYear()}` : "Novo"}
                                    </TableCell>
                                    <TableCell>{pca.areas_requisitantes?.nome || "-"}</TableCell>
                                    <TableCell>{formatCurrency(pca.valor_total || 0)}</TableCell>
                                    <TableCell>
                                        <Badge variant={pca.situacao === "Rascunho" ? "secondary" : "default"}>
                                            {pca.situacao}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{new Date(pca.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {/* O link aponta para a edição completa onde é possível mexer em todo o DFD */}
                                            <Link to={`/dfds/${pca.id}`}>
                                                <Button variant="ghost" size="sm" className="gap-1">
                                                    {pca.situacao === "Rascunho" || pca.situacao === "Correção Solicitada" ? (
                                                        <><Edit className="h-4 w-4" /> Editar</>
                                                    ) : (
                                                        <><Eye className="h-4 w-4" /> Visualizar</>
                                                    )}
                                                </Button>
                                            </Link>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
