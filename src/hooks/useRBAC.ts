import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

export type PerfilUsuario = 'admin' | 'gestor' | 'requisitante';

export function useRBAC() {
    const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const fetchPerfil = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                setUser(user);

                if (user) {
                    // Buscar perfil na tabela agentes_publicos usando o email do usuário
                    // Assumindo que o email do auth bate com o email do agente
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const { data, error } = await (supabase as any)
                        .from('agentes_publicos')
                        .select('perfil')
                        .eq('email', user.email)
                        .single();

                    if (data) {
                        setPerfil(data.perfil as PerfilUsuario);
                    } else {
                        // Se não achar agente vinculado, assume visitante ou requisitante padrão?
                        // Por segurança, vamos deixar null ou 'requisitante' se for politica de portas abertas
                        // Mas para RBAC estrito, null é melhor (sem permissão explícita)
                        console.warn("Agente público não encontrado para este usuário.");
                        setPerfil(null);
                    }
                }
            } catch (error) {
                console.error("Erro ao buscar perfil RBAC:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPerfil();
    }, []);

    const isAdmin = () => perfil === 'admin';
    const isGestor = () => perfil === 'gestor' || perfil === 'admin';
    const isRequisitante = () => !!perfil; // Qualquer um cadastrado

    // Função genérica para verificar permissões (pode expandir no futuro)
    const can = (action: string) => {
        if (perfil === 'admin') return true;
        // Adicionar lógica específica por ação aqui se necessário
        return false;
    };

    return {
        perfil,
        loading,
        user,
        isAdmin,
        isGestor,
        isRequisitante,
        can
    };
}
