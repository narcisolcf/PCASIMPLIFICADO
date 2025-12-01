import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface AgentePublico {
  id: string;
  nome: string;
  cpf: string;
  email: string | null;
  email_corporativo: string | null;
  telefone: string | null;
  cargo: string | null;
  cargo_id: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export function useAgentesPublicos() {
  const [agentes, setAgentes] = useState<AgentePublico[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadAgentes = async () => {
    try {
      const { data, error } = await supabase
        .from("agentes_publicos")
        .select("*")
        .eq("ativo", true)
        .order("nome", { ascending: true });

      if (error) throw error;

      setAgentes(data || []);
    } catch (error) {
      console.error("Erro ao carregar agentes públicos:", error);
      toast({
        title: "Erro",
        description: "Falha ao carregar agentes públicos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createAgente = async (agente: {
    nome: string;
    cpf: string;
    email?: string;
    email_corporativo?: string;
    telefone?: string;
    cargo?: string;
    cargo_id?: string;
  }) => {
    try {
      // Verificar se CPF já existe ANTES de tentar inserir
      const { data: existingAgente, error: checkError } = await supabase
        .from("agentes_publicos")
        .select("id, nome")
        .eq("cpf", agente.cpf)
        .eq("ativo", true)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingAgente) {
        toast({
          title: "CPF já cadastrado",
          description: `Este CPF já está cadastrado para: ${existingAgente.nome}`,
          variant: "destructive",
        });
        return false;
      }

      const { error } = await supabase
        .from("agentes_publicos")
        .insert([agente]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Agente público cadastrado com sucesso",
      });

      await loadAgentes();
      return true;
    } catch (error: any) {
      console.error("Erro ao criar agente:", error);
      
      if (error.message?.includes("duplicate key")) {
        toast({
          title: "Erro",
          description: "CPF já cadastrado no sistema",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro",
          description: "Falha ao cadastrar agente público",
          variant: "destructive",
        });
      }
      return false;
    }
  };

  const updateAgente = async (id: string, agente: Partial<AgentePublico>) => {
    try {
      const { error } = await supabase
        .from("agentes_publicos")
        .update(agente)
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Agente público atualizado com sucesso",
      });

      await loadAgentes();
      return true;
    } catch (error) {
      console.error("Erro ao atualizar agente:", error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar agente público",
        variant: "destructive",
      });
      return false;
    }
  };

  const deactivateAgente = async (id: string) => {
    try {
      const { error } = await supabase
        .from("agentes_publicos")
        .update({ ativo: false })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Agente público desativado com sucesso",
      });

      await loadAgentes();
      return true;
    } catch (error) {
      console.error("Erro ao desativar agente:", error);
      toast({
        title: "Erro",
        description: "Falha ao desativar agente público",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    loadAgentes();
  }, []);

  return { agentes, loading, createAgente, updateAgente, deactivateAgente, reload: loadAgentes };
}
