"use client";

import { useEffect, useState } from "react";
import { UserService, User } from "@/services/user.service";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Key, Lock, Mail, Shield, ShieldAlert, Users, Fingerprint, History, Activity } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export default function UserDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    // Password reset & state toggles
    const [newPassword, setNewPassword] = useState("");
    const [isResetting, setIsResetting] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                if (params.id) {
                    const data = await UserService.getUser(Number(params.id));
                    setUser(data);
                }
            } catch (error) {
                console.error("Error fetching user details:", error);
                toast.error("El usuario seleccionado no existe o hubo un error de conexión.");
                router.push("/dashboard/usuarios");
            } finally {
                setIsLoading(false);
            }
        };

        fetchUser();
    }, [params.id, router]);

    const handleExecutePasswordReset = async () => {
        if (!user) return;
        if (newPassword.length < 6) return toast.error("La nueva contraseña requiere mínimo 6 caracteres por seguridad.");

        setIsResetting(true);
        try {
            await UserService.updatePassword(user.id, newPassword);
            toast.success("Contraseña reescrita encriptada exitosamente.");
            setNewPassword("");
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Error de servidor al reescribir la contraseña.");
        } finally {
            setIsResetting(false);
        }
    };

    const handleOpenStatusPrompt = () => {
        setIsStatusModalOpen(true);
    };

    const confirmToggleStatus = async () => {
        if (!user) return;
        setIsStatusModalOpen(false);
        setIsUpdatingStatus(true);
        const newStatus = (user.estado || 'activo') === 'activo' ? 'inactivo' : 'activo';

        try {
            const updated = await UserService.updateUser(user.id, {
                full_name: user.full_name,
                email: user.email,
                role: user.role,
                estado: newStatus
            });
            setUser(updated);
            toast.success(`Estado operacional transpuesto radicalmente a ${newStatus.toUpperCase()}`);
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Error de servidor al modificar el estado.");
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const childVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    if (isLoading) {
        return (
            <div className="flex h-full justify-center items-center">
                <span className="relative flex h-12 w-12">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D3FB52] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-12 w-12 bg-[#D3FB52]"></span>
                </span>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Header Area */}
            <header className="w-full flex justify-between items-end mb-8 shrink-0">
                <div>
                    <Link href="/dashboard/usuarios" className="text-zinc-400 hover:text-white flex items-center gap-2 mb-2 transition-colors w-fit font-medium">
                        <ArrowLeft className="w-4 h-4" /> Volver al Directorio
                    </Link>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Fingerprint className="w-8 h-8 text-[#D3FB52]" />
                        Auditoría de Cuenta
                    </h1>
                    <p className="text-zinc-400 mt-2">Visualización detallada de expedientes y overrides de seguridad.</p>
                </div>
            </header>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto no-scrollbar relative flex flex-col md:flex-row gap-8">
                
                {/* Left Column (Profile Info) */}
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="w-full md:w-1/2 space-y-6"
                >
                    {/* Hero Profile Card */}
                    <motion.div variants={childVariants} className="bg-[#0D1310] border border-[#1C2721] rounded-3xl p-8 shadow-xl flex flex-col items-center relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-[#1A261E] to-[#0D1310] z-0"></div>
                        
                        <div className={`w-28 h-28 rounded-full border-4 border-[#0D1310] shadow-2xl flex items-center justify-center text-4xl font-black z-10 mb-6 ${user.role === 'admin' ? 'bg-[#D3FB52]/20 text-[#D3FB52]' : 'bg-blue-500/20 text-blue-400'}`}>
                            {user.full_name.charAt(0).toUpperCase()}
                        </div>
                        
                        <div className="z-10 text-center">
                            <h2 className="text-3xl font-extrabold text-white mb-2">{user.full_name}</h2>
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border bg-[#141C18] border-[#1C2721] mb-6 shadow-sm">
                                <Mail className="w-4 h-4 text-zinc-400" />
                                <span className="text-zinc-300 font-medium">{user.email}</span>
                            </div>
                        </div>

                        <div className="w-full grid grid-cols-2 gap-4 mt-2 z-10">
                            <div className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center ${user.role === 'admin' ? 'bg-[#D3FB52]/5 border-[#D3FB52]/20' : 'bg-blue-500/5 border-blue-500/20'}`}>
                                {user.role === 'admin' ? <ShieldAlert className="w-6 h-6 mb-2 text-[#D3FB52]" /> : <Users className="w-6 h-6 mb-2 text-blue-400" />}
                                <span className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-1">Rango Lógico</span>
                                <span className={`font-bold capitalize ${user.role === 'admin' ? 'text-[#D3FB52]' : 'text-blue-400'}`}>
                                    {user.role === 'admin' ? 'Administrador' : 'Estudiante'}
                                </span>
                            </div>
                            <div className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center transition-colors ${user.estado === 'activo' || !user.estado ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                                <Activity className={`w-6 h-6 mb-2 ${user.estado === 'activo' || !user.estado ? 'text-emerald-400' : 'text-red-400'}`} />
                                <span className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-1">Estado de Red</span>
                                <span className={`font-bold capitalize ${user.estado === 'activo' || !user.estado ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {user.estado || 'Activo'}
                                </span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Meta Data Card */}
                    <motion.div variants={childVariants} className="bg-[#141C18] border border-[#1C2721] rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><History className="w-5 h-5 text-zinc-400"/> Metadatos del Sistema</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-[#1C2721]">
                                <span className="text-zinc-500 font-medium">UUID Base de Datos</span>
                                <span className="text-white font-mono bg-[#0D1310] px-3 py-1 rounded-md border border-[#2A3B32]">#{user.id}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-[#1C2721]">
                                <span className="text-zinc-500 font-medium">Motor de Autenticación</span>
                                <span className="text-white font-medium">JWT Local</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-zinc-500 font-medium">Encriptación Criptográfica</span>
                                <span className="text-white font-medium">Bcrypt (10 Salts)</span>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Right Column (Actions & Security) */}
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="w-full md:w-1/2"
                >
                    {/* Danger Zone: Password Reset */}
                    <motion.div variants={childVariants} className="bg-[#0D1310] border border-yellow-900/50 rounded-3xl p-8 relative overflow-hidden group shadow-2xl">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-bl-full pointer-events-none group-hover:bg-yellow-500/10 transition-colors"></div>
                        
                        <div className="flex items-center gap-4 mb-6 relative z-10">
                            <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
                                <Key className="w-6 h-6 text-yellow-500" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-yellow-500">Recuperación Personal</h3>
                                <p className="text-yellow-700 font-medium">Restablecimiento manual de emergencia</p>
                            </div>
                        </div>

                        <div className="text-zinc-400 text-sm mb-6 leading-relaxed relative z-10">
                            <strong className="text-white">Alerta de Seguridad:</strong> Como administrador, tienes la autoridad técnica para eludir los protocolos de seguridad regulares y sobrescribir la clave criptográfica de <span className="text-white">{user.full_name}</span> sin confirmación del correo electrónico o contraseña antigua.
                        </div>

                        <div className="space-y-4 relative z-10">
                            <div className="space-y-3">
                                <label className="block text-sm font-bold text-yellow-500 flex items-center gap-2">
                                    <Lock className="w-4 h-4" /> Nuevo Token Criptográfico (Mínimo 6)
                                </label>
                                <input 
                                    type="text" 
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Ingresa la nueva clave secreta aquí..."
                                    className="w-full bg-[#141C18] border border-yellow-900/40 p-4 rounded-xl text-white outline-none focus:border-yellow-500 focus:shadow-[0_0_20px_rgba(234,179,8,0.15)] transition-all font-mono text-lg"
                                />
                            </div>
                            <button 
                                onClick={handleExecutePasswordReset} 
                                disabled={isResetting || newPassword.length < 6}
                                className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg flex justify-center items-center gap-2 ${
                                    isResetting || newPassword.length < 6 
                                        ? "bg-[#141C18] text-zinc-600 border border-[#1C2721] cursor-not-allowed" 
                                        : "bg-yellow-500 hover:bg-yellow-400 text-black shadow-[0_0_20px_rgba(234,179,8,0.2)] hover:scale-[1.02]"
                                }`}
                            >
                                {isResetting ? (
                                     <span className="animate-spin inline-block w-5 h-5 border-[3px] border-black border-t-transparent rounded-full"></span>
                                ) : (
                                    <>Forzar Reset de Contraseña (Bcrypt)</>
                                )}
                            </button>
                        </div>
                    </motion.div>

                    {/* Operational State Card */}
                    <motion.div variants={childVariants} className="bg-[#0D1310] border border-[#1C2721] rounded-3xl p-8 mt-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${user.estado === 'activo' || !user.estado ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                                <Activity className={`w-6 h-6 ${user.estado === 'activo' || !user.estado ? 'text-emerald-500' : 'text-red-500'}`} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Estado Operacional</h3>
                                <p className="text-zinc-400 font-medium">Control severo de acceso al sistema</p>
                            </div>
                        </div>
                        <p className="text-sm text-zinc-500 mb-6">Al inhabilitar a este usuario, su sesión será revocada y no podrá ingresar al dashboard o al pool de reservaciones de laboratorios, protegiendo así el sistema.</p>
                        
                        <button 
                            onClick={handleOpenStatusPrompt}
                            disabled={isUpdatingStatus}
                            className={`w-full py-4 rounded-xl font-bold transition-all flex justify-center items-center gap-2 ${
                                user.estado === 'activo' || !user.estado 
                                    ? "bg-[#141C18] border border-red-500/30 text-red-500 hover:bg-red-500/10"
                                    : "bg-[#141C18] border border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10"
                            }`}
                        >
                            {isUpdatingStatus ? (
                                <span className="animate-spin inline-block w-5 h-5 border-[3px] border-current border-t-transparent rounded-full"></span>
                            ) : (
                                (user.estado || 'activo') === 'activo' ? 'Suspender Accesos (Inhabilitar)' : 'Restaurar Accesos (Activar)'
                            )}
                        </button>
                    </motion.div>
                </motion.div>
            </div>

            {/* Modal: Confirmación de Suspensión / Reactivación */}
            <Dialog open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
                <DialogContent className={`bg-[#0D1310] text-white border ${user.estado === 'activo' || !user.estado ? 'border-red-900/50' : 'border-emerald-900/50'}`}>
                    <DialogHeader>
                        <DialogTitle className={`text-xl flex items-center gap-2 ${user.estado === 'activo' || !user.estado ? 'text-red-500' : 'text-emerald-500'}`}>
                            <ShieldAlert className="w-6 h-6" /> 
                            {user.estado === 'activo' || !user.estado ? 'Revocar Perfil del Sistema' : 'Autorizar Perfil en Sistema'}
                        </DialogTitle>
                        <DialogDescription className="text-zinc-400">
                            ¿Estás firmemente seguro que deseas 
                            <strong className={user.estado === 'activo' || !user.estado ? 'text-red-400 mx-1' : 'text-emerald-400 mx-1'}>
                                {user.estado === 'activo' || !user.estado ? 'INHABILITAR' : 'HABILITAR'}
                            </strong> 
                            a la cuenta de <strong>{user.full_name}</strong>?
                        </DialogDescription>
                    </DialogHeader>

                    <div className={`border p-4 rounded-xl mt-4 mb-2 ${user.estado === 'activo' || !user.estado ? 'bg-red-950/20 border-red-900/30 text-red-200/70' : 'bg-emerald-950/20 border-emerald-900/30 text-emerald-200/70'}`}>
                        <p className="text-sm">
                            {user.estado === 'activo' || !user.estado 
                                ? "La inhabilitación cortocircuitará los tokens y sesiones actitvas. El usuario tendrá denegado el ingreso a reservas futuras, aunque su historial persistirá."
                                : "La habilitación regenerará sus credenciales de acceso, dándole libertad total para interactuar nuevamente con los horarios académicos y laboratorios virtuales."
                            }
                        </p>
                    </div>

                    <DialogFooter className="mt-4">
                        <button onClick={() => setIsStatusModalOpen(false)} className="px-4 py-2 bg-transparent text-zinc-400 hover:text-white transition-colors">
                            Cancelar Operación
                        </button>
                        <button 
                            onClick={confirmToggleStatus} 
                            className={`px-4 py-2 text-white font-semibold rounded-lg transition-colors border ${
                                user.estado === 'activo' || !user.estado 
                                    ? 'bg-red-900 hover:bg-red-800 border-red-800/50'
                                    : 'bg-emerald-700 hover:bg-emerald-600 border-emerald-600/50'
                            }`}
                        >
                            Confirmar Cambio Categórico
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
