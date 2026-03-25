"use client";

import { useEffect, useState } from "react";
import { Plus, ChevronDown, List, Grid, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { LabService, Lab, Reservation, CreateBookingRequest } from "@/services/lab.service";
import { ReservationModal } from "./ReservationModal";
import { ViewReservationModal } from "./ViewReservationModal";

// Utilities for date parsing to prevent UTC timezone shifts
function parseLocalDate(dateStr: unknown): Date {
    if (!dateStr) return new Date();
    const cleanDateStr = String(dateStr).split('T')[0];
    const [year, month, day] = cleanDateStr.split('-');
    return new Date(Number(year), Number(month) - 1, Number(day));
}

interface MainCalendarProps {
    currentViewDate?: Date;
    setCurrentViewDate?: React.Dispatch<React.SetStateAction<Date>>;
}

export function MainCalendar({ currentViewDate: externalDate, setCurrentViewDate: setExternalDate }: MainCalendarProps) {
    const [labs, setLabs] = useState<Lab[]>([]);
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [viewReservation, setViewReservation] = useState<Reservation | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [listFilter, setListFilter] = useState<'day' | 'week' | 'month'>('month');

    // Date states
    const [internalViewDate, setInternalViewDate] = useState<Date>(new Date());
    const currentViewDate = externalDate || internalViewDate;
    const setCurrentViewDate = setExternalDate || setInternalViewDate;

    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [labsData, resData] = await Promise.all([
                    LabService.listLabs(),
                    LabService.getReservations(),
                ]);
                setLabs(labsData);
                setReservations(resData);
            } catch (error) {
                console.error("Error fetching calendar data", error);
            }
        };
        fetchData();

        // Background Auto-sync every 15 seconds (imperceptible to user)
        const interval = setInterval(async () => {
            try {
                const resData = await LabService.getReservations();
                setReservations(resData);
            } catch (err) {
                console.error("Auto-sync error", err);
            }
        }, 15000);

        return () => clearInterval(interval);
    }, []);

    const refreshData = async () => {
        try {
            const resData = await LabService.getReservations();
            setReservations(resData);
        } catch (error) {
            console.error("Error refreshing reservations", error);
        }
    };

    const handleOpenModal = (dateStr?: string) => {
        if (dateStr) {
            // Fix timezone offset when parsing YYYY-MM-DD
            const [year, month, day] = dateStr.split('-');
            setSelectedDate(new Date(Number(year), Number(month) - 1, Number(day)));
        } else {
            setSelectedDate(new Date());
        }
        setIsModalOpen(true);
    };

    const handleSaveReservation = async (data: CreateBookingRequest) => {
        try {
            await LabService.createBooking(data);
            setIsModalOpen(false);
            toast.success("Reserva creada exitosamente");
            refreshData(); // Refresh calendar
        } catch (error) {
            console.error("Error creating booking", error);
            toast.error("Error al crear la reserva");
        }
    };

    const handleOpenViewModal = (res: Reservation) => {
        setViewReservation(res);
        setIsViewModalOpen(true);
    };

    const handleDeleteReservation = async (id: number) => {
        if (confirm("¿Estás seguro de que deseas cancelar esta reserva?")) {
            try {
                await LabService.cancelReservation(id);
                toast.success("Reserva cancelada exitosamente");
                setIsViewModalOpen(false);
                refreshData();
            } catch (error) {
                console.error(error);
                toast.error("Error al cancelar la reserva");
            }
        }
    };

    const getReservationsForDate = (dateStr: string) => {
        return reservations.filter(r => {
            if (!r.fecha) return false;
            const resDateStr = typeof r.fecha === 'string' ? r.fecha.split('T')[0] : String(r.fecha).split('T')[0];
            return resDateStr === dateStr;
        });
    };

    // Calendar logic
    const year = currentViewDate.getFullYear();
    const month = currentViewDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const prevMonthDays = new Date(year, month, 0).getDate();

    // We use 42 cells to ensure 6 rows are always covered
    const gridCells = Array.from({ length: 42 }, (_, i) => i);

    const handlePrev = () => {
        if (viewMode === 'list' && listFilter === 'week') {
            setCurrentViewDate(prev => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() - 7));
        } else if (viewMode === 'list' && listFilter === 'day') {
            setCurrentViewDate(prev => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() - 1));
        } else {
            setCurrentViewDate(new Date(year, month - 1, 1));
        }
    };

    const handleNext = () => {
        if (viewMode === 'list' && listFilter === 'week') {
            setCurrentViewDate(prev => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + 7));
        } else if (viewMode === 'list' && listFilter === 'day') {
            setCurrentViewDate(prev => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + 1));
        } else {
            setCurrentViewDate(new Date(year, month + 1, 1));
        }
    };

    let headerTitle = `${monthNames[month]} ${year}`;
    if (viewMode === 'list') {
        if (listFilter === 'day') {
            headerTitle = `${currentViewDate.getDate()} de ${monthNames[currentViewDate.getMonth()]} ${currentViewDate.getFullYear()}`;
        } else if (listFilter === 'week') {
            const weekStart = new Date(currentViewDate);
            const dayOfWeek = weekStart.getDay() === 0 ? 6 : weekStart.getDay() - 1;
            weekStart.setDate(weekStart.getDate() - dayOfWeek);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);

            if (weekStart.getMonth() === weekEnd.getMonth()) {
                headerTitle = `${weekStart.getDate()} - ${weekEnd.getDate()} de ${monthNames[weekStart.getMonth()]} ${currentViewDate.getFullYear()}`;
            } else {
                headerTitle = `${weekStart.getDate()} ${monthNames[weekStart.getMonth()].substring(0, 3)} - ${weekEnd.getDate()} ${monthNames[weekEnd.getMonth()].substring(0, 3)} ${currentViewDate.getFullYear()}`;
            }
        }
    }

    // Timeline helpers
    const MIN_HOUR = 7;
    const MAX_HOUR = 22;
    const timelineHours = Array.from({ length: MAX_HOUR - MIN_HOUR + 1 }, (_, i) => MIN_HOUR + i);

    let timelineDays: Date[] = [];
    if (viewMode === 'list') {
        if (listFilter === 'week') {
            const weekStart = new Date(currentViewDate);
            const dayOfWeek = weekStart.getDay() === 0 ? 6 : weekStart.getDay() - 1;
            weekStart.setDate(weekStart.getDate() - dayOfWeek);
            for (let i = 0; i < 7; i++) {
                const d = new Date(weekStart);
                d.setDate(d.getDate() + i);
                timelineDays.push(d);
            }
        } else if (listFilter === 'day') {
            timelineDays = [currentViewDate];
        }
    }

    return (
        <div className="flex-1 flex flex-col bg-[#0D1310] rounded-3xl overflow-hidden h-full">
            {/* Calendar Header Tools */}
            <div className="flex justify-between items-center mb-6 pl-2 pr-2 shrink-0">
                <div className="flex items-center gap-4">
                    <h1 className="text-3xl font-bold text-white capitalize">
                        {headerTitle}
                    </h1>
                    <div className="flex bg-[#1C2721] rounded-xl p-1 ml-2">
                        <button onClick={() => setCurrentViewDate(new Date())} className="px-3 py-1.5 text-sm font-medium text-zinc-300 hover:text-white transition-colors">
                            Hoy
                        </button>
                        <div className="flex border-l border-[#2A3B32] ml-1 pl-1">
                            <button onClick={handlePrev} title="Anterior" aria-label="Anterior" className="text-zinc-500 hover:text-white p-2 transition-colors">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button onClick={handleNext} title="Siguiente" aria-label="Siguiente" className="text-zinc-500 hover:text-white p-2 transition-colors">
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 bg-[#D3FB52] text-black font-semibold px-4 py-2 rounded-xl text-sm hover:bg-[#bce640] transition-colors ml-4"
                    >
                        <Plus className="w-4 h-4" />
                        Nueva reserva
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 bg-[#1C2721] text-zinc-300 px-4 py-2 rounded-xl text-sm hover:text-white transition-colors">
                        Mes <ChevronDown className="w-4 h-4" />
                    </button>
                    <div className="flex bg-[#1C2721] rounded-xl p-1">
                        <button onClick={() => setViewMode('grid')} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${viewMode === 'grid' ? 'bg-[#2A3B32] text-white shadow' : 'text-zinc-400 hover:text-white'}`}>
                            <Grid className="w-4 h-4" /> Tabla
                        </button>
                        <button onClick={() => setViewMode('list')} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${viewMode === 'list' ? 'bg-[#2A3B32] text-white shadow' : 'text-zinc-400 hover:text-white'}`}>
                            <List className="w-4 h-4" /> Lista
                        </button>
                    </div>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {viewMode === 'grid' ? (
                    <motion.div
                        key="grid"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="flex text-white flex-col flex-1 h-full"
                    >
                        {/* Calendar Grid Header */}
                        <div className="grid grid-cols-7 gap-1 mb-2 shrink-0">
                            {days.map((day) => (
                                <div key={day} className="text-center text-sm font-semibold tracking-wider text-zinc-500 py-2 uppercase">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Grid Body */}
                        <div className="grid grid-cols-7 grid-rows-6 gap-2 flex-1 overflow-hidden">
                            {gridCells.map((cellIndex) => {
                                const isPrevMonth = cellIndex < firstDayOfMonth;
                                const isNextMonth = cellIndex >= firstDayOfMonth + daysInMonth;
                                const isCurrentMonth = !isPrevMonth && !isNextMonth;

                                let dateNum;
                                let renderDateStr = "";
                                let isPastDate = false;

                                if (isPrevMonth) {
                                    dateNum = prevMonthDays - firstDayOfMonth + cellIndex + 1;
                                } else if (isNextMonth) {
                                    dateNum = cellIndex - firstDayOfMonth - daysInMonth + 1;
                                } else {
                                    dateNum = cellIndex - firstDayOfMonth + 1;
                                    const paddedMonth = (month + 1).toString().padStart(2, '0');
                                    const paddedDate = dateNum.toString().padStart(2, '0');
                                    renderDateStr = `${year}-${paddedMonth}-${paddedDate}`;

                                    const d = new Date(year, month, dateNum);
                                    const todayDate = new Date();
                                    todayDate.setHours(0, 0, 0, 0);
                                    isPastDate = d < todayDate;
                                }

                                const today = new Date();
                                const isToday = isCurrentMonth &&
                                    dateNum === today.getDate() &&
                                    month === today.getMonth() &&
                                    year === today.getFullYear();

                                const dailyReservations = isCurrentMonth ? getReservationsForDate(renderDateStr) : [];

                                return (
                                    <motion.div
                                        key={cellIndex}
                                        whileHover={isCurrentMonth && !isPastDate ? { scale: 1.02 } : {}}
                                        onClick={(e) => {
                                            // Prevent opening creation modal if clicking inside a reservation card
                                            if ((e.target as HTMLElement).closest('.reservation-card')) return;
                                            if (isCurrentMonth && !isPastDate) handleOpenModal(renderDateStr);
                                        }}
                                        className={`p-2 rounded-xl border border-transparent shadow-sm flex flex-col gap-1 transition-all group relative overflow-hidden
                                        ${!isCurrentMonth ? 'bg-[#0a0f0d]/50 text-zinc-700' : 'bg-[#141d18] text-zinc-300'}
                                        ${isCurrentMonth && !isPastDate ? 'cursor-pointer hover:border-[#2A3B32]' : ''}
                                        ${isCurrentMonth && isPastDate ? 'opacity-60 cursor-not-allowed' : ''}
                                        ${isToday ? 'border-[#D3FB52] bg-[#1a251f]' : ''}
                                    `}
                                    >
                                        <div className={`text-right text-xs font-bold shrink-0 mb-1 ${isToday ? 'text-[#D3FB52]' : ''}`}>
                                            {dateNum}
                                        </div>

                                        {/* Scrollable area for reservations */}
                                        {isCurrentMonth && dailyReservations.length > 0 && (
                                            <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 scrollbar-thin scrollbar-thumb-[#2A3B32] scrollbar-track-transparent">
                                                {dailyReservations.map((res: Reservation) => (
                                                    <div
                                                        key={res.id}
                                                        className="reservation-card bg-[#1C2721] rounded-lg p-2 text-[10px] text-zinc-300 flex flex-col border-l-2 border-[#D3FB52] hover:bg-[#2A3B32] transition-colors cursor-pointer"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleOpenViewModal(res);
                                                        }}
                                                    >
                                                        <div className="flex items-center justify-between font-semibold">
                                                            <span className="truncate">{res.lab_nombre || `Lab: ${res.lab_id}`}</span>
                                                            <span className="text-[#D3FB52] ml-1 shrink-0">{res.hora_inicio}:00</span>
                                                        </div>
                                                        <span className="text-zinc-500 font-medium truncate mt-0.5 capitalize">{res.materia}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="flex-1 flex flex-col overflow-hidden text-white"
                    >
                        <div className="flex justify-between items-end mb-6 shrink-0 border-b border-[#1C2721] pb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-[#D3FB52] capitalize">
                                    {headerTitle}
                                </h2>
                                <p className="text-zinc-400 text-sm mt-1">Administra tus eventos programados</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setListFilter('day')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${listFilter === 'day' ? 'bg-[#D3FB52] text-black shadow-lg shadow-[#D3FB52]/20' : 'bg-[#1C2721] text-zinc-400 hover:text-white hover:bg-[#2A3B32]'}`}>Hoy</button>
                                <button onClick={() => setListFilter('week')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${listFilter === 'week' ? 'bg-[#D3FB52] text-black shadow-lg shadow-[#D3FB52]/20' : 'bg-[#1C2721] text-zinc-400 hover:text-white hover:bg-[#2A3B32]'}`}>Semana</button>
                                <button onClick={() => setListFilter('month')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${listFilter === 'month' ? 'bg-[#D3FB52] text-black shadow-lg shadow-[#D3FB52]/20' : 'bg-[#1C2721] text-zinc-400 hover:text-white hover:bg-[#2A3B32]'}`}>Mes</button>
                            </div>
                        </div>

                        {listFilter === 'month' ? (
                            <div className="flex-1 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-[#2A3B32] scrollbar-track-transparent pr-2">
                                {reservations
                                    .filter(r => {
                                        if (!r.fecha) return false;
                                        const d = parseLocalDate(r.fecha);
                                        return d.getMonth() === month && d.getFullYear() === year;
                                    })
                                    .sort((a, b) => {
                                        const dA = parseLocalDate(a.fecha);
                                        dA.setHours(a.hora_inicio || 0);
                                        const dB = parseLocalDate(b.fecha);
                                        dB.setHours(b.hora_inicio || 0);
                                        return dA.getTime() - dB.getTime();
                                    })
                                    .map(res => (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            key={res.id}
                                            onClick={() => handleOpenViewModal(res)}
                                            className="bg-[#141d18] border border-[#1C2721] p-5 rounded-2xl flex justify-between items-center cursor-pointer hover:bg-[#1a251f] hover:border-[#2A3B32] transition-all group shadow-sm hover:shadow-md"
                                        >
                                            <div className="flex gap-4 items-center">
                                                <div className="h-12 w-12 rounded-xl bg-[#1C2721] group-hover:bg-[#2A3B32] transition-colors flex items-center justify-center shrink-0">
                                                    <CalendarIcon className="w-5 h-5 text-[#D3FB52]" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-lg text-white group-hover:text-[#D3FB52] transition-colors">{res.lab_nombre || `Laboratorio ID: ${res.lab_id}`}</h4>
                                                    <p className="text-sm text-zinc-400 mt-1">{parseLocalDate(res.fecha).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} • <span className="font-semibold text-white">{res.hora_inicio}:00 - {res.hora_inicio + 1}:00</span></p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <div className={`text-xs px-3 py-1 rounded-full uppercase font-bold tracking-wider ${res.estado === 'active' || res.estado === 'activo' ? 'bg-[#D3FB52]/10 text-[#D3FB52]' : 'bg-zinc-800 text-zinc-500'}`}>
                                                    {res.estado === 'active' ? 'Activo' : res.estado}
                                                </div>
                                                <p className="text-sm text-zinc-500 font-medium capitalize">{res.materia}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                {reservations.filter(r => {
                                    if (!r.fecha) return false;
                                    const d = parseLocalDate(r.fecha);
                                    return d.getMonth() === month && d.getFullYear() === year;
                                }).length === 0 && (
                                        <div className="flex flex-col items-center justify-center pt-16 text-zinc-500">
                                            <CalendarIcon className="w-12 h-12 mb-4 opacity-20" />
                                            <p>No hay reservas programadas para este mes.</p>
                                        </div>
                                    )}
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col bg-[#141d18]/50 rounded-xl border border-[#1C2721] overflow-hidden mt-2 h-0 min-h-[400px]">
                                {/* Timeline Header (Days) */}
                                <div className="flex border-b border-[#2A3B32] shrink-0 bg-[#0a0f0d]">
                                    <div className="w-16 shrink-0 border-r border-[#2A3B32]"></div>
                                    <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${timelineDays.length}, minmax(0, 1fr))` }}>
                                        {timelineDays.map(d => {
                                            const isToday = d.toDateString() === new Date().toDateString();
                                            return (
                                                <div key={d.toISOString()} className={`text-center py-3 border-r border-[#2A3B32]/50 last:border-0 ${isToday ? 'bg-[#D3FB52]/5' : ''}`}>
                                                    <div className={`text-xs uppercase font-medium ${isToday ? 'text-[#D3FB52]' : 'text-zinc-500'}`}>{d.toLocaleDateString('es-ES', { weekday: 'short' })}</div>
                                                    <div className={`text-lg font-bold mt-0.5 ${isToday ? 'text-[#D3FB52]' : 'text-zinc-300'}`}>
                                                        {d.getDate()} <span className="text-xs font-normal text-zinc-500">{monthNames[d.getMonth()].substring(0, 3)}</span>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Timeline Body */}
                                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#2A3B32] scrollbar-track-transparent bg-[#141d18]">
                                    <div className="flex relative" style={{ height: `${timelineHours.length * 80}px` }}> {/* 80px per hour height */}

                                        {/* Y-Axis Hours */}
                                        <div className="w-16 shrink-0 border-r border-[#2A3B32] relative bg-[#0a0f0d] z-10">
                                            {timelineHours.map((h, i) => (
                                                <div key={h} className="absolute w-full flex justify-center text-xs text-zinc-500 font-medium" style={{ top: `${i * 80}px`, transform: 'translateY(-50%)' }}>
                                                    {h}:00
                                                </div>
                                            ))}
                                        </div>

                                        {/* X-Axis Grid and Events */}
                                        <div className="flex-1 grid relative" style={{ gridTemplateColumns: `repeat(${timelineDays.length}, minmax(0, 1fr))` }}>

                                            {/* Horizontal Hour Lines */}
                                            <div className="absolute inset-0 pointer-events-none">
                                                {timelineHours.map((_, i) => (
                                                    <div key={i} className="absolute w-full border-t border-[#2A3B32]/30" style={{ top: `${i * 80}px` }}></div>
                                                ))}
                                            </div>

                                            {/* Data Columns */}
                                            {timelineDays.map((d, colIdx) => {
                                                const dayReservations = reservations.filter(r => {
                                                    if (!r.fecha) return false;
                                                    const rDate = parseLocalDate(r.fecha);
                                                    return rDate.toDateString() === d.toDateString();
                                                });

                                                const isToday = d.toDateString() === new Date().toDateString();

                                                return (
                                                    <div key={colIdx} className={`relative border-r border-[#2A3B32]/30 last:border-0 h-full ${isToday ? 'bg-[#D3FB52]/5' : ''}`}>
                                                        {/* Interactive Empty Slots */}
                                                        {timelineHours.map(h => {
                                                            const topPos = (h - MIN_HOUR) * 80;
                                                            const targetDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                                                            return (
                                                                <div
                                                                    key={`slot-${h}`}
                                                                    onClick={() => handleOpenModal(targetDateStr)}
                                                                    className="absolute w-full hover:bg-[#D3FB52]/10 cursor-pointer transition-colors border-b border-transparent hover:border-[#D3FB52]/50 z-0"
                                                                    style={{ top: `${topPos}px`, height: '80px' }}
                                                                ></div>
                                                            )
                                                        })}
                                                        {dayReservations.map(res => {
                                                            if (res.hora_inicio < MIN_HOUR || res.hora_inicio > MAX_HOUR) return null;

                                                            const topPos = (res.hora_inicio - MIN_HOUR) * 80;

                                                            // Dynamic width for overlapping events
                                                            const overlappingEvents = dayReservations.filter(r => r.hora_inicio === res.hora_inicio);
                                                            const countAtSameTime = overlappingEvents.length;
                                                            const indexAtSameTime = overlappingEvents.findIndex(r => r.id === res.id);

                                                            const widthPercent = 100 / countAtSameTime;
                                                            const leftPercent = widthPercent * indexAtSameTime;

                                                            // Calculate background tint based on ID for slight variation
                                                            const colorThemeClasses = [
                                                                'border-l-[#D3FB52] bg-[#1a251f] hover:bg-[#D3FB52]/10',
                                                                'border-l-indigo-400 bg-indigo-950/40 hover:bg-indigo-900/40',
                                                                'border-l-orange-400 bg-orange-950/40 hover:bg-orange-900/40',
                                                                'border-l-emerald-400 bg-emerald-950/40 hover:bg-emerald-900/40'
                                                            ];
                                                            const themeIdx = res.lab_id ? res.lab_id % colorThemeClasses.length : 0;
                                                            const themeClass = colorThemeClasses[themeIdx];

                                                            return (
                                                                <motion.div
                                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                                    animate={{ opacity: 1, scale: 1 }}
                                                                    whileHover={{ scale: 1.02, zIndex: 30 }}
                                                                    key={res.id}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleOpenViewModal(res);
                                                                    }}
                                                                    className={`absolute rounded-md p-2 flex flex-col overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all border border-[#2A3B32]/50 border-l-4 z-20 group text-xs text-white ${themeClass}`}
                                                                    style={{
                                                                        top: `${topPos + 2}px`,
                                                                        height: `76px`,
                                                                        width: `calc(${widthPercent}% - 4px)`,
                                                                        left: `calc(${leftPercent}% + 2px)`
                                                                    }}
                                                                >
                                                                    <div className="font-bold truncate group-hover:text-white transition-colors text-zinc-100">{res.lab_nombre || `Laboratorio ID: ${res.lab_id}`}</div>
                                                                    <div className="text-zinc-400 font-medium text-[10px] mt-0.5 whitespace-nowrap">{res.hora_inicio}:00 - {res.hora_inicio + 1}:00</div>
                                                                    {res.materia && <div className="mt-auto truncate font-medium text-zinc-300 capitalize">{res.materia}</div>}
                                                                </motion.div>
                                                            )
                                                        })}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <ReservationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                selectedDate={selectedDate}
                labs={labs}
                onSave={handleSaveReservation}
            />

            <ViewReservationModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                reservation={viewReservation}
                onDelete={handleDeleteReservation}
            />
        </div>
    );
}
