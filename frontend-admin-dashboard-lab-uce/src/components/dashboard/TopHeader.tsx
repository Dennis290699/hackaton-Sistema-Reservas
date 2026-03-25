"use client";

import { useEffect, useState } from "react";
import { Settings, Bell, X, Trash2, History } from "lucide-react";
import { toast } from "sonner";
import { AuthService, AdminUser } from "@/services/auth.service";
import { useNotificationStore } from "@/store/notificationsStore";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from "next/link";

export function TopHeader() {
    const [user, setUser] = useState<AdminUser | null>(null);
    const { notifications, unreadCount, clearUnread, removeNotification, clearAllNotifications } = useNotificationStore();

    useEffect(() => {
        const currentUser = AuthService.getCurrentUser();
        // eslint-disable-next-line
        setUser(currentUser as any);
    }, []);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return "Buenos días";
        if (hour >= 12 && hour < 19) return "Buenas tardes";
        return "Buenas noches";
    };

    const getInitials = (name?: string) => {
        if (!name) return "AD";
        const parts = name.trim().split(" ");
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    return (
        <header className="w-full flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden bg-[#2A3B32] border-2 border-[#D3FB52] flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(211,251,82,0.2)]">
                        <span className="text-[#D3FB52] font-bold text-lg tracking-wider">
                            {getInitials(user?.full_name)}
                        </span>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white whitespace-nowrap">
                            {getGreeting()}, <span className="text-[#D3FB52]">{user ? user.full_name.split(" ")[0] : "Admin"}</span>
                        </h2>
                        <p className="text-sm text-zinc-400 font-medium">Administrador del Sistema</p>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 text-zinc-400">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="p-2 hover:bg-[#1C2721] rounded-full hover:text-white transition-colors outline-none cursor-pointer">
                                <Settings className="w-5 h-5" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 bg-[#0D1310] border-[#1C2721] text-white mt-2">
                            <DropdownMenuLabel className="font-medium text-zinc-400">Accesos Rápidos</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-[#1C2721]" />
                            <DropdownMenuItem asChild className="hover:bg-[#1C2721] focus:bg-[#1C2721] focus:text-white cursor-pointer outline-none">
                                <Link href="/dashboard/historial-reservas" className="w-full flex items-center gap-2">
                                    <History className="w-4 h-4 text-zinc-400" />
                                    Historial Global
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-[#1C2721]" />
                            <DropdownMenuItem disabled className="text-zinc-500 font-medium cursor-not-allowed">
                                Más opciones pronto...
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Sheet onOpenChange={(open: boolean) => { if (open) clearUnread(); }}>
                        <SheetTrigger asChild>
                            <button
                                onClick={(e) => {
                                    if (unreadCount === 0 && notifications.length === 0) {
                                        e.preventDefault();
                                        toast.info("No tienes notificaciones nuevas");
                                    }
                                }}
                                className="p-2 hover:bg-[#1C2721] rounded-full hover:text-white transition-colors relative"
                            >
                                <Bell className="w-5 h-5" />
                                {unreadCount > 0 ? (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#D3FB52] rounded-full flex items-center justify-center text-[10px] font-bold text-black border-2 border-[#0D1310]">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                ) : (
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-transparent rounded-full"></span>
                                )}
                            </button>
                        </SheetTrigger>
                        <SheetContent className="bg-[#0D1310] border-l border-[#1C2721] text-white overflow-y-auto no-scrollbar sm:max-w-md w-full p-6 flex flex-col">
                            <SheetHeader className="mb-6 shrink-0">
                                <SheetTitle className="text-white text-xl flex items-center gap-2">
                                    <Bell className="w-5 h-5 text-[#D3FB52]" /> Historial de Notificaciones
                                </SheetTitle>
                                <SheetDescription className="text-zinc-400">
                                    Actividad reciente del sistema de reservas.
                                </SheetDescription>

                                {notifications.length > 0 && (
                                    <div className="flex justify-end mt-4">
                                        <button 
                                            onClick={clearAllNotifications}
                                            className="text-xs flex items-center gap-1 text-zinc-500 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 className="w-3 h-3" /> Limpiar todo
                                        </button>
                                    </div>
                                )}
                            </SheetHeader>
                            <div className="space-y-4 flex-1">
                                {notifications.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-center">
                                        <Bell className="w-12 h-12 text-zinc-700 mb-4 opacity-50" />
                                        <p className="text-zinc-400 font-medium">Bandeja Vacía</p>
                                        <p className="text-sm text-zinc-600 mt-1">Acá aparecerán las nuevas alertas de interacción de los alumnos.</p>
                                    </div>
                                ) : (
                                    notifications.map((notif) => (
                                        <div key={notif.id} className="p-5 rounded-2xl bg-[#141C18] border border-[#2A3B32] hover:border-[#3D5246] transition-colors relative group">
                                            <button 
                                                onClick={() => removeNotification(notif.id)}
                                                className="absolute top-4 right-4 text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity bg-[#0D1310] p-1.5 rounded-md border border-[#1C2721]"
                                                title="Ocultar notificación"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                            <div className="flex justify-between items-start mb-3 pr-8">
                                                <h4 className="font-medium text-[#D3FB52] text-sm flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-[#D3FB52] shadow-[0_0_8px_#D3FB52]"></span>
                                                    Reserva Reciente
                                                </h4>
                                                <span className="text-xs font-mono text-zinc-500 bg-[#0D1310] px-2 py-1 rounded-md border border-[#1C2721]">#{notif.id}</span>
                                            </div>
                                            <p className="text-sm text-zinc-300 mb-4 leading-relaxed line-clamp-2">
                                                Materia agendada: <span className="font-semibold text-white">{notif.materia}</span>
                                            </p>
                                            <div className="text-xs text-zinc-400 flex flex-wrap gap-2">
                                                <span className="bg-[#0D1310] px-2 py-1.5 rounded-lg border border-[#1C2721] flex items-center gap-1">
                                                    <span className="text-zinc-500">Lab:</span> {notif.lab_nombre || notif.lab_id}
                                                </span>
                                                <span className="bg-[#0D1310] px-2 py-1.5 rounded-lg border border-[#1C2721] flex items-center gap-1">
                                                    <span className="text-zinc-500">Fecha:</span> 
                                                    {(() => {
                                                        try {
                                                            const parts = String(notif.fecha).split('T')[0].split('-');
                                                            return `${parts[2]}/${parts[1]}/${parts[0]}`;
                                                        } catch {
                                                            return String(notif.fecha);
                                                        }
                                                    })()}
                                                </span>
                                                <span className="bg-[#0D1310] px-2 py-1.5 rounded-lg border border-[#2A3B32] flex items-center gap-1 font-medium">
                                                    <span className="text-[#D3FB52]">Horario:</span> {notif.hora_inicio}:00
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            
                            <SheetFooter className="mt-8 pt-6 border-t border-[#1C2721] shrink-0">
                                <Link 
                                    href="/dashboard/historial-reservas"
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#1C2721] hover:bg-[#2A3B32] text-[#D3FB52] rounded-xl transition-colors font-medium border border-[#2A3B32]"
                                >
                                    <History className="w-4 h-4" />
                                    Buscador Global e Historial
                                </Link>
                            </SheetFooter>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}
