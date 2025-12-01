import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface UASG {
  id: string;
  numero_uasg: string;
  nome: string;
  disponibilidade_orcamentaria: number;
}

export function useUASGs() {
  const [uasgs, setUasgs] = useState<UASG[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadUASGs = async () => {
    try {
      const { data, error } = await supabase
        .from("uasgs")
        .select("*")
        .order("numero_uasg", { ascending: true });

      if (error) throw error;

      setUasgs(data || []);
    } catch (error) {
      console.error("Erro ao carregar UNIDADES GESTORAS:", error);
      toast({
        title: "Erro",
        description: "Falha ao carregar UNIDADES GESTORAS",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUASGs();
  }, []);

  return { uasgs, loading, reload: loadUASGs };
}