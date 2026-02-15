import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface UnidadeOrcamentaria {
    id: string;
    uasg_id: string;
    codigo: string;
    nome: string;
    descricao?: string | null;
    created_at: string;
}

export function useUnidadesOrcamentarias(uasgId?: string | null) {
    const [unidades, setUnidades] = useState<UnidadeOrcamentaria[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const loadUnidades = async () => {
        if (!uasgId) {
            setUnidades([]);
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from("unidades_orcamentarias")
                .select("*")
                .eq("uasg_id", uasgId)
                .order("codigo", { ascending: true });

            if (error) throw error;

            setUnidades(data || []);
        } catch (error) {
            console.error("Erro ao carregar unidades orçamentárias:", error);
            toast({
                title: "Erro",
                description: "Falha ao carregar unidades orçamentárias",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const addUnidade = async (data: {
        uasg_id: string;
        codigo: string;
        nome: string;
        descricao?: string | null;
    }) => {
        try {
            const { error } = await supabase.from("unidades_orcamentarias").insert([data]);

            if (error) throw error;

            toast({
                title: "Sucesso",
                description: "Unidade Orçamentária adicionada com sucesso",
            });

            await loadUnidades();
            return true;
        } catch (error) {
            console.error("Erro ao adicionar unidade orçamentária:", error);
            toast({
                title: "Erro",
                description: "Falha ao adicionar unidade orçamentária",
                variant: "destructive",
            });
            return false;
        }
    };

    const deleteUnidade = async (id: string) => {
        try {
            const { error } = await supabase
                .from("unidades_orcamentarias")
                .delete()
                .eq("id", id);

            if (error) throw error;

            toast({
                title: "Sucesso",
                description: "Unidade Orçamentária removida com sucesso",
            });

            await loadUnidades();
            return true;
        } catch (error) {
            console.error("Erro ao deletar unidade orçamentária:", error);
            toast({
                title: "Erro",
                description: "Falha ao remover unidade orçamentária",
                variant: "destructive",
            });
            return false;
        }
    };

    useEffect(() => {
        loadUnidades();
    }, [uasgId]);

    return { unidades, loading, addUnidade, deleteUnidade, reload: loadUnidades };
}
