import { NavLink } from "./NavLink";
import {
    Database,
    FileText,
    Package,
    ClipboardList,
    FolderKanban,
    BarChart3,
    CheckCircle2,
    Home
} from "lucide-react";

export function Sidebar() {
    const menuItems = [
        {
            icon: Home,
            title: "Dashboard",
            href: "/",
        },
        {
            icon: Database,
            title: "Cadastros",
            href: "/cadastros",
        },
        {
            icon: FileText,
            title: "Áreas Requisitantes",
            href: "/areas-requisitantes",
        },
        {
            icon: Package,
            title: "Catálogo de Itens",
            href: "/catalogo-itens",
        },
        {
            icon: ClipboardList,
            title: "DFDs",
            href: "/dfds",
        },
        {
            icon: FolderKanban,
            title: "Consolidação",
            href: "/consolidacao",
        },
        {
            icon: BarChart3,
            title: "Formação PCA",
            href: "/formacao-pca",
        },
        {
            icon: CheckCircle2,
            title: "Aprovação PCA",
            href: "/aprovacao-pca",
        }
    ];

    return (
        <aside className="w-64 min-h-screen bg-card border-r border-border flex flex-col">
            <div className="p-6 border-b border-border">
                <h1 className="text-xl font-bold text-primary">Sistema PCA</h1>
                <p className="text-xs text-muted-foreground">Planejamento de Contratações</p>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.href}
                        to={item.href}
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                        activeClassName="bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
                    >
                        <item.icon className="h-4 w-4" />
                        {item.title}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-border">
                <div className="text-xs text-center text-muted-foreground">
                    &copy; 2026 Sistema PCA
                </div>
            </div>
        </aside>
    );
}
