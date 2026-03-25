"use client";

import { useEffect, useState } from "react";
import { LabService, Lab, Reservation } from "@/services/lab.service";
import { FlaskConical, CalendarCheck } from "lucide-react";

// Utilities for date parsing to prevent UTC timezone shifts
function parseLocalDate(dateStr: unknown): Date {
    if (!dateStr) return new Date();
    const cleanDateStr = String(dateStr).split('T')[0];
    const [year, month, day] = cleanDateStr.split('-');
    return new Date(Number(year), Number(month) - 1, Number(day));
}

interface RightPanelProps {
    currentViewDate?: Date;
}

export function RightPanel({ currentViewDate = new Date() }: RightPanelProps) {
    const [labs, setLabs] = useState<Lab[]>([]);
    const [reservations, setReservations] = useState<Reservation[]>([]);

    const today = new Date();
    const days = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"];
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [labsData, resData] = await Promise.all([
                    LabService.listLabs(),
                    LabService.getReservations()
                ]);
                setLabs(labsData);
                setReservations(resData);
            } catch (error) {
                console.error("Error fetching right panel data", error);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 15000); // 15s auto-sync
        return () => clearInterval(interval);
    }, []);

    // Mini Calendar Logic synced with MainCalendar
    const year = currentViewDate.getFullYear();
    const month = currentViewDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const miniDates = Array.from({ length: 42 }, (_, i) => {
        if (i < firstDayOfMonth) return { date: prevMonthDays - firstDayOfMonth + i + 1, type: "prev" };
        if (i >= firstDayOfMonth + daysInMonth) return { date: i - firstDayOfMonth - daysInMonth + 1, type: "next" };
        return { date: i - firstDayOfMonth + 1, type: "current" };
    });

    const upcomingEvents = reservations
        .filter(r => {
            if (!r.fecha) return false;
            const resDate = parseLocalDate(r.fecha);
            resDate.setHours(r.hora_inicio || 0, 0, 0, 0);
            return resDate >= today;
        })
        .sort((a, b) => {
            const dA = parseLocalDate(a.fecha);
            dA.setHours(a.hora_inicio || 0);
            const dB = parseLocalDate(b.fecha);
            dB.setHours(b.hora_inicio || 0);
            return dA.getTime() - dB.getTime();
        })
        .slice(0, 5);

    // Monthly Calculated Stats
    const currentMonthReservations = reservations.filter(r => {
        if (!r.fecha) return false;
        const resDate = parseLocalDate(r.fecha);
        return resDate.getMonth() === month && resDate.getFullYear() === year;
    });

    const totalMonthReservations = currentMonthReservations.length;
    const pendingMonthReservations = currentMonthReservations.filter(r =>
        r.estado && ['pendiente', 'activo'].includes(r.estado.toLowerCase())
    ).length;

    return (
        <div className="w-72 flex flex-col gap-6 ml-6 overflow-y-auto scrollbar-none pr-2 shrink-0 h-full pb-4">
            {/* Mini Calendar Widget */}
            <div className="bg-[#18221D] rounded-3xl p-6 shrink-0 z-10 transition-all duration-300">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-semibold text-white capitalize">{monthNames[month]} {year}</h3>
                </div>

                <div className="grid grid-cols-7 gap-y-4 text-center text-xs">
                    {days.map(d => (
                        <div key={d} className="text-zinc-500 font-medium">{d}</div>
                    ))}
                    {miniDates.map((d, i) => {
                        const isTodayDate = d.type === 'current' && d.date === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                        return (
                            <div
                                key={i}
                                className={`flex justify-center items-center w-6 h-6 mx-auto rounded-full
                                    ${isTodayDate ? 'bg-[#D3FB52] text-black font-bold' : d.type === 'current' ? 'text-zinc-300 hover:bg-[#2A3B32]' : 'text-zinc-600'}
                                `}
                            >
                                {d.date}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Resource Consumption Widget */}
            <div className="bg-[#18221D] rounded-3xl p-6 shrink-0">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-semibold text-white">Uso de Recursos</h3>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 text-sm text-zinc-300 bg-[#1C2721] p-3 rounded-2xl">
                        <div className="w-10 h-10 rounded-xl bg-[#2A3B32] flex items-center justify-center text-[#D3FB52] shrink-0">
                            <FlaskConical className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-white text-base leading-none">{labs.length}</span>
                            <span className="text-xs text-zinc-500 mt-1">Laboratorios Registrados</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-zinc-300 bg-[#1C2721] p-3 rounded-2xl">
                        <div className="w-10 h-10 rounded-xl bg-[#2A3B32] flex items-center justify-center text-[#D3FB52] shrink-0">
                            <CalendarCheck className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-white text-base leading-none">{totalMonthReservations}</span>
                            <span className="text-xs text-zinc-500 mt-1">Reservas este mes</span>
                        </div>
                    </div>

                </div>
            </div>

            {/* Upcoming Events Widget */}
            <div className="bg-[#18221D] rounded-3xl p-6 flex-1 flex flex-col shrink-0 min-h-[250px]">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-white">Próximas Reservas</h3>
                </div>

                {upcomingEvents.length === 0 ? (
                    <div className="text-zinc-500 text-sm mt-4 text-center">No hay reservas próximas.</div>
                ) : (
                    <ul className="space-y-4 text-sm text-zinc-300 flex-1 overflow-y-auto pr-2 scrollbar-thin">
                        {upcomingEvents.map((res, idx) => (
                            <li key={res.id} className="flex flex-col gap-1 pb-3 border-b border-[#2A3B32] last:border-0 last:pb-0">
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-2 font-medium">
                                        <span className={`w-2 h-2 rounded-full ${idx % 2 === 0 ? 'bg-[#D3FB52]' : 'bg-green-400'}`}></span>
                                        {res.lab_nombre || `Lab ID: ${res.lab_id}`}
                                    </span>
                                    <span className="text-xs text-zinc-500">{res.hora_inicio}:00</span>
                                </div>
                                <span className="text-xs text-zinc-500 pl-4">{parseLocalDate(res.fecha).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })} - <span className="capitalize">{res.estado}</span></span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
