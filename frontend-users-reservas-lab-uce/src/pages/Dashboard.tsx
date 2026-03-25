import React, { useEffect, useState } from 'react';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import type { Lab, Reservation } from '../types';
import { toast } from 'sonner';
import { Trash2, Calendar, AlertCircle } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { SessionTimer } from '../components/SessionTimer';
import { SettingsService } from '../lib/settings.service';

interface ReservationWithLab extends Reservation {
    lab_nombre: string;
}

export const Dashboard: React.FC = () => {
    const [labs, setLabs] = useState<Lab[]>([]);
    const [reservations, setReservations] = useState<ReservationWithLab[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'labs' | 'reservations'>('labs');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [reservationToDelete, setReservationToDelete] = useState<number[]>([]);
    const [settings, setSettings] = useState<any>(null);
    const navigate = useNavigate();

    const fetchData = async (isInitial = false) => {
        if (isInitial) setLoading(true);
        try {
            const [labsRes, reservationsRes, settingsRes] = await Promise.all([
                api.get('/labs'),
                api.get('/labs/mis-reservas'),
                SettingsService.getSettings()
            ]);
            setLabs(labsRes.data);

            const settingsMap: any = {};
            settingsRes.forEach(s => settingsMap[s.key] = s.value);
            setSettings(settingsMap);

            // Sort reservations: Newest first
            const sortedReservations = reservationsRes.data.sort((a: ReservationWithLab, b: ReservationWithLab) => {
                const dateAStr = String(a.fecha).split('T')[0];
                const dateBStr = String(b.fecha).split('T')[0];

                // Compare strings alphabetically (YYYY-MM-DD format allows this safely)
                if (dateAStr > dateBStr) return -1;
                if (dateAStr < dateBStr) return 1;

                // If same day, order by newest time first
                return b.hora_inicio - a.hora_inicio;
            });
            setReservations(sortedReservations);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            if (isInitial) setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(true);
        // Auto-refresh dashboard data every 10 seconds for real-time feel
        const interval = setInterval(() => fetchData(false), 10000);
        return () => clearInterval(interval);
    }, []);

    const confirmDelete = (ids: number[]) => {
        setReservationToDelete(ids);
        setDeleteModalOpen(true);
    };

    const handleCancel = async () => {
        if (reservationToDelete.length === 0) return;

        try {
            // Delete all in group
            await Promise.all(reservationToDelete.map(id => api.delete(`/labs/reservas/${id}`)));
            toast.success('Reservas canceladas');
            fetchData();
        } catch (error) {
            toast.error('Error al cancelar');
        } finally {
            setDeleteModalOpen(false);
            setReservationToDelete([]);
        }
    };

    if (loading) {
        return <div className="text-center mt-10">Cargando...</div>;
    }

    // Grouping Logic inside render or memoized
    const groupedReservations = (() => {
        const groups: { [key: string]: any } = {};

        reservations.forEach((res) => {
            const dateStr = typeof res.fecha === 'string' ? res.fecha.split('T')[0] : res.fecha;
            const key = `${res.lab_id}-${dateStr}-${res.materia}`;

            if (!groups[key]) {
                groups[key] = {
                    id: res.id,
                    ids: [],
                    lab_nombre: res.lab_nombre,
                    fecha: res.fecha,
                    materia: res.materia,
                    hours: [],
                    status: res.estado
                };
            }
            groups[key].ids.push(res.id);
            groups[key].hours.push(res.hora_inicio);
            if (res.estado === 'active') {
                groups[key].status = 'active';
            }
        });

        return Object.values(groups).map(g => {
            // Sort to ensure min/max are correct
            g.hours.sort((a: number, b: number) => a - b);

            return {
                ...g,
                totalHours: g.hours.length,
                timeRange: `${Math.min(...g.hours)}:00 - ${Math.max(...g.hours) + 1}:00`,
                ids: g.ids
            };
        }).sort((a, b) => {
            const dateAStr = String(a.fecha).split('T')[0];
            const dateBStr = String(b.fecha).split('T')[0];

            // Compare strings alphabetically (YYYY-MM-DD format allows this safely)
            if (dateAStr > dateBStr) return -1;
            if (dateAStr < dateBStr) return 1;

            return 0;
        });
    })();

    return (
        <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
            {/* Comunicados Visuales / Banners */}
            {settings?.communication_banners?.is_active && settings?.communication_banners?.global_message && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8 rounded-r-lg shadow-sm font-sans flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                        <h3 className="text-blue-800 font-bold text-sm uppercase tracking-wider mb-1">Aviso de Administración</h3>
                        <p className="text-blue-700 text-sm leading-relaxed">{settings.communication_banners.global_message}</p>
                    </div>
                </div>
            )}

            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-gray-100 pb-4">
                <div>
                    <h1 className="text-4xl font-serif text-black mb-2 tracking-tight">Bienvenido</h1>
                    <p className="text-gray-500 font-light">Gestiona tus reservas y explora los laboratorios disponibles.</p>
                </div>
                <div className="mt-4 md:mt-0 flex flex-col items-end gap-4">
                    <SessionTimer />

                    {/* Tabs */}
                    <div className="flex space-x-8">
                        <button
                            onClick={() => setActiveTab('labs')}
                            className={`pb-2 text-sm uppercase tracking-widest transition-all ${activeTab === 'labs'
                                ? 'border-b-2 border-black text-black'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            Laboratorios
                        </button>
                        <button
                            onClick={() => setActiveTab('reservations')}
                            className={`pb-2 text-sm uppercase tracking-widest transition-all ${activeTab === 'reservations'
                                ? 'border-b-2 border-black text-black'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            Mis Reservas
                        </button>
                    </div>
                </div>
            </div>

            {/* Labs List */}
            {activeTab === 'labs' && (
                <div className="grid grid-cols-1 gap-6">
                    {labs.map((lab) => {
                        const isLockdown = settings?.operational_policies?.emergency_lockdown === true;
                        const originalEstado = lab.estado || 'disponible';
                        const estado = isLockdown ? 'inhabilitado' : originalEstado;
                        const isAvailable = estado === 'disponible' && !isLockdown;

                        return (
                            <div key={lab.id} className={`group flex flex-col md:flex-row items-center justify-between p-6 border transition-all rounded-lg bg-white ${isAvailable ? 'border-gray-100 hover:border-black' : 'border-gray-100 opacity-75'}`}>
                                <div className="flex-1 text-center md:text-left mb-4 md:mb-0">
                                    <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                                        <h3 className="text-2xl font-serif text-gray-900 group-hover:text-black">{lab.nombre}</h3>
                                        {estado === 'mantenimiento' && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200 uppercase tracking-wide">
                                                Mantenimiento
                                            </span>
                                        )}
                                        {estado === 'inhabilitado' && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 border border-red-200 uppercase tracking-wide">
                                                {isLockdown ? 'Plataforma Bloqueada' : 'Inhabilitado'}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1 uppercase tracking-wide">
                                        Capacidad: {lab.capacidad} estudiantes
                                    </p>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="hidden md:flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-green-500' : estado === 'mantenimiento' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                                        <span className="text-xs text-gray-400 uppercase tracking-wider">
                                            {isAvailable ? 'Disponible' : estado === 'mantenimiento' ? 'En Mantenimiento' : isLockdown ? 'Emergencia' : 'Inhabilitado'}
                                        </span>
                                    </div>
                                    <Button
                                        onClick={() => navigate(`/reservar/${lab.id}`)}
                                        variant={isAvailable ? "outline" : "ghost"}
                                        disabled={!isAvailable}
                                        className={`rounded-full px-8 transition-all ${isAvailable
                                            ? 'border-gray-200 hover:bg-black hover:text-white hover:border-black'
                                            : 'bg-gray-100 text-gray-400 border-transparent cursor-not-allowed'}`}
                                    >
                                        Reservar
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Reservations Table (Report Style) */}
            {activeTab === 'reservations' && (
                <div className="bg-white">
                    {groupedReservations.length === 0 ? (
                        <div className="py-20 text-center">
                            <Calendar className="mx-auto h-12 w-12 text-gray-200 mb-4" />
                            <p className="text-gray-400 font-light text-lg">No tienes reservas activas.</p>
                            <Button
                                variant="link"
                                onClick={() => setActiveTab('labs')}
                                className="mt-4 text-black underline underline-offset-4"
                            >
                                Explorar Laboratorios
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="py-4 px-2 text-xs font-semibold text-gray-400 uppercase tracking-widest">Laboratorio</th>
                                        <th className="py-4 px-2 text-xs font-semibold text-gray-400 uppercase tracking-widest">Fecha</th>
                                        <th className="py-4 px-2 text-xs font-semibold text-gray-400 uppercase tracking-widest">Horario</th>
                                        <th className="py-4 px-2 text-xs font-semibold text-gray-400 uppercase tracking-widest">Materia</th>
                                        <th className="py-4 px-2 text-xs font-semibold text-gray-400 uppercase tracking-widest">Duración</th>
                                        <th className="py-4 px-2 text-xs font-semibold text-gray-400 uppercase tracking-widest">Estado</th>
                                        <th className="py-4 px-2 text-right text-xs font-semibold text-gray-400 uppercase tracking-widest">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {groupedReservations.map((res: any) => {
                                        const status = res.status || 'expired';
                                        return (
                                            <tr key={res.ids[0]} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                                                <td className="py-6 px-2 text-gray-900 font-serif text-lg">{res.lab_nombre}</td>
                                                <td className="py-6 px-2 text-sm text-gray-500">
                                                    {(() => {
                                                        try {
                                                            const dateStr = String(res.fecha).split('T')[0];
                                                            const [year, month, day] = dateStr.split('-');
                                                            return `${day}/${month}/${year}`;
                                                        } catch (e) {
                                                            return String(res.fecha);
                                                        }
                                                    })()}
                                                </td>
                                                <td className="py-6 px-2 text-sm text-gray-500 font-mono">{res.timeRange}</td>
                                                <td className="py-6 px-2 text-sm text-gray-900 font-medium">{res.materia}</td>
                                                <td className="py-6 px-2 text-sm text-gray-500">{res.totalHours} hrs</td>
                                                <td className="py-6 px-2">
                                                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium uppercase tracking-wider ${status === 'active'
                                                        ? 'text-green-600 bg-green-50'
                                                        : 'text-gray-400 bg-gray-50'
                                                        }`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${status === 'active' ? 'bg-green-600' : 'bg-gray-400'}`}></span>
                                                        {status === 'active' ? 'Activa' : 'Finalizada'}
                                                    </span>
                                                </td>
                                                <td className="py-6 px-2 text-right">
                                                    {status === 'active' && (
                                                        <button
                                                            onClick={() => confirmDelete(res.ids)}
                                                            className="text-gray-300 hover:text-red-600 transition-colors p-2"
                                                            title="Cancelar Reserva"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title="Cancelar Reserva"
                footer={
                    <>
                        <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
                            Mantener
                        </Button>
                        <Button
                            className="bg-black text-white hover:bg-gray-800"
                            onClick={handleCancel}
                        >
                            Confirmar Cancelación
                        </Button>
                    </>
                }
            >
                <div className="py-4">
                    <p className="text-gray-600">
                        Esta acción es irreversible. El espacio se liberará inmediatamente.
                    </p>
                </div>
            </Modal>
        </div>
    );
};
