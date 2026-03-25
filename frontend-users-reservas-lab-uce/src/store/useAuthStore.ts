import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '../lib/api';
import type { AuthResponse, User } from '../types';

interface AuthState {
    token: string | null;
    user: User | null;
    role: string | null;
    loginTime?: number;
    setAuth: (data: AuthResponse) => void;
    logout: () => void;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            user: null,
            role: null,
            loginTime: undefined,
            setAuth: (data) => set({
                token: data.token,
                user: { id: 0, full_name: data.full_name, email: '', role: data.role },
                role: data.role,
                loginTime: Date.now(),
            }),
            logout: () => set({ token: null, user: null, role: null, loginTime: undefined }),
            login: async (email, password) => {
                const response = await api.post('/auth/login', { email, password });
                const data = response.data;
                set({
                    token: data.token,
                    user: { id: 0, full_name: data.full_name, email: '', role: data.role },
                    role: data.role,
                    loginTime: Date.now(),
                });
            },
            register: async (name, email, password) => {
                const response = await api.post('/auth/register', { full_name: name, email, password });
                const data = response.data;
                set({
                    token: data.token,
                    user: { id: 0, full_name: data.full_name, email: '', role: data.role },
                    role: data.role,
                    loginTime: Date.now(),
                });
            }
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => sessionStorage),
        }
    )
);
