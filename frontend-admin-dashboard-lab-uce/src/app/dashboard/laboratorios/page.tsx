"use client";

import { useEffect, useState } from "react";
import { LabService, Lab } from "@/services/lab.service";
import { motion, Variants } from "framer-motion";
import { Search, MonitorPlay, Users, MapPin, Plus, Edit, Trash2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export default function LaboratoriosPage() {
    const [labs, setLabs] = useState<Lab[]>([]);
    const [filteredLabs, setFilteredLabs] = useState<Lab[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLab, setEditingLab] = useState<Lab | null>(null);

    // Form States
    const [formData, setFormData] = useState({
        nombre: "",
        ubicacion: "Edificio Principal",
        capacidad: 30,
        estado: "disponible"
    });

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const data = await LabService.listLabs();
            setLabs(data);
            setFilteredLabs(data);
        } catch (error) {
            console.error("Error loading labs:", error);
            toast.error("Error al cargar los laboratorios");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredLabs(labs);
        } else {
            const term = searchTerm.toLowerCase();
            setFilteredLabs(labs.filter(lab =>
                (lab.nombre || "").toLowerCase().includes(term) ||
                (lab.ubicacion || "").toLowerCase().includes(term)
            ));
        }
    }, [searchTerm, labs]);

    const handleOpenCreateModal = () => {
        setEditingLab(null);
        setFormData({
            nombre: "",
            ubicacion: "Edificio Principal",
            capacidad: 30,
            estado: "disponible"
        });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (lab: Lab) => {
        setEditingLab(lab);
        setFormData({
            nombre: lab.nombre,
            ubicacion: lab.ubicacion || "Edificio Principal",
            capacidad: lab.capacidad || 30,
            estado: lab.estado || "disponible"
        });
        setIsModalOpen(true);
    };

    const handleSaveLab = async () => {
        if (!formData.nombre || !formData.ubicacion || formData.capacidad <= 0) {
            return toast.error("Por favor completa los campos principales correctamente.");
        }

        try {
            if (editingLab) {
                await LabService.updateLab(editingLab.id, formData);
                toast.success("Laboratorio actualizado correctamente.");
            } else {
                await LabService.createLab(formData);
                toast.success("Nuevo laboratorio registrado correctamente.");
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Ocurrió un error al guardar el laboratorio.");
        }
    };

    const handleDeleteLab = async (id: number) => {
        if (!window.confirm("¿Seguro que deseas eliminar el registro de este laboratorio? Esta acción solo es posible si no existen reservas registradas a su nombre.")) return;
        try {
            await LabService.deleteLab(id);
            toast.success("Laboratorio eliminado con éxito.");
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Error al eliminar. Verifique que no existan reservas vinculadas.");
        }
    };

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Header Area */}
            <header className="w-full flex justify-between items-end mb-8 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <MonitorPlay className="w-8 h-8 text-[#D3FB52]" />
                        Directorio de Laboratorios
                    </h1>
                    <p className="text-zinc-400 mt-2">Gestiona infraestructuras, su estado de disponibilidad, y capacidades técnicas.</p>
                </div>

                <button
                    onClick={handleOpenCreateModal}
                    className="flex items-center gap-2 bg-[#D3FB52] hover:bg-[#bceb3b] text-black px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-[#D3FB52]/20"
                >
                    <Plus className="w-5 h-5" />
                    Nuevo Laboratorio
                </button>
            </header>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto no-scrollbar bg-[#0D1310] border border-[#1C2721] rounded-3xl p-8 relative">

                {/* Search Bar */}
                <div className="mb-8 bg-[#141C18] p-4 rounded-2xl border border-[#2A3B32] flex items-center gap-4">
                    <Search className="w-5 h-5 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Buscar laboratorio por nombre o ubicación..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-transparent border-none text-white outline-none placeholder:text-zinc-600 font-medium"
                    />
                </div>

                {isLoading ? (
                    <div className="p-20 flex justify-center items-center h-64">
                        <span className="relative flex h-10 w-10">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D3FB52] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-10 w-10 bg-[#D3FB52]"></span>
                        </span>
                    </div>
                ) : filteredLabs.length === 0 ? (
                    <div className="p-16 text-center flex flex-col items-center justify-center border border-dashed border-[#2A3B32] rounded-2xl h-64 bg-[#141C18]/30">
                        <MonitorPlay className="w-12 h-12 text-zinc-700 mb-4" />
                        <p className="text-zinc-400 font-medium">No hay laboratorios en el sistema.</p>
                        <button onClick={handleOpenCreateModal} className="mt-4 text-[#D3FB52] font-semibold hover:underline">¡Agrega tu primer laboratorio!</button>
                    </div>
                ) : (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    >
                        {filteredLabs.map((lab) => (
                            <motion.div
                                key={lab.id}
                                variants={itemVariants}
                                className="bg-[#141C18] border border-[#1C2721] rounded-2xl p-6 group transition-all hover:border-[#2A3B32] shadow-xl flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-[#0D1310] rounded-xl border border-[#2A3B32]">
                                            <MonitorPlay className="w-6 h-6 text-zinc-400 group-hover:text-[#D3FB52] transition-colors" />
                                        </div>
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${lab.estado === 'disponible' || lab.estado === 'activo'
                                                ? 'bg-[#D3FB52]/10 text-[#D3FB52] border-[#D3FB52]/20'
                                                : lab.estado === 'mantenimiento'
                                                    ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                                            }`}>
                                            {String(lab.estado || 'disponible').toUpperCase()}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-1 truncate">{lab.nombre}</h3>
                                    <p className="text-zinc-400 text-sm flex items-center gap-1 mt-3">
                                        <MapPin className="w-3.5 h-3.5" /> {lab.ubicacion || 'Edificio Principal'}
                                    </p>
                                    <p className="text-zinc-400 text-sm flex items-center gap-1 mt-1">
                                        <Users className="w-3.5 h-3.5" /> Capacidad: {lab.capacidad} estaciones
                                    </p>
                                </div>

                                <div className="mt-8 pt-4 border-t border-[#1C2721] flex justify-between items-center opacity-70 group-hover:opacity-100 transition-opacity">
                                    <div className="text-xs font-mono text-zinc-600">ID: #{lab.id}</div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleOpenEditModal(lab)}
                                            className="p-2 bg-[#0D1310] hover:bg-[#1C2721] border border-[#1C2721] hover:border-[#2A3B32] text-zinc-400 hover:text-white rounded-lg transition-all"
                                            title="Editar"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteLab(lab.id)}
                                            className="p-2 bg-[#0D1310] hover:bg-red-950/50 border border-[#1C2721] hover:border-red-900/50 text-zinc-400 hover:text-red-400 rounded-lg transition-all"
                                            title="Eliminar"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>

            {/* Settings Modal (Create / Edit) */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="bg-[#0D1310] border-[#1C2721] text-white">
                    <DialogHeader>
                        <DialogTitle className="text-xl flex items-center gap-2">
                            {editingLab ? (
                                <><Edit className="w-5 h-5 text-[#D3FB52]" /> Editar Laboratorio</>
                            ) : (
                                <><Plus className="w-5 h-5 text-[#D3FB52]" /> Crear Laboratorio</>
                            )}
                        </DialogTitle>
                        <DialogDescription className="text-zinc-400">
                            {editingLab ? "Actualiza las propiedades, el aforo, y el estado del entorno de aprendizaje." : "Añade un nuevo entorno de aprendizaje o sala informática al sistema global de registro."}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 my-4">
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-zinc-300">Nombre del Laboratorio</label>
                            <input
                                type="text"
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                placeholder="Ej: Laboratorio de Redes Cisco"
                                className="w-full bg-[#141C18] border border-[#2A3B32] p-3 rounded-lg text-white outline-none focus:border-[#D3FB52] transition-colors"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-zinc-300">Ubicación / Piso</label>
                            <input
                                type="text"
                                value={formData.ubicacion}
                                onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                                placeholder="Ej: Edificio Sur, 3er Piso"
                                className="w-full bg-[#141C18] border border-[#2A3B32] p-3 rounded-lg text-white outline-none focus:border-[#D3FB52] transition-colors"
                            />
                        </div>

                        <div className="flex gap-4">
                            <div className="space-y-3 w-1/2">
                                <label className="block text-sm font-medium text-zinc-300">Capacidad (Estudiantes)</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={formData.capacidad}
                                    onChange={(e) => setFormData({ ...formData, capacidad: Number(e.target.value) })}
                                    className="w-full bg-[#141C18] border border-[#2A3B32] p-3 rounded-lg text-white outline-none focus:border-[#D3FB52] transition-colors"
                                />
                            </div>

                            <div className="space-y-3 w-1/2">
                                <label className="block text-sm font-medium text-zinc-300">Estado Operativo</label>
                                <select
                                    value={formData.estado}
                                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                                    className="w-full bg-[#141C18] border border-[#2A3B32] p-3 rounded-lg text-white outline-none focus:border-[#D3FB52] transition-colors appearance-none cursor-pointer"
                                >
                                    <option value="disponible">✅ Disponible (Activo)</option>
                                    <option value="mantenimiento">⚠️ En Mantenimiento</option>
                                    <option value="inhabilitado">🛑 Inhabilitado</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-transparent text-zinc-400 hover:text-white transition-colors">
                            Cancelar
                        </button>
                        <button onClick={handleSaveLab} className="px-4 py-2 bg-[#D3FB52] hover:bg-[#bceb3b] text-black font-semibold rounded-lg transition-colors">
                            Guardar Cambios
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
