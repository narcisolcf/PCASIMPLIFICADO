import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface CatalogoItem {
  id: string;
  codigo_item: string | null;
  tipo: "Material" | "Serviço";
  descricao: string;
  unidade_medida: string;
  valor_unitario_referencia: number | null;
  especificacoes: string | null;
  ativo: boolean;
}

export function useCatalogoItens() {
  const [itens, setItens] = useState<CatalogoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadItens = async (filtros?: { tipo?: string; unidade_medida?: string }) => {
    try {
      let query = supabase
        .from("catalogo_itens")
        .select("*")
        .eq("ativo", true)
        .order("descricao", { ascending: true });

      if (filtros?.tipo) {
        query = query.eq("tipo", filtros.tipo as "Material" | "Serviço");
      }

      if (filtros?.unidade_medida) {
        query = query.eq("unidade_medida", filtros.unidade_medida);
      }

      const { data, error } = await query;

      if (error) throw error;

      setItens(data || []);
    } catch (error) {
      console.error("Erro ao carregar catálogo:", error);
      toast({
        title: "Erro",
        description: "Falha ao carregar catálogo de itens",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItens();
  }, []);

  const createItem = async (item: Omit<CatalogoItem, "id" | "ativo">) => {
    try {
      const { error } = await supabase.from("catalogo_itens").insert(item);
      if (error) throw error;
      toast({ title: "Sucesso", description: "Item criado com sucesso" });
      loadItens();
    } catch (error) {
      console.error("Erro ao criar item:", error);
      toast({ title: "Erro", description: "Falha ao criar item", variant: "destructive" });
    }
  };

  const updateItem = async (id: string, item: Partial<CatalogoItem>) => {
    try {
      const { error } = await supabase.from("catalogo_itens").update(item).eq("id", id);
      if (error) throw error;
      toast({ title: "Sucesso", description: "Item atualizado com sucesso" });
      loadItens();
    } catch (error) {
      console.error("Erro ao atualizar item:", error);
      toast({ title: "Erro", description: "Falha ao atualizar item", variant: "destructive" });
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const { error } = await supabase.from("catalogo_itens").update({ ativo: false }).eq("id", id);
      if (error) throw error;
      toast({ title: "Sucesso", description: "Item desativado com sucesso" });
      loadItens();
    } catch (error) {
      console.error("Erro ao desativar item:", error);
      toast({ title: "Erro", description: "Falha ao desativar item", variant: "destructive" });
    }
  };

  return { itens, loading, loadItens, createItem, updateItem, deleteItem };
}