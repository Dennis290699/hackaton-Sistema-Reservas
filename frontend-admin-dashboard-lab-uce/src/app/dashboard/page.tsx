"use client";

import { useEffect, useState } from "react";
import { TopHeader } from "@/components/dashboard/TopHeader";
import { LabService, Lab, Reservation } from "@/services/lab.service";
import { AuthService } from "@/services/auth.service";
import { motion, Variants } from "framer-motion";
import { Calendar, MonitorPlay, Activity, Clock, Layers, Users, CheckCircle, Eye, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useNotificationStore } from "@/store/notificationsStore";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import Link from "next/link";

export default function InicioPage() {
    const [labs, setLabs] = useState<Lab[]>([]);
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [activeReservations, setActiveReservations] = useState(0);
    const [recentUpcoming, setRecentUpcoming] = useState<Reservation[]>([]);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [adminName, setAdminName] = useState("Administrador");

    // Modal States
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
    const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
    const [rescheduleDate, setRescheduleDate] = useState("");
    const [rescheduleTime, setRescheduleTime] = useState<number>(7);

    const fetchDashboardData = async (silent = false) => {
        try {
            const [labsData, reservationsData] = await Promise.all([
                LabService.listLabs(),
                LabService.getReservations(),
            ]);

            setLabs(labsData);
            setReservations(reservationsData);

            // Calculate active/upcoming reservations using safe string parsing
            const todayStr = new Date().toLocaleString("en-US", { timeZone: "America/Guayaquil" });
            const today = new Date(todayStr);
            const currentHour = today.getHours();
            const todayNormalized = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

            const upcoming = reservationsData.filter((res) => {
                const dateStr = String(res.fecha).split("T")[0];
                const parts = dateStr.split("-");
                const resDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])).getTime();

                if (resDate > todayNormalized) return true;
                if (resDate === todayNormalized && res.hora_inicio >= currentHour) return true;
                return false;
            });

            // Sort upcoming safely
            const sortedUpcoming = [...upcoming].sort((a, b) => {
                const dateAStr = String(a.fecha).split("T")[0];
                const dateBStr = String(b.fecha).split("T")[0];
                if (dateAStr > dateBStr) return 1;
                if (dateAStr < dateBStr) return -1;
                return a.hora_inicio - b.hora_inicio;
            });

            setActiveReservations(upcoming.length);
            setRecentUpcoming(sortedUpcoming.slice(0, 5));

            // Zustand Notification Logic
            if (!silent) {
                // Initial load: Seed the store and clear unread count
                useNotificationStore.getState().addNotifications(reservationsData);
                useNotificationStore.getState().clearUnread();
                setIsInitialLoading(false);
            } else {
                // Silent background polling: Check for new items
                const store = useNotificationStore.getState();
                const previousCount = store.unreadCount;
                store.addNotifications(reservationsData);
                const newCount = useNotificationStore.getState().unreadCount;

                if (newCount > previousCount) {
                    const diff = newCount - previousCount;
                    toast.success(`Tienes ${diff} ${diff === 1 ? 'nueva reserva' : 'nuevas reservas'}`, {
                        description: "Revisa la campanita para más detalles."
                    });
                }
            }
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            if (!silent) {
                toast.error("Error al conectar con el servidor", {
                    description: "Verifica tu conexión y los servicios en Render.",
                });
                setIsInitialLoading(false);
            }
        }
    };

    const handleRescheduleSubmit = async () => {
        if (!selectedReservation || !rescheduleDate || !rescheduleTime) return;

        try {
            await LabService.rescheduleReservation(selectedReservation.id, rescheduleDate, Number(rescheduleTime));
            toast.success("Reserva modificada exitosamente.");
            setRescheduleModalOpen(false);
            fetchDashboardData(true); // background silent refresh
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Error al intentar reagendar. Comprueba que el horario esté libre.");
        }
    };

    const handleDeleteReservation = async (id: number) => {
        if (!window.confirm("¿Estás seguro de que deseas cancelar esta reserva? Esta acción no se puede deshacer.")) return;
        try {
            await LabService.cancelReservation(id);
            toast.success("Reserva cancelada y eliminada del sistema.");
            fetchDashboardData(true);
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Error al cancelar la reserva.");
        }
    };

    useEffect(() => {
        const user = AuthService.getCurrentUser();
        if (user && user.nombre) {
            setAdminName(user.nombre);
        }

        // Initial fetch showing loaders
        fetchDashboardData(false);

        // Silent background polling every 30 seconds
        const intervalId = setInterval(() => {
            fetchDashboardData(true);
        }, 30000);

        return () => clearInterval(intervalId);
    }, []);

    const currentDate = new Intl.DateTimeFormat('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(new Date());

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
    };

    return (
        <div className="flex flex-col h-full">
            <TopHeader />

            <div className="flex flex-1 overflow-hidden pb-4">
                <div className="flex-1 overflow-y-auto no-scrollbar h-full rounded-3xl bg-[#0D1310] border border-[#1C2721] p-8 shadow-xl">

                    {/* Welcome Banner */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 pb-6 border-b border-[#1C2721]"
                    >
                        <div>
                            <p className="text-zinc-400 font-light flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-[#D3FB52]" />
                                <span className="capitalize text-lg text-white font-medium">{currentDate}</span>
                            </p>
                        </div>
                        <div className="mt-4 md:mt-0 px-4 py-2 bg-[#141C18] border border-[#2A3B32] rounded-full flex items-center gap-3">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D3FB52] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#D3FB52]"></span>
                            </span>
                            <span className="text-sm font-medium text-zinc-300">Sistema en Línea</span>
                        </div>
                    </motion.div>

                    {/* Dashboard Content */}
                    {isInitialLoading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Activity className="w-10 h-10 text-[#D3FB52] animate-pulse mb-4" />
                            <p className="text-zinc-500">Sincronizando sistema...</p>
                        </div>
                    ) : (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="space-y-10"
                        >
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <button className="bg-gradient-to-br from-[#1C2721] to-[#141C18] p-6 rounded-2xl border border-[#2A3B32] shadow-lg flex flex-col justify-between group hover:border-[#D3FB52]/50 transition-all hover:translate-y-[-2px] text-left">
                                    <div className="flex items-center justify-between mb-4 w-full">
                                        <div className="p-3 bg-[#0D1310] rounded-xl border border-[#2A3B32] group-hover:border-[#D3FB52]/30 transition-colors">
                                            <CheckCircle className="text-[#D3FB52] w-6 h-6" />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-[#D3FB52] transition-colors">Revisar Reservas</h3>
                                        <p className="text-sm font-normal text-zinc-500 line-clamp-2">Gestionar y supervisar {activeReservations} reservas entrantes</p>
                                    </div>
                                </button>

                                <Link href="/dashboard/laboratorios" className="bg-gradient-to-br from-[#1C2721] to-[#141C18] p-6 rounded-2xl border border-[#2A3B32] shadow-lg flex flex-col justify-between group hover:border-[#3D5246] transition-all hover:translate-y-[-2px] text-left block">
                                    <div className="flex items-center justify-between mb-4 w-full">
                                        <div className="p-3 bg-[#0D1310] rounded-xl border border-[#2A3B32]">
                                            <MonitorPlay className="text-zinc-400 group-hover:text-white transition-colors w-6 h-6" />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-1">Laboratorios</h3>
                                        <p className="text-sm font-normal text-zinc-500 line-clamp-2">Administrar {labs.length} laboratorios y su equipamiento</p>
                                    </div>
                                </Link>

                                <Link href="/dashboard/usuarios" className="bg-gradient-to-br from-[#1C2721] to-[#141C18] p-6 rounded-2xl border border-[#2A3B32] shadow-lg flex flex-col justify-between group hover:border-[#3D5246] transition-all hover:translate-y-[-2px] text-left block">
                                    <div className="flex items-center justify-between mb-4 w-full">
                                        <div className="p-3 bg-[#0D1310] rounded-xl border border-[#2A3B32]">
                                            <Users className="text-zinc-400 group-hover:text-white transition-colors w-6 h-6" />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-1">Directorio Usuarios</h3>
                                        <p className="text-sm font-normal text-zinc-500 line-clamp-2">Administrar accesos, roles y cuentas del alumnado</p>
                                    </div>
                                </Link>
                            </div>

                            {/* Recent Activity Table */}
                            <motion.div variants={itemVariants} className="bg-[#141C18] border border-[#1C2721] rounded-2xl overflow-hidden shadow-2xl">
                                <div className="px-6 py-5 border-b border-[#1C2721] flex justify-between items-center bg-[#0D1310]/50">
                                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-[#D3FB52]" />
                                        Actividad Reciente
                                    </h3>
                                    <span className="text-xs font-medium bg-[#1C2721] text-zinc-400 px-3 py-1 rounded-full border border-[#2A3B32]">
                                        Actualización en tiempo real
                                    </span>
                                </div>

                                {recentUpcoming.length === 0 ? (
                                    <div className="p-12 text-center flex flex-col items-center">
                                        <Calendar className="w-12 h-12 text-zinc-700 mb-4" />
                                        <p className="text-zinc-400 font-medium">No hay reservas programadas próximamente</p>
                                        <p className="text-sm text-zinc-600 mt-1">El sistema está vacío por el momento.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="border-b border-[#1C2721] bg-[#0A0E0C]">
                                                    <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-widest">Laboratorio</th>
                                                    <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-widest">Materia</th>
                                                    <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-widest">Fecha</th>
                                                    <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-widest text-right">Horario</th>
                                                    <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-widest text-right">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#1C2721]">
                                                {recentUpcoming.map((res, i) => (
                                                    <motion.tr
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: i * 0.1 }}
                                                        key={`${res.id}-${i}`}
                                                        className="hover:bg-[#1C2721]/30 transition-colors group"
                                                    >
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-2 h-2 rounded-full bg-[#D3FB52] group-hover:shadow-[0_0_8px_#D3FB52] transition-shadow"></div>
                                                                <span className="text-zinc-300 font-medium">{res.lab_nombre || `Lab #${res.lab_id}`}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-zinc-400">
                                                            {res.materia}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                            <span className="bg-[#1C2721] text-zinc-300 px-3 py-1 rounded-md border border-[#2A3B32]">
                                                                {(() => {
                                                                    try {
                                                                        const dateStr = String(res.fecha).split('T')[0];
                                                                        const [year, month, day] = dateStr.split('-');
                                                                        return `${day}/${month}/${year}`;
                                                                    } catch {
                                                                        return String(res.fecha);
                                                                    }
                                                                })()}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-zinc-300 font-mono text-right">
                                                            {res.hora_inicio}:00 - {res.hora_inicio + 1}:00
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedReservation(res);
                                                                        setViewModalOpen(true);
                                                                    }}
                                                                    className="p-2 bg-[#1C2721] hover:bg-[#2A3B32] text-zinc-400 hover:text-white rounded-lg transition-colors border border-[#2A3B32]"
                                                                    title="Ver detalles"
                                                                >
                                                                    <Eye className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedReservation(res);
                                                                        setRescheduleDate(String(res.fecha).split('T')[0]);
                                                                        setRescheduleTime(res.hora_inicio);
                                                                        setRescheduleModalOpen(true);
                                                                    }}
                                                                    className="p-2 bg-[#1C2721] hover:bg-[#2A3B32] text-zinc-400 hover:text-[#D3FB52] rounded-lg transition-colors border border-[#2A3B32]"
                                                                    title="Reagendar reserva"
                                                                >
                                                                    <Edit className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteReservation(res.id)}
                                                                    className="p-2 bg-[#1C2721] hover:bg-red-950 text-zinc-400 hover:text-red-400 rounded-lg transition-colors border border-[#2A3B32] hover:border-red-900"
                                                                    title="Cancelar reserva"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </motion.tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </motion.div>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* View Details Modal */}
            <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
                <DialogContent className="bg-[#0D1310] border-[#1C2721] text-white">
                    <DialogHeader>
                        <DialogTitle className="text-xl flex items-center gap-2">
                            <Eye className="w-5 h-5 text-[#D3FB52]" /> Detalles de Reserva
                        </DialogTitle>
                        <DialogDescription className="text-zinc-400">
                            Información completa sobre la reserva y el solicitante.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedReservation && (
                        <div className="space-y-4 my-4">
                            <div className="bg-[#141C18] p-4 rounded-xl border border-[#2A3B32]">
                                <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-3">Información del Solicitante</h3>
                                <div className="space-y-2">
                                    <p className="flex justify-between"><span className="text-zinc-400">Nombre:</span> <span className="font-semibold">{selectedReservation.user_nombre || 'Desconocido'}</span></p>
                                    <p className="flex justify-between"><span className="text-zinc-400">Correo Electrónico:</span> <span className="text-zinc-300">{selectedReservation.user_email || 'No proporcionado'}</span></p>
                                    <p className="flex justify-between"><span className="text-zinc-400">ID Usuario:</span> <span>#{selectedReservation.user_id}</span></p>
                                    <p className="flex justify-between"><span className="text-zinc-400">ID Reserva:</span> <span className="font-mono text-[#D3FB52]">#{selectedReservation.id}</span></p>
                                </div>
                            </div>
                            <div className="bg-[#141C18] p-4 rounded-xl border border-[#2A3B32]">
                                <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-3">Detalles de uso</h3>
                                <div className="space-y-2">
                                    <p className="flex justify-between"><span className="text-zinc-400">Laboratorio:</span> <span className="font-semibold">{selectedReservation.lab_nombre || `Lab #${selectedReservation.lab_id}`}</span></p>
                                    <p className="flex justify-between"><span className="text-zinc-400">Materia:</span> <span>{selectedReservation.materia}</span></p>
                                    <p className="flex justify-between"><span className="text-zinc-400">Fecha:</span> <span>{String(selectedReservation.fecha).split('T')[0]}</span></p>
                                    <p className="flex justify-between"><span className="text-zinc-400">Horario:</span> <span>{selectedReservation.hora_inicio}:00 - {selectedReservation.hora_inicio + 1}:00</span></p>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <button onClick={() => setViewModalOpen(false)} className="px-4 py-2 bg-[#1C2721] hover:bg-[#2A3B32] text-white rounded-lg transition-colors border border-[#2A3B32]">
                            Cerrar
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reschedule Modal */}
            <Dialog open={rescheduleModalOpen} onOpenChange={setRescheduleModalOpen}>
                <DialogContent className="bg-[#0D1310] border-[#1C2721] text-white">
                    <DialogHeader>
                        <DialogTitle className="text-xl flex items-center gap-2">
                            <Edit className="w-5 h-5 text-[#D3FB52]" /> Reagendar Reserva
                        </DialogTitle>
                        <DialogDescription className="text-zinc-400">
                            Modifica la fecha y hora de la reserva actual.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedReservation && (
                        <div className="space-y-4 my-4">
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                <p className="text-xs text-red-400">Asegúrate de coordinar este cambio con el alumno previamente para evitar conflictos de horario.</p>
                            </div>

                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-zinc-300">Nueva Fecha</label>
                                <input
                                    type="date"
                                    value={rescheduleDate}
                                    min={new Date().toLocaleDateString('en-CA')}
                                    onChange={(e) => setRescheduleDate(e.target.value)}
                                    className="w-full bg-[#141C18] border border-[#2A3B32] p-3 rounded-lg text-white outline-none focus:border-[#D3FB52] transition-colors"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-zinc-300">Nueva Hora de Inicio</label>
                                <select
                                    value={rescheduleTime}
                                    onChange={(e) => setRescheduleTime(Number(e.target.value))}
                                    className="w-full bg-[#141C18] border border-[#2A3B32] p-3 rounded-lg text-white outline-none focus:border-[#D3FB52] transition-colors"
                                >
                                    {[7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map(h => (
                                        <option key={h} value={h}>{h}:00</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                    <DialogFooter className="gap-2 sm:gap-0">
                        <button onClick={() => setRescheduleModalOpen(false)} className="px-4 py-2 bg-transparent text-zinc-400 hover:text-white transition-colors">
                            Cancelar
                        </button>
                        <button onClick={handleRescheduleSubmit} className="px-4 py-2 bg-[#D3FB52] hover:bg-[#bceb3b] text-black font-semibold rounded-lg transition-colors">
                            Guardar Cambios
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
