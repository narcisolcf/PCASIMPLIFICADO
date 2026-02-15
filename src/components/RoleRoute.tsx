import { Navigate, Outlet } from "react-router-dom";
import { useRBAC, PerfilUsuario } from "@/hooks/useRBAC";
import { Loader2 } from "lucide-react";

interface RoleRouteProps {
    allowedRoles: PerfilUsuario[];
}

export function RoleRoute({ allowedRoles }: RoleRouteProps) {
    const { perfil, loading } = useRBAC();

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // Se o usuário não tem perfil ou o perfil não está na lista de permitidos
    if (!perfil || !allowedRoles.includes(perfil)) {
        // Pode redirecionar para uma página de "Acesso Negado" ou Dashboard
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}
