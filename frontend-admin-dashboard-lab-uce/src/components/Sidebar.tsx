"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    Calendar as CalendarIcon,
    Settings,
    LogOut,
    FlaskConical,
    Activity
} from "lucide-react";
import { AuthService } from "@/services/auth.service";

const navItems = [
    { name: "Inicio", href: "/dashboard", icon: LayoutDashboard },
    { name: "Calendario", href: "/dashboard/calendario", icon: CalendarIcon },
    { name: "Laboratorios", href: "/dashboard/laboratorios", icon: FlaskConical },
    { name: "Usuarios", href: "/dashboard/usuarios", icon: Users },
    { name: "Ajustes", href: "/dashboard/ajustes", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();

    const handleLogout = (e: React.MouseEvent) => {
        e.preventDefault();
        AuthService.logout();
    };

    return (
        <aside className="w-24 lg:w-32 h-screen fixed left-0 top-0 flex flex-col items-center py-8 bg-zinc-950/50 border-r border-[#1C2721] z-50">
            {/* Brand Icon */}
            <div className="w-12 h-12 bg-gradient-to-br from-[#D3FB52] to-[#b0d836] rounded-2xl flex items-center justify-center mb-12 shadow-[0_0_20px_rgba(211,251,82,0.4)] ring-2 ring-[#0D1310] ring-offset-2 ring-offset-[#1C2721]">
                <Activity className="w-6 h-6 text-black" strokeWidth={3} />
            </div>

            {/* Nav Links */}
            <nav className="flex-1 w-full flex flex-col items-center gap-6">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center justify-center w-full gap-1.5 transition-colors group relative ${isActive ? "text-[#D3FB52]" : "text-zinc-500 hover:text-zinc-300"
                                }`}
                        >
                            <div
                                className={`p-3 rounded-2xl transition-all duration-300 ${isActive
                                    ? "bg-[#1C2721] shadow-inner border border-[#2A3B32]/50"
                                    : "group-hover:bg-[#1C2721]/50"
                                    }`}
                            >
                                <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                            <span className="text-[10px] font-medium tracking-wide">
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="mt-auto w-full">
                <button
                    onClick={handleLogout}
                    className="w-full flex flex-col items-center justify-center gap-1.5 text-zinc-500 hover:text-red-400 transition-colors group"
                >
                    <div className="p-3 rounded-2xl group-hover:bg-red-500/10 transition-all duration-300">
                        <LogOut className="w-6 h-6" strokeWidth={2} />
                    </div>
                    <span className="text-[10px] font-medium tracking-wide">
                        Salir
                    </span>
                </button>
            </div>
        </aside>
    );
}
