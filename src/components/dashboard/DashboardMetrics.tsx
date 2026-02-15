import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, DollarSign, FileText, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

interface DashboardData {
    totalDfds: number;
    valorTotal: number;
    porStatus: {
        rascunho: number;
        emAnalise: number;
        aprovado: number;
        correcao: number;
    };
}

export const DashboardMetrics = () => {
    const [data, setData] = useState<DashboardData>({
        totalDfds: 0,
        valorTotal: 0,
        porStatus: { rascunho: 0, emAnalise: 0, aprovado: 0, correcao: 0 },
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const { data: dfds, error } = await supabase
                .from("dfds")
                .select("id, situacao, valor_total");

            if (error) throw error;

            const stats = dfds.reduce(
                (acc, curr) => {
                    acc.totalDfds++;
                    acc.valorTotal += curr.valor_total || 0;

                    const status = curr.situacao;
                    if (status === "Rascunho") acc.porStatus.rascunho++;
                    else if (status === "Em Análise") acc.porStatus.emAnalise++;
                    else if (status === "Aprovado") acc.porStatus.aprovado++;
                    else if (status === "Correção Solicitada") acc.porStatus.correcao++;

                    return acc;
                },
                {
                    totalDfds: 0,
                    valorTotal: 0,
                    porStatus: { rascunho: 0, emAnalise: 0, aprovado: 0, correcao: 0 },
                }
            );

            // Check column name in types.ts -> it is valor_total. In JS map it might be accessed as valor_total.
            // Let's re-calculate to be safe about property access
            let totalV = 0;
            dfds.forEach(d => {
                totalV += Number(d.valor_total) || 0;
            });
            stats.valorTotal = totalV;

            setData(stats);
        } catch (error) {
            console.error("Erro ao carregar dashboard:", error);
        } finally {
            setLoading(false);
        }
    };

    const chartData = [
        { name: "Rascunho", total: data.porStatus.rascunho },
        { name: "Em Análise", total: data.porStatus.emAnalise },
        { name: "Correção", total: data.porStatus.correcao },
        { name: "Aprovado", total: data.porStatus.aprovado },
    ];

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(val);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Demandas</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.totalDfds}</div>
                        <p className="text-xs text-muted-foreground">Documentos criados</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Valor Estimado</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(data.valorTotal)}</div>
                        <p className="text-xs text-muted-foreground">Total acumulado</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Em Análise</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.porStatus.emAnalise}</div>
                        <p className="text-xs text-muted-foreground">Aguardando aprovação</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Aprovados</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.porStatus.aprovado}</div>
                        <p className="text-xs text-muted-foreground">Prontos para compras</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Status das Demandas</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[240px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                    <Tooltip cursor={{ fill: 'transparent' }} />
                                    <Bar dataKey="total" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Ações Rápidas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <span className="flex h-2 w-2 rounded-full bg-sky-500 mr-2" />
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">Rascunhos</p>
                                    <p className="text-xs text-muted-foreground">{data.porStatus.rascunho} documentos não enviados</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <span className="flex h-2 w-2 rounded-full bg-orange-500 mr-2" />
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">Correção Solicitada</p>
                                    <p className="text-xs text-muted-foreground">{data.porStatus.correcao} documentos precisam de atenção</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
