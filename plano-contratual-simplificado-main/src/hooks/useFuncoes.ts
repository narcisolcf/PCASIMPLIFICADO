import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Funcao {
  id: string;
  nome: string;
  descricao: string | null;
  ativo: boolean;
}

export function useFuncoes() {
  const [funcoes, setFuncoes] = useState<Funcao[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadFuncoes = async () => {
    try {
      const { data, error } = await supabase
        .from("funcoes")
        .select("*")
        .eq("ativo", true)
        .order("nome", { ascending: true });

      if (error) throw error;

      setFuncoes(data || []);
    } catch (error) {
      console.error("Erro ao carregar funções:", error);
      toast({
        title: "Erro",
        description: "Falha ao carregar funções",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addFuncao = async (nome: string, descricao?: string) => {
    try {
      const { error } = await supabase.from("funcoes").insert([
        {
          nome,
          descricao: descricao || null,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Função adicionada com sucesso",
      });

      await loadFuncoes();
      return true;
    } catch (error: any) {
      console.error("Erro ao adicionar função:", error);
      
      if (error.message?.includes("duplicate")) {
        toast({
          title: "Erro",
          description: "Esta função já existe",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro",
          description: "Falha ao adicionar função",
          variant: "destructive",
        });
      }
      return false;
    }
  };

  useEffect(() => {
    loadFuncoes();
  }, []);

  return { funcoes, loading, addFuncao, reload: loadFuncoes };
}