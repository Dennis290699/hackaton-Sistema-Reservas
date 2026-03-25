import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { AuthLayout } from '../layouts/AuthLayout';
import { User, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { PageTransition } from '../components/PageTransition';

export const RegisterPage: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const register = useAuthStore((state) => state.register);
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await register(name, email, password);
            toast.success('Cuenta creada con éxito');
            // Auto login is handled by store usually, or we redirect
            navigate('/dashboard');
        } catch (error: any) {
            const errorMsg = error.response?.data?.error || 'Error al registrarse. Intente nuevamente.';
            if (Array.isArray(errorMsg)) {
                toast.error(errorMsg[0].message || 'Datos inválidos.');
            } else {
                toast.error(errorMsg);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Construye tu futuro hoy."
            subtitle="Cada gran descubrimiento comienza con una idea. Únete a nuestra comunidad de innovadores."
            imageSrc="https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=2070&auto=format&fit=crop"
        >
            <PageTransition>
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 font-serif">Crear Cuenta</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        ¿Ya eres parte de la comunidad?{' '}
                        <Link to="/login" className="font-medium text-black hover:underline transition-all">
                            Inicia sesión aquí
                        </Link>
                    </p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                                <User className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                autoComplete="name"
                                disabled={isLoading}
                                className="appearance-none rounded-lg relative block w-full pl-12 pr-4 py-4 border border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-1 focus:ring-black focus:border-black sm:text-sm transition-all bg-gray-50 focus:bg-white disabled:opacity-60 disabled:bg-gray-100"
                                placeholder="Nombre Completo"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                                <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                disabled={isLoading}
                                className="appearance-none rounded-lg relative block w-full pl-12 pr-4 py-4 border border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-1 focus:ring-black focus:border-black sm:text-sm transition-all bg-gray-50 focus:bg-white disabled:opacity-60 disabled:bg-gray-100"
                                placeholder="Correo Institucional"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="new-password"
                                disabled={isLoading}
                                className="appearance-none rounded-lg relative block w-full pl-12 pr-12 py-4 border border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-1 focus:ring-black focus:border-black sm:text-sm transition-all bg-gray-50 focus:bg-white disabled:opacity-60 disabled:bg-gray-100"
                                placeholder="Contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="focus:outline-none text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`group relative w-full flex justify-center items-center py-4 px-4 border border-transparent text-sm font-medium rounded-full text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all duration-300 shadow-lg ${isLoading ? 'opacity-75 cursor-not-allowed' : 'hover:shadow-xl transform hover:-translate-y-0.5'}`}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                                    Creando credenciales...
                                </>
                            ) : (
                                'Empezar Ahora'
                            )}
                        </button>
                    </div>
                </form>

                <div className="mt-8 pt-8 border-t border-gray-100 text-center text-xs text-gray-400">
                    Al registrarte aceptas nuestros Términos y Condiciones
                </div>
            </PageTransition>
        </AuthLayout>
    );
};
