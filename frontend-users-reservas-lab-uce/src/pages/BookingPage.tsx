import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../lib/api';
import type { Lab, AvailabilitySlot } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ArrowLeft, Clock, CheckCircle2 } from 'lucide-react';
import { SettingsService } from '../lib/settings.service';

export const BookingPage: React.FC = () => {
    const { labId } = useParams<{ labId: string }>();
    const navigate = useNavigate();
    const [lab, setLab] = useState<Lab | null>(null);
    const [date, setDate] = useState('');
    const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
    // Changed single selectedHour to array
    const [selectedHours, setSelectedHours] = useState<number[]>([]);
    const [materia, setMateria] = useState('');
    const [loading, setLoading] = useState(false);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [settings, setSettings] = useState<any>(null);

    useEffect(() => {
        const fetchContext = async () => {
            try {
                const [labsRes, settingsRes] = await Promise.all([
                    api.get('/labs'),
                    SettingsService.getSettings()
                ]);

                const found = labsRes.data.find((l: Lab) => l.id === Number(labId));
                setLab(found || null);

                const settingsMap: any = {};
                settingsRes.forEach(s => settingsMap[s.key] = s.value);
                setSettings(settingsMap);
            } catch (err) {
                console.error(err);
            }
        };
        fetchContext();
    }, [labId]);

    const fetchAvailability = useCallback(async (isInitial = false) => {
        if (!labId || !date) return;
        if (isInitial) setLoading(true);
        try {
            const response = await api.get(`/labs/disponibilidad?lab_id=${labId}&fecha=${date}`);
            setAvailability(response.data);
        } catch (err) {
            console.error(err);
        } finally {
            if (isInitial) setLoading(false);
        }
    }, [labId, date]);

    useEffect(() => {
        if (date && labId) {
            fetchAvailability(true);
            const interval = setInterval(() => fetchAvailability(false), 20000);
            return () => clearInterval(interval);
        }
    }, [date, labId, fetchAvailability]);

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedDate = e.target.value;
        const d = new Date(selectedDate + 'T12:00:00');
        const day = d.getDay();

        if (day === 0 || day === 6) {
            toast.warning('Las reservas solo están disponibles de Lunes a Viernes.');
            setDate('');
            setAvailability([]);
            setSelectedHours([]);
            return;
        }

        setDate(selectedDate);
        setSelectedHours([]);
    };

    const toggleHour = (hour: number) => {
        if (selectedHours.includes(hour)) {
            setSelectedHours(prev => prev.filter(h => h !== hour));
        } else {
            if (selectedHours.length >= 6) {
                toast.warning('No puedes reservar más de 6 horas por día.');
                return;
            }
            setSelectedHours(prev => [...prev, hour].sort((a, b) => a - b));
        }
    };

    const isPastHour = (hour: number) => {
        if (!date) return false;
        const today = new Date();
        const selectedDate = new Date(date + 'T12:00:00');

        // Check if selected date is today
        if (selectedDate.toDateString() === today.toDateString()) {
            return hour <= today.getHours();
        }

        // If selected date is in the past (though min date prevents this usually)
        if (selectedDate < today) return true; // Just in case

        return false;
    };

    const handleBooking = async () => {
        if (selectedHours.length === 0 || !materia) {
            toast.warning('Seleccione al menos una hora y escriba la materia');
            return;
        }
        setBookingLoading(true);

        try {
            // Send single request with array of hours
            const response = await api.post('/labs/reservar', {
                lab_id: Number(labId),
                fecha: date,
                horas: selectedHours,
                materia
            });

            const count = response.data.length;
            toast.success(`Reserva de ${count} horas realizada con éxito`);
            navigate('/');

        } catch (err: any) {
            console.error(err);
            const errorData = err.response?.data?.error;
            let errorMsg = 'Error al procesar la reserva';

            if (typeof errorData === 'string') {
                errorMsg = errorData;
            } else if (Array.isArray(errorData)) {
                // Zod errors
                errorMsg = errorData.map((e: any) => e.message || e.path?.join('.') + ' is invalid').join(', ');
            } else if (errorData?.message) {
                errorMsg = errorData.message;
            }

            toast.error(errorMsg);
        } finally {
            setBookingLoading(false);
        }
    };

    const getMaxDateString = () => {
        if (!settings?.booking_rules?.max_days_advance) return undefined;
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + settings.booking_rules.max_days_advance);
        return maxDate.toISOString().split('T')[0];
    };

    if (!lab) return <div className="text-center mt-20 font-serif text-xl">Cargando información...</div>;

    return (
        <div className="max-w-5xl mx-auto animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="mb-12">
                <Button variant="ghost" className="mb-6 pl-0 hover:bg-transparent hover:text-gray-500 transition-colors" onClick={() => navigate('/')}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Dashboard
                </Button>
                <h1 className="text-4xl md:text-5xl font-serif text-black tracking-tight mb-2">
                    Reservar: {lab.nombre}
                </h1>
                <p className="text-gray-500 font-light text-lg">
                    Selecciona el horario y la fecha para tu práctica.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Left Column: Controls */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2 uppercase tracking-wider">Fecha de Reserva</label>
                            <Input
                                type="date"
                                value={date}
                                onChange={handleDateChange}
                                className="w-full bg-gray-50 border-gray-200 focus:ring-black focus:border-black transition-all p-4"
                                min={new Date().toISOString().split('T')[0]}
                                max={getMaxDateString()}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2 uppercase tracking-wider">Materia / Motivo</label>
                            <Input
                                value={materia}
                                onChange={(e) => setMateria(e.target.value)}
                                placeholder="Ej: Inteligencia Artificial"
                                className="w-full bg-gray-50 border-gray-200 focus:ring-black focus:border-black transition-all p-4"
                            />
                        </div>
                    </div>

                    {/* Summary Box */}
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                        <h4 className="font-serif text-lg text-black mb-4">Resumen</h4>
                        {selectedHours.length === 0 ? (
                            <p className="text-sm text-gray-400 font-light">Selecciona horas disponibles en el calendario.</p>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex justify-between items-baseline border-b border-gray-200 pb-2">
                                    <span className="text-sm text-gray-500">Horas:</span>
                                    <span className="font-medium text-xl">{selectedHours.length}</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {selectedHours.map(h => (
                                        <span key={h} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-black text-white">
                                            {h}:00 - {h + 1}:00
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mt-8">
                            <Button
                                onClick={handleBooking}
                                disabled={selectedHours.length === 0 || !materia || bookingLoading}
                                className="w-full bg-black text-white hover:bg-gray-800 rounded-lg py-4 text-sm uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {bookingLoading ? 'Procesando...' : 'Confirmar Reserva'}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Availability Grid */}
                <div className="lg:col-span-8">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-serif text-black">Diponibilidad Horaria</h3>
                        <div className="flex gap-4 text-xs">
                            <div className="flex items-center gap-1"><div className="w-3 h-3 border border-gray-200 rounded"></div> Disponible</div>
                            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-black rounded"></div> Seleccionado</div>
                            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-gray-100 rounded"></div> Ocupado</div>
                        </div>
                    </div>

                    {!date ? (
                        <div className="h-96 flex flex-col items-center justify-center border border-dashed border-gray-200 rounded-lg bg-gray-50/50">
                            <Clock className="h-10 w-10 text-gray-300 mb-4" />
                            <p className="text-gray-400 font-light">Selecciona una fecha para ver disponibilidad.</p>
                        </div>
                    ) : loading ? (
                        <div className="h-96 flex items-center justify-center">
                            <p className="text-gray-400 animate-pulse font-serif">Verificando agenda...</p>
                        </div>
                    ) : settings?.operational_policies?.emergency_lockdown ? (
                         <div className="h-96 flex justify-center items-center">
                             <h2 className="text-2xl font-serif text-red-600">La facultad se encuentra bajo un protocolo cerrado de mantenimiento maestro. Las reservas están paralizadas.</h2>
                         </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {availability.filter(slot => {
                                if (!settings?.operational_policies) return true;
                                const openH = parseInt(String(settings.operational_policies.opening_time).split(':')[0]);
                                const closeH = parseInt(String(settings.operational_policies.closing_time).split(':')[0]);
                                return slot.hora >= openH && slot.hora < closeH;
                            }).map((slot) => {
                                const past = isPastHour(slot.hora);
                                const occupied = slot.estado === 'ocupado';
                                const selected = selectedHours.includes(slot.hora);
                                const disabled = occupied || past;

                                return (
                                    <button
                                        key={slot.hora}
                                        onClick={() => !disabled && toggleHour(slot.hora)}
                                        disabled={disabled}
                                        className={`
                                            relative h-32 p-4 rounded-xl border transition-all duration-300 flex flex-col justify-between group
                                            ${disabled
                                                ? 'bg-gray-50 border-transparent text-gray-300 cursor-not-allowed'
                                                : selected
                                                    ? 'bg-black border-black text-white shadow-xl transform -translate-y-1'
                                                    : 'bg-white border-gray-100 hover:border-black hover:shadow-md text-gray-900'
                                            }
                                        `}
                                    >
                                        <div className="flex justify-between items-start w-full">
                                            <span className={`text-lg font-bold ${selected ? 'text-white' : 'text-gray-900'}`}>
                                                {slot.hora}:00
                                            </span>
                                            {selected && <CheckCircle2 className="h-5 w-5 text-white" />}
                                        </div>

                                        <div className="text-left">
                                            {occupied ? (
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Ocupado</span>
                                            ) : past ? (
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-300">Pasado</span>
                                            ) : (
                                                <span className={`text-[10px] font-medium uppercase tracking-wider ${selected ? 'text-gray-400' : 'text-green-600'}`}>
                                                    Disponible
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
