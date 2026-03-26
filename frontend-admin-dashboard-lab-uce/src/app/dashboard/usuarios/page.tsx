"use client";

import { useEffect, useState, useMemo } from "react";
import { UserService, User } from "@/services/user.service";
import { motion, Variants } from "framer-motion";
import { Search, Users, Shield, Key, Trash2, Edit, ArrowLeft, Plus, Eye, Mail, Fingerprint, Lock, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export default function UsuariosPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");

    // Modal States
    const [isCreateEditModalOpen, setIsCreateEditModalOpen] = useState(false);
    const [isDisableModalOpen, setIsDisableModalOpen] = useState(false);

    // Active User Selection
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [userToDisable, setUserToDisable] = useState<User | null>(null);

    // Form States
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        role: "student",
        estado: "activo",
        password: ""
    });

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const data = await UserService.listUsers();
            setUsers(data);
        } catch (error) {
            console.error("Error loading users:", error);
            toast.error("Error crítico al extraer el directorio de usuarios");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredUsers = useMemo(() => {
        let result = users;
        if (!Array.isArray(users)) return [];

        if (searchTerm.trim() !== "") {
            const term = searchTerm.toLowerCase();
            result = result.filter(u => {
                if (!u) return false;
                return String(u.full_name || "").toLowerCase().includes(term) || String(u.email || "").toLowerCase().includes(term);
            });
        }

        if (roleFilter !== "all") {
            result = result.filter(u => u && String(u.role || "").trim().toLowerCase() === roleFilter);
        }

        return result;
    }, [users, searchTerm, roleFilter]);

    const stats = useMemo(() => {
        try {
            if (!Array.isArray(users)) return { all: 0, admins: 0, students: 0 };
            return {
                all: users.length,
                admins: users.filter(u => u && String(u.role || "").trim().toLowerCase() === 'admin').length,
                students: users.filter(u => u && String(u.role || "").trim().toLowerCase() === 'student').length
            };
        } catch (error) {
            console.error("Error al calcular estadísticas:", error);
            return { all: 0, admins: 0, students: 0 };
        }
    }, [users]);

    const handleSearchChange = (val: string) => {
        setSearchTerm(val);
        // Si el usuario empieza a buscar, reiniciamos el filtro visual para buscar en la base global
        if (val.trim() !== "" && roleFilter !== "all") {
            setRoleFilter("all");
        }
    };

    const handleRoleChange = (role: string) => {
        setRoleFilter(role);
        // Despejamos el texto para no colisionar con el nuevo filtro visualmente
        setSearchTerm("");
    };

    // Handlers para Create/Edit
    const handleOpenCreateModal = () => {
        setSelectedUser(null);
        setFormData({ full_name: "", email: "", role: "student", estado: "activo", password: "" });
        setIsCreateEditModalOpen(true);
    };

    const handleOpenEditModal = (user: User) => {
        setSelectedUser(user);
        setFormData({
            full_name: user.full_name,
            email: user.email,
            role: user.role,
            estado: user.estado || "activo",
            password: "" // Se ignora en el update
        });
        setIsCreateEditModalOpen(true);
    };

    const handleSaveUser = async () => {
        if (!formData.full_name || !formData.email) {
            return toast.error("El nombre y correo electrónico son obligatorios.");
        }

        try {
            if (selectedUser) { // EDIT
                await UserService.updateUser(selectedUser.id, {
                    full_name: formData.full_name,
                    email: formData.email,
                    role: formData.role as 'admin' | 'student',
                    estado: formData.estado
                });
                toast.success("Credenciales del usuario actualizadas con éxito.");
            } else { // CREATE
                if (formData.password.length < 6) return toast.error("La contraseña debe tener al menos 6 caracteres.");
                await UserService.createUser({
                    full_name: formData.full_name,
                    email: formData.email,
                    role: formData.role as 'admin' | 'student',
                    estado: formData.estado,
                    password: formData.password
                });
                toast.success("Nuevo usuario registrado correctamente en la base central.");
            }
            setIsCreateEditModalOpen(false);
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Error al completar la transacción.");
        }
    };

    // Handler para Trash (Soft Disable) Modal Prompt
    const promptDisableUser = (user: User) => {
        setUserToDisable(user);
        setIsDisableModalOpen(true);
    };

    const confirmDisableUser = async () => {
        if (!userToDisable) return;
        setIsDisableModalOpen(false);

        try {
            // Reutilizamos el endpoint update para inyectar "inactivo"
            await UserService.updateUser(userToDisable.id, {
                full_name: userToDisable.full_name,
                email: userToDisable.email,
                role: userToDisable.role,
                estado: "inactivo"
            });
            toast.success("Acceso restringido. Cuenta inhabilitada exitosamente.");
            fetchData();
        } catch (error: any) {
            toast.error("Error al inhabilitar la cuenta de usuario.");
        }
    };

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const rowVariants: Variants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
    };

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Header Area */}
            <header className="w-full flex justify-between items-end mb-8 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Users className="w-8 h-8 text-[#D3FB52]" />
                        Directorio de Usuarios
                    </h1>
                    <p className="text-zinc-400 mt-2">Administra accesos corporativos, privilegios, audita detalles y restablece credenciales de acceso.</p>
                </div>

                <button
                    onClick={handleOpenCreateModal}
                    className="flex items-center gap-2 bg-[#D3FB52] hover:bg-[#bceb3b] text-black px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-[#D3FB52]/20"
                >
                    <Plus className="w-5 h-5" />
                    Nuevo Usuario
                </button>
            </header>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto no-scrollbar bg-[#0D1310] border border-[#1C2721] rounded-3xl p-8 relative flex flex-col">

                {/* Search & Filters */}
                <div className="mb-8 flex flex-col md:flex-row items-center gap-4 shrink-0">
                    <div className="bg-[#141C18] p-4 rounded-2xl border border-[#2A3B32] flex items-center gap-4 flex-1 w-full">
                        <Search className="w-5 h-5 text-zinc-500" />
                        <input
                            type="text"
                            placeholder="Buscar usuario por nombre o correo (ej: admin@...)"
                            value={searchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="w-full bg-transparent border-none text-white outline-none placeholder:text-zinc-600 font-medium"
                        />
                    </div>

                    <div className="flex bg-[#141C18] border border-[#2A3B32] p-1 rounded-2xl md:w-auto w-full shrink-0">
                        <button
                            type="button"
                            onClick={() => handleRoleChange("all")}
                            className={`flex flex-1 md:flex-none items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all ${roleFilter === 'all' ? 'bg-[#2A3B32] text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            <Users className="w-4 h-4" /> Todos
                            <span className="ml-1 px-2 py-0.5 rounded-full bg-black/30 text-xs">{stats.all}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => handleRoleChange("admin")}
                            className={`flex flex-1 md:flex-none items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all ${roleFilter === 'admin' ? 'bg-[#D3FB52]/20 text-[#D3FB52] shadow-md border border-[#D3FB52]/10' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            <ShieldAlert className="w-4 h-4" /> Admins
                            <span className="ml-1 px-2 py-0.5 rounded-full bg-black/30 text-xs">{stats.admins}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => handleRoleChange("student")}
                            className={`flex flex-1 md:flex-none items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all ${roleFilter === 'student' ? 'bg-blue-500/20 text-blue-400 shadow-md border border-blue-500/10' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            <Users className="w-4 h-4" /> Estudiantes
                            <span className="ml-1 px-2 py-0.5 rounded-full bg-black/30 text-xs">{stats.students}</span>
                        </button>
                    </div>
                </div>

                {/* Table Data */}
                {isLoading ? (
                    <div className="flex-1 flex justify-center items-center">
                        <span className="relative flex h-10 w-10">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D3FB52] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-10 w-10 bg-[#D3FB52]"></span>
                        </span>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-[#2A3B32] rounded-2xl bg-[#141C18]/30">
                        <Users className="w-12 h-12 text-zinc-700 mb-4" />
                        <p className="text-zinc-400 font-medium">Ningún usuario coincidió con tu búsqueda.</p>
                    </div>
                ) : (
                    <div className="w-full border border-[#1C2721] rounded-2xl overflow-hidden shadow-2xl overflow-x-auto shrink-0 pb-4">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead className="bg-[#141C18] border-b border-[#1C2721]">
                                <tr>
                                    <th className="p-5 text-zinc-400 font-medium whitespace-nowrap">ID</th>
                                    <th className="p-5 text-zinc-400 font-medium whitespace-nowrap">Nombre Completo</th>
                                    <th className="p-5 text-zinc-400 font-medium whitespace-nowrap">Correo Electrónico</th>
                                    <th className="p-5 text-zinc-400 font-medium whitespace-nowrap">Rol Institucional</th>
                                    <th className="p-5 text-zinc-400 font-medium whitespace-nowrap">Estado Operativo</th>
                                    <th className="p-5 text-zinc-400 font-medium text-right whitespace-nowrap">Comandos Lógicos</th>
                                </tr>
                            </thead>
                            <tbody
                                className="divide-y divide-[#1C2721]/50 bg-transparent"
                            >
                                {filteredUsers.map((user) => (
                                    <tr
                                        key={user.id}
                                        className={`hover:bg-[#141C18]/60 transition-colors group ${user.estado === 'inactivo' ? 'opacity-50 hover:opacity-100 grayscale hover:grayscale-0' : ''}`}
                                    >
                                        <td className="p-5 text-sm font-mono text-zinc-500">#{user.id}</td>
                                        <td className="p-5 font-bold text-white flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${user.role === 'admin' ? 'bg-[#D3FB52]/20 text-[#D3FB52]' : 'bg-blue-500/20 text-blue-400'}`}>
                                                {user.full_name.charAt(0).toUpperCase()}
                                            </div>
                                            {user.full_name}
                                        </td>
                                        <td className="p-5 text-zinc-300">
                                            {user.email}
                                        </td>
                                        <td className="p-5">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${user.role === 'admin'
                                                    ? 'bg-[#D3FB52]/10 text-[#D3FB52] border-[#D3FB52]/20'
                                                    : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                }`}>
                                                {user.role === 'admin' ? <ShieldAlert className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                                                {user.role === 'admin' ? 'Administrador' : 'Estudiante'}
                                            </span>
                                        </td>
                                        <td className="p-5">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${(user.estado || 'activo') === 'activo'
                                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                                                }`}>
                                                {String(user.estado || 'activo').toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                                <Link href={`/dashboard/usuarios/${user.id}`} className="p-2 bg-[#0D1310] hover:bg-[#D3FB52]/10 border border-[#1C2721] hover:border-[#D3FB52]/50 text-zinc-400 hover:text-[#D3FB52] rounded-lg transition-all" title="Ver Expediente Detallado">
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                <button onClick={() => handleOpenEditModal(user)} className="p-2 bg-[#0D1310] hover:bg-[#1C2721] border border-[#1C2721] hover:border-[#2A3B32] text-zinc-400 hover:text-white rounded-lg transition-all" title="Editar Rol Básicomente">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                {user.estado !== 'inactivo' && (
                                                    <button onClick={() => promptDisableUser(user)} className="p-2 bg-[#0D1310] hover:bg-red-950/50 border border-[#1C2721] hover:border-red-900/50 text-red-900 hover:text-red-400 rounded-lg transition-all" title="Inhabilitar Acceso Logico">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal: Creación y Edición */}
            <Dialog open={isCreateEditModalOpen} onOpenChange={setIsCreateEditModalOpen}>
                <DialogContent className="bg-[#0D1310] border-[#1C2721] text-white">
                    <DialogHeader>
                        <DialogTitle className="text-xl flex items-center gap-2">
                            {selectedUser ? (
                                <><Edit className="w-5 h-5 text-[#D3FB52]" /> Editar Accesos de {selectedUser.full_name}</>
                            ) : (
                                <><Shield className="w-5 h-5 text-[#D3FB52]" /> Registrar Nuevo Usuario Base</>
                            )}
                        </DialogTitle>
                        <DialogDescription className="text-zinc-400">
                            {selectedUser ? "Modifique el rol estructural o rectifique la designación del estudiante en la base de datos." : "De de alta nuevas credenciales para dar cobijo a administradores o pre-aprobar estudiantes externamente."}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 my-4">
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-zinc-300">Nombre Completo Legal</label>
                            <input
                                type="text"
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                placeholder="Ej: Dennis Pilatasig"
                                className="w-full bg-[#141C18] border border-[#2A3B32] p-3 rounded-lg text-white outline-none focus:border-[#D3FB52] transition-colors"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-zinc-300">Correo Electrónico (Login)</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="Ej: correo@uce.edu.ec"
                                className="w-full bg-[#141C18] border border-[#2A3B32] p-3 rounded-lg text-white outline-none focus:border-[#D3FB52] transition-colors"
                            />
                        </div>

                        {!selectedUser && (
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-zinc-300 flex items-center gap-2"><Lock className="w-4 h-4" /> Contraseña Transitoria</label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="Mínimo 6 caracteres..."
                                    className="w-full bg-[#141C18] border border-[#2A3B32] p-3 rounded-lg text-white outline-none focus:border-[#D3FB52] transition-colors"
                                />
                            </div>
                        )}

                        <div className="flex gap-4">
                            <div className="space-y-3 w-1/2">
                                <label className="block text-sm font-medium text-zinc-300">Nivel de Acceso</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full bg-[#141C18] border border-[#2A3B32] p-3 rounded-lg text-white outline-none focus:border-[#D3FB52] appearance-none cursor-pointer"
                                >
                                    <option value="student">Estudiante Normal</option>
                                    <option value="admin">Supremo Administrador</option>
                                </select>
                            </div>

                            <div className="space-y-3 w-1/2">
                                <label className="block text-sm font-medium text-zinc-300">Estado del Token</label>
                                <select
                                    value={formData.estado}
                                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                                    className="w-full bg-[#141C18] border border-[#2A3B32] p-3 rounded-lg text-white outline-none focus:border-[#D3FB52] appearance-none cursor-pointer"
                                >
                                    <option value="activo">✅ Activo (Login Permitido)</option>
                                    <option value="inactivo">🛑 Inactivo (Login Suspendido)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <button onClick={() => setIsCreateEditModalOpen(false)} className="px-4 py-2 bg-transparent text-zinc-400 hover:text-white transition-colors">
                            Cancelar
                        </button>
                        <button onClick={handleSaveUser} className="px-4 py-2 bg-[#D3FB52] hover:bg-[#bceb3b] text-black font-semibold rounded-lg transition-colors">
                            Confirmar Base de Datos
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal: Confirmación de Inhabilitación Fuerte */}
            <Dialog open={isDisableModalOpen} onOpenChange={setIsDisableModalOpen}>
                <DialogContent className="bg-[#0D1310] border-red-900/50 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-xl flex items-center gap-2 text-red-500">
                            <ShieldAlert className="w-6 h-6" /> Revocar Accesos del Sistema
                        </DialogTitle>
                        <DialogDescription className="text-zinc-400">
                            ¿Estás seguro que deseas <strong className="text-red-400">INHABILITAR</strong> categóricamente la cuenta de <strong>{userToDisable?.full_name}</strong>?
                        </DialogDescription>
                    </DialogHeader>

                    <div className="bg-red-950/20 border border-red-900/30 p-4 rounded-xl mt-4 mb-2">
                        <p className="text-sm text-red-200/70">
                            Esta acción cortocircuitará los tokens de autenticación para el usuario seleccionado. Su historial de reservas se mantendrá intacto por motivos de auditoría, pero no podrá iniciar sesión en la aplicación de reservas bajo ninguna circunstancia.
                        </p>
                    </div>

                    <DialogFooter className="mt-4">
                        <button onClick={() => setIsDisableModalOpen(false)} className="px-4 py-2 bg-transparent text-zinc-400 hover:text-white transition-colors">
                            Cancelar Aborto
                        </button>
                        <button onClick={confirmDisableUser} className="px-4 py-2 bg-red-900 hover:bg-red-800 text-white font-semibold rounded-lg transition-colors border border-red-800/50">
                            Inhabilitar de Inmediato
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}
