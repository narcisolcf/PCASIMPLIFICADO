import { NavLink } from "./NavLink";
import { useRBAC, PerfilUsuario } from "@/hooks/useRBAC";
import {
    Database,
    FileText,
    Package,
    ClipboardList,
    FolderKanban,
    BarChart3,
    CheckCircle2,
    Home,
    FileCode,
    ShieldAlert,
    LogOut,
    type LucideIcon
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface MenuItem {
    icon: LucideIcon;
    title: string;
    href: string;
    roles: PerfilUsuario[];
}

interface MenuSection {
    label: string;
    items: MenuItem[];
}

const menuSections: MenuSection[] = [
    {
        label: "Principal",
        items: [
            { icon: Home, title: "Dashboard", href: "/", roles: ["admin", "gestor", "requisitante"] },
        ],
    },
    {
        label: "Operacional",
        items: [
            { icon: FileText, title: "Áreas Requisitantes", href: "/areas-requisitantes", roles: ["admin", "gestor", "requisitante"] },
            { icon: Package, title: "Catálogo de Itens", href: "/catalogo-itens", roles: ["admin", "gestor", "requisitante"] },
            { icon: ClipboardList, title: "DFDs", href: "/dfds", roles: ["admin", "gestor", "requisitante"] },
            { icon: FileCode, title: "Modelos", href: "/modelos", roles: ["admin", "gestor", "requisitante"] },
        ],
    },
    {
        label: "Gestão",
        items: [
            { icon: FolderKanban, title: "Consolidação", href: "/consolidacao", roles: ["admin", "gestor"] },
            { icon: BarChart3, title: "Formação PCA", href: "/formacao-pca", roles: ["admin", "gestor"] },
            { icon: CheckCircle2, title: "Aprovação PCA", href: "/aprovacao-pca", roles: ["admin", "gestor"] },
        ],
    },
    {
        label: "Administração",
        items: [
            { icon: Database, title: "Cadastros", href: "/cadastros", roles: ["admin"] },
            { icon: ShieldAlert, title: "Auditoria", href: "/auditoria", roles: ["admin"] },
        ],
    },
];

export function Sidebar() {
    const { perfil, user } = useRBAC();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/login");
    };

    const visibleSections = menuSections
        .map((section) => ({
            ...section,
            items: section.items.filter((item) => perfil && item.roles.includes(perfil)),
        }))
        .filter((section) => section.items.length > 0);

    return (
        <aside className="w-64 min-h-screen bg-card border-r border-border flex flex-col">
            <div className="p-6 border-b border-border">
                <h1 className="text-xl font-bold text-primary">Sistema PCA</h1>
                <p className="text-xs text-muted-foreground">Planejamento de Contratações</p>
            </div>

            <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
                {visibleSections.map((section) => (
                    <div key={section.label}>
                        <p className="px-4 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                            {section.label}
                        </p>
                        <div className="space-y-1">
                            {section.items.map((item) => (
                                <NavLink
                                    key={item.href}
                                    to={item.href}
                                    end={item.href === "/"}
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                                    activeClassName="bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
                                >
                                    <item.icon className="h-4 w-4" />
                                    {item.title}
                                </NavLink>
                            ))}
                        </div>
                    </div>
                ))}
            </nav>

            <div className="p-4 border-t border-border space-y-3">
                {user && (
                    <div className="px-2">
                        <p className="text-xs font-medium text-foreground truncate">{user.email}</p>
                        <p className="text-xs text-muted-foreground capitalize">{perfil || "carregando..."}</p>
                    </div>
                )}
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                    <LogOut className="h-4 w-4" />
                    Sair
                </button>
                <div className="text-xs text-center text-muted-foreground">
                    &copy; 2026 Sistema PCA
                </div>
            </div>
        </aside>
    );
}
