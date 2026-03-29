"use client";

import { useEffect, useState } from "react";
import { LabService, Reservation } from "@/services/lab.service";
import { motion, Variants } from "framer-motion";
import { Calendar, Search, Filter, Eye, Edit, Trash2, ArrowLeft, History, MonitorPlay } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export default function HistorialReservasPage() {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    // Modal States
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
    const [reservationToDelete, setReservationToDelete] = useState<Reservation | null>(null);
    const [rescheduleDate, setRescheduleDate] = useState("");
    const [rescheduleTime, setRescheduleTime] = useState<number>(7);
    const [isSaving, setIsSaving] = useState(false);

    const fetchData = async () => {
        try {
            const data = await LabService.getReservations();
            setReservations(data);
            setIsLoading(false);
        } catch (error) {
            console.error("Error fetching history:", error);
            toast.error("Error al cargar el historial");
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        let result = [...reservations];

        // Filter by Status
        if (statusFilter !== "all") {
            result = result.filter(res => res.estado === statusFilter);
        }

        // Filter by Search Term
        if (searchTerm.trim() !== "") {
            const term = searchTerm.toLowerCase();
            result = result.filter(res => 
                (res.user_nombre || "").toLowerCase().includes(term) ||
                (res.lab_nombre || "").toLowerCase().includes(term) ||
                (res.materia || "").toLowerCase().includes(term) ||
                res.id.toString().includes(term)
            );
        }

        setFilteredReservations(result);
    }, [reservations, searchTerm, statusFilter]);

    const handleRescheduleSubmit = async () => {
        if (!selectedReservation || !rescheduleDate || !rescheduleTime) return;
        setIsSaving(true);
        try {
            await LabService.rescheduleReservation(selectedReservation.id, rescheduleDate, Number(rescheduleTime));
            toast.success("Reserva modificada exitosamente.");
            setRescheduleModalOpen(false);
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Error al intentar reagendar.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleRequestDelete = (res: Reservation) => {
        setReservationToDelete(res);
        setDeleteConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!reservationToDelete) return;
        setDeleteConfirmOpen(false);
        try {
            await LabService.adminCancelReservation(reservationToDelete.id);
            toast.success("Reserva cancelada y eliminada del sistema.");
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Error al cancelar la reserva.");
        } finally {
            setReservationToDelete(null);
        }
    };

    const pageVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <div className="flex flex-col h-full">
            <header className="w-full flex justify-between items-center mb-8">
                <div>
                    <Link href="/dashboard" className="text-zinc-400 hover:text-white flex items-center gap-2 mb-2 transition-colors w-fit">
                        <ArrowLeft className="w-4 h-4" /> Volver al Inicio
                    </Link>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <History className="w-8 h-8 text-[#D3FB52]" />
                        Historial Global
                    </h1>
                    <p className="text-zinc-400 mt-2">Explora, filtra y administra todas las reservas registradas en el sistema.</p>
                </div>
            </header>

            <motion.div 
                variants={pageVariants}
                initial="hidden"
                animate="visible"
                className="flex-1 overflow-y-auto no-scrollbar bg-[#0D1310] border border-[#1C2721] rounded-3xl p-8 shadow-2xl relative"
            >
                {/* Tools Bar */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8 bg-[#141C18] p-4 rounded-2xl border border-[#2A3B32]">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                        <input 
                            type="text" 
                            placeholder="Buscar por alumno, materia, laboratorio... "
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#0D1310] border border-[#2A3B32] pl-10 pr-4 py-3 rounded-xl text-white outline-none focus:border-[#D3FB52] transition-colors"
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="p-3 bg-[#0D1310] rounded-xl border border-[#2A3B32]">
                            <Filter className="w-5 h-5 text-zinc-400" />
                        </div>
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full md:w-48 bg-[#0D1310] border border-[#2A3B32] px-4 py-3 rounded-xl text-white outline-none focus:border-[#D3FB52] transition-colors appearance-none cursor-pointer"
                        >
                            <option value="all">Todos los estados</option>
                            <option value="active">Solo Activas</option>
                            <option value="expired">Solo Finalizadas</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-[#141C18] border border-[#1C2721] rounded-2xl overflow-hidden shadow-2xl">
                    <div className="px-6 py-4 border-b border-[#1C2721] flex justify-between items-center bg-[#0D1310]/50">
                        <h3 className="text-lg font-semibold text-white">
                            Resultados <span className="text-[#D3FB52] ml-2 font-mono">({filteredReservations.length})</span>
                        </h3>
                    </div>
                    
                    {isLoading ? (
                        <div className="p-20 flex justify-center">
                            <span className="relative flex h-10 w-10">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D3FB52] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-10 w-10 bg-[#D3FB52]"></span>
                            </span>
                        </div>
                    ) : filteredReservations.length === 0 ? (
                        <div className="p-16 text-center flex flex-col items-center">
                            <Search className="w-12 h-12 text-zinc-700 mb-4" />
                            <p className="text-zinc-400 font-medium">No se encontraron reservas con esos criterios.</p>
                            <button onClick={() => { setSearchTerm(""); setStatusFilter("all"); }} className="mt-4 text-[#D3FB52] hover:underline">Limpiar filtros</button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-[#1C2721] bg-[#0A0E0C]">
                                        <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-widest">Estado</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-widest">Solicitante</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-widest">Detalle</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-widest">Fecha y Hora</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-widest text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#1C2721]">
                                    {filteredReservations.map((res) => (
                                        <tr key={res.id} className="hover:bg-[#1C2721]/30 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${res.estado === 'active' ? 'bg-[#D3FB52]/10 text-[#D3FB52] border-[#D3FB52]/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                                    {res.estado === 'active' ? 'ACTIVA' : 'FINALIZADA'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-white font-medium">{res.user_nombre || 'Desconocido'}</div>
                                                <div className="text-xs text-zinc-500 font-mono mt-0.5">#{res.user_id}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-zinc-300">{res.materia}</div>
                                                <div className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1">
                                                    <MonitorPlay className="w-3 h-3" /> {res.lab_nombre || `Lab ${res.lab_id}`}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <div className="text-zinc-300">
                                                    {(() => {
                                                        try {
                                                            const parts = String(res.fecha).split('T')[0].split('-');
                                                            return `${parts[2]}/${parts[1]}/${parts[0]}`;
                                                        } catch {
                                                            return String(res.fecha);
                                                        }
                                                    })()}
                                                </div>
                                                <div className="text-xs text-[#D3FB52] font-mono mt-0.5">{res.hora_inicio}:00 - {res.hora_inicio + 1}:00</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button 
                                                        onClick={() => { setSelectedReservation(res); setViewModalOpen(true); }}
                                                        className="p-2 bg-[#1C2721] text-zinc-400 hover:text-white rounded-lg transition-colors border border-[#2A3B32]"
                                                        title="Ver detalles"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    {res.estado === 'active' && (
                                                        <button 
                                                            onClick={() => {
                                                                setSelectedReservation(res);
                                                                setRescheduleDate(String(res.fecha).split('T')[0]);
                                                                setRescheduleTime(res.hora_inicio);
                                                                setRescheduleModalOpen(true);
                                                            }}
                                                            className="p-2 bg-[#1C2721] text-zinc-400 hover:text-[#D3FB52] rounded-lg transition-colors border border-[#2A3B32]"
                                                            title="Reagendar"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={() => handleRequestDelete(res)}
                                                        className="p-2 bg-[#1C2721] text-zinc-400 hover:text-red-400 rounded-lg transition-colors border border-[#2A3B32] hover:border-red-900"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </motion.div>

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
                        <button onClick={() => setRescheduleModalOpen(false)} disabled={isSaving} className="px-4 py-2 bg-transparent text-zinc-400 hover:text-white transition-colors disabled:opacity-50">
                            Cancelar
                        </button>
                        <button
                            onClick={handleRescheduleSubmit}
                            disabled={isSaving}
                            className="px-4 py-2 bg-[#D3FB52] hover:bg-[#bceb3b] text-black font-semibold rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isSaving && <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-black" />}
                            {isSaving ? "Guardando..." : "Guardar Cambios"}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirm Modal */}
            <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <DialogContent className="bg-[#0D1310] border-red-900/50 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-xl flex items-center gap-2 text-red-400">
                            <Trash2 className="w-5 h-5" /> Cancelar Reserva
                        </DialogTitle>
                        <DialogDescription className="text-zinc-400 pt-2">
                            Estas a punto de cancelar la reserva de <span className="text-white font-semibold">{reservationToDelete?.user_nombre || 'este usuario'}</span> en <span className="text-white font-semibold">{reservationToDelete?.lab_nombre || `Lab #${reservationToDelete?.lab_id}`}</span>. Esta accion no se puede deshacer.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0 mt-4">
                        <button onClick={() => setDeleteConfirmOpen(false)} className="px-4 py-2 bg-transparent text-zinc-400 hover:text-white transition-colors">
                            Volver
                        </button>
                        <button
                            onClick={handleConfirmDelete}
                            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" /> Confirmar Cancelacion
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
