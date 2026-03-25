export interface User {
    id: number;
    full_name: string;
    email: string;
    role: string;
}

export interface AuthResponse {
    token: string;
    role: string;
    full_name: string;
}

export interface Reservation {
    id: number;
    lab_id: number;
    user_id: number;
    fecha: string;
    hora_inicio: number;
    materia: string;
    lab_nombre?: string; // Optional as it might be joined
    estado?: string; // 'active' | 'expired'
}

export interface Lab {
    id: number;
    nombre: string;
    capacidad: number;
    ubicacion: string;
    estado?: 'disponible' | 'mantenimiento' | 'inhabilitado';
}

export interface AvailabilitySlot {
    hora: number;
    estado: 'libre' | 'ocupado';
}
