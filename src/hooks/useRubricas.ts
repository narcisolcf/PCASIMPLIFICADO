import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Rubrica {
    id: string;
    uasg_id: string;
    codigo: string;
    descricao: string;
    created_at: string;
}

export function useRubricas(uasgId?: string | null) {
    const [rubricas, setRubricas] = useState<Rubrica[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const loadRubricas = async () => {
        if (!uasgId) {
            setRubricas([]);
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from("rubricas")
                .select("*")
                .eq("uasg_id", uasgId)
                .order("codigo", { ascending: true });

            if (error) throw error;

            setRubricas(data || []);
        } catch (error) {
            console.error("Erro ao carregar rubricas:", error);
            toast({
                title: "Erro",
                description: "Falha ao carregar rubricas",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const addRubrica = async (data: {
        uasg_id: string;
        codigo: string;
        descricao: string;
    }) => {
        try {
            const { error } = await supabase.from("rubricas").insert([data]);

            if (error) throw error;

            toast({
                title: "Sucesso",
                description: "Rubrica adicionada com sucesso",
            });

            await loadRubricas();
            return true;
        } catch (error) {
            console.error("Erro ao adicionar rubrica:", error);
            toast({
                title: "Erro",
                description: "Falha ao adicionar rubrica",
                variant: "destructive",
            });
            return false;
        }
    };

    const deleteRubrica = async (id: string) => {
        try {
            const { error } = await supabase
                .from("rubricas")
                .delete()
                .eq("id", id);

            if (error) throw error;

            toast({
                title: "Sucesso",
                description: "Rubrica removida com sucesso",
            });

            await loadRubricas();
            return true;
        } catch (error) {
            console.error("Erro ao deletar rubrica:", error);
            toast({
                title: "Erro",
                description: "Falha ao remover rubrica",
                variant: "destructive",
            });
            return false;
        }
    };

    useEffect(() => {
        loadRubricas();
    }, [uasgId]);

    return { rubricas, loading, addRubrica, deleteRubrica, reload: loadRubricas };
}
