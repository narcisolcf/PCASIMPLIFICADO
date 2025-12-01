import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface AreaRequisitante {
  id: string;
  numero: number;
  numero_uasg: string;
  uasg_id: string | null;
  nome: string;
  disponibilidade_orcamentaria: number;
  created_at: string;
}

export function useAreasRequisitantes(uasgId?: string) {
  const [areas, setAreas] = useState<AreaRequisitante[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadAreas = async () => {
    try {
      let query = supabase
        .from("areas_requisitantes")
        .select("*")
        .order("numero", { ascending: true });

      if (uasgId) {
        query = query.eq("uasg_id", uasgId);
      }

      const { data, error } = await query;

      if (error) throw error;

      setAreas(data || []);
    } catch (error) {
      console.error("Erro ao carregar áreas:", error);
      toast({
        title: "Erro",
        description: "Falha ao carregar áreas requisitantes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addArea = async (area: {
    nome: string;
    numero_uasg: string;
    uasg_id: string | null;
    disponibilidade_orcamentaria: number;
  }) => {
    try {
      const { error } = await supabase.from("areas_requisitantes").insert([area]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Área requisitante adicionada com sucesso",
      });

      await loadAreas();
      return true;
    } catch (error: any) {
      console.error("Erro ao adicionar área:", error);
      
      if (error.message?.includes("excede a disponibilidade da UASG")) {
        toast({
          title: "Erro de Validação",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro",
          description: "Falha ao adicionar área requisitante",
          variant: "destructive",
        });
      }
      return false;
    }
  };

  const deleteArea = async (id: string) => {
    try {
      const { error } = await supabase
        .from("areas_requisitantes")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Área requisitante removida com sucesso",
      });

      await loadAreas();
      return true;
    } catch (error) {
      console.error("Erro ao deletar área:", error);
      toast({
        title: "Erro",
        description: "Falha ao remover área requisitante",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    loadAreas();
  }, [uasgId]);

  return { areas, loading, addArea, deleteArea, reload: loadAreas };
}