import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Clock } from 'lucide-react';

const SESSION_DURATION_MS = 10 * 60 * 1000; // 10 minutes

export const SessionTimer: React.FC = () => {
    const { token, loginTime, logout } = useAuthStore();
    const navigate = useNavigate();
    const [timeLeft, setTimeLeft] = useState<number>(SESSION_DURATION_MS);

    useEffect(() => {
        if (!token || !loginTime) return;

        const interval = setInterval(() => {
            const elapsed = Date.now() - loginTime;
            const remaining = SESSION_DURATION_MS - elapsed;

            if (remaining <= 0) {
                clearInterval(interval);
                logout();
                navigate('/login');
                toast.info('Su tiempo de sesión ha terminado.');
            } else {
                setTimeLeft(remaining);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [token, loginTime, logout, navigate]);

    if (!token) return null;

    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);
    const isWarning = timeLeft < 1 * 60 * 1000; // Less than 1 minutes

    return (
        <div className={`flex items-center gap-2 text-sm transition-colors duration-300 ${isWarning ? 'text-red-600' : 'text-gray-400'}`}>
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline font-light tracking-wide">Tiempo restante:</span>
            <span className={`font-mono font-medium tabular-nums ${isWarning ? 'animate-pulse font-bold' : 'text-black'}`}>
                {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
            </span>
        </div>
    );
};
