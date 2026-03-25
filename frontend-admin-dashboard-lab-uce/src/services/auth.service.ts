import { api } from './api';

export interface LoginCredentials {
    correoElectronico: string;
    contrasena: string;
}

export interface AuthResponse {
    message?: string;
    token?: string;
    user?: {
        id: number;
        nombre: string;
        correoElectronico: string;
        esAdmin: boolean;
    };
}

class AuthServiceFacade {
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const payload = {
            email: credentials.correoElectronico,
            password: credentials.contrasena,
        };
        const response = await api.post<AuthResponse>('/auth/login', payload);
        if (response.token && typeof window !== 'undefined') {
            localStorage.setItem('admin_token', response.token);
            if (response.user) {
                localStorage.setItem('admin_user', JSON.stringify(response.user));
            }
        }
        return response;
    }

    logout(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_user');
            window.location.href = '/login';
        }
    }

    isAuthenticated(): boolean {
        if (typeof window === 'undefined') return false;
        return !!localStorage.getItem('admin_token');
    }

    getCurrentUser(): AuthResponse['user'] | null {
        if (typeof window === 'undefined') return null;
        const userStr = localStorage.getItem('admin_user');
        if (!userStr) return null;
        try {
            return JSON.parse(userStr);
        } catch {
            return null;
        }
    }
}

export const AuthService = new AuthServiceFacade();
