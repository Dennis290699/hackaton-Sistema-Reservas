import { useEffect, useRef } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

export const useSessionTimeout = () => {
    const { token, logout } = useAuthStore();
    const navigate = useNavigate();
    const timeoutRef = useRef<number | null>(null);

    const resetTimeout = () => {
        if (timeoutRef.current) {
            window.clearTimeout(timeoutRef.current);
        }

        if (token) {
            timeoutRef.current = window.setTimeout(() => {
                handleLogout();
            }, TIMEOUT_MS);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
        toast.info('Su sesión ha expirado por inactividad.');
    };

    useEffect(() => {
        if (!token) return;

        // Initial setup
        resetTimeout();

        // Event listeners for activity
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];

        const handleActivity = () => {
            resetTimeout();
        };

        events.forEach(event => {
            window.addEventListener(event, handleActivity);
        });

        return () => {
            if (timeoutRef.current) {
                window.clearTimeout(timeoutRef.current);
            }
            events.forEach(event => {
                window.removeEventListener(event, handleActivity);
            });
        };
    }, [token, navigate, logout]);
};
