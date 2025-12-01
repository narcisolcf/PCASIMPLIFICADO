import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Cargo {
  id: string;
  nome: string;
  descricao: string | null;
  ativo: boolean;
}

export function useCargos() {
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadCargos = async () => {
    try {
      const { data, error } = await supabase
        .from("cargos")
        .select("*")
        .eq("ativo", true)
        .order("nome", { ascending: true });

      if (error) throw error;

      setCargos(data || []);
    } catch (error) {
      console.error("Erro ao carregar cargos:", error);
      toast({
        title: "Erro",
        description: "Falha ao carregar cargos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addCargo = async (nome: string, descricao?: string) => {
    try {
      const { error } = await supabase.from("cargos").insert([
        {
          nome,
          descricao: descricao || null,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Cargo adicionado com sucesso",
      });

      await loadCargos();
      return true;
    } catch (error: any) {
      console.error("Erro ao adicionar cargo:", error);
      
      if (error.message?.includes("duplicate")) {
        toast({
          title: "Erro",
          description: "Este cargo já existe",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro",
          description: "Falha ao adicionar cargo",
          variant: "destructive",
        });
      }
      return false;
    }
  };

  const updateCargo = async (id: string, nome: string, descricao?: string) => {
    try {
      const { error } = await supabase
        .from("cargos")
        .update({
          nome,
          descricao: descricao || null,
        })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Cargo atualizado com sucesso",
      });

      await loadCargos();
      return true;
    } catch (error: any) {
      console.error("Erro ao atualizar cargo:", error);
      
      if (error.message?.includes("duplicate")) {
        toast({
          title: "Erro",
          description: "Este cargo já existe",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro",
          description: "Falha ao atualizar cargo",
          variant: "destructive",
        });
      }
      return false;
    }
  };

  const deactivateCargo = async (id: string) => {
    try {
      const { error } = await supabase
        .from("cargos")
        .update({ ativo: false })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Cargo desativado com sucesso",
      });

      await loadCargos();
      return true;
    } catch (error) {
      console.error("Erro ao desativar cargo:", error);
      toast({
        title: "Erro",
        description: "Falha ao desativar cargo",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    loadCargos();
  }, []);

  return { cargos, loading, addCargo, updateCargo, deactivateCargo, reload: loadCargos };
}