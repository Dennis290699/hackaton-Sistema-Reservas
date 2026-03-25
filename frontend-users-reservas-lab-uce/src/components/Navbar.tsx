import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { LogOut } from 'lucide-react';

export const Navbar: React.FC = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Buenos días');
        else if (hour < 18) setGreeting('Buenas tardes');
        else setGreeting('Buenas noches');
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center">
                    {/* Logo area */}
                    <Link to="/" className="group">
                        <span className="text-2xl font-serif text-black tracking-tight group-hover:opacity-70 transition-opacity">
                            Laboratorios UCE
                        </span>
                    </Link>

                    {/* Right side actions */}
                    {user && (
                        <div className="flex items-center gap-6">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs text-gray-400 uppercase tracking-widest mb-0.5">
                                    {greeting},
                                </p>
                                <p className="text-sm font-medium text-gray-900 flex items-center justify-end gap-2">
                                    {user.full_name}
                                </p>
                            </div>

                            <div className="h-8 w-px bg-gray-100 mx-2 hidden sm:block"></div>

                            <button
                                onClick={handleLogout}
                                className="group flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-gray-500 hover:text-black hover:bg-gray-50 transition-all duration-200"
                                title="Cerrar Sesión"
                            >
                                <span>Salir</span>
                                <LogOut className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};
