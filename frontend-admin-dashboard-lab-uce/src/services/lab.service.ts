import { api } from './api';

export interface Lab {
    id: number;
    nombre: string;
    ubicacion: string;
    capacidad: number;
    estado?: string;
}

export interface Reservation {
    id: number;
    user_id: number;
    lab_id: number;
    fecha: string;
    hora_inicio: number;
    materia: string;
    estado: string;
    lab_nombre?: string;
    user_nombre?: string;
    user_email?: string;
}

export interface AvailabilityRequest {
    laboratorioId: number;
    fecha: string; // YYYY-MM-DD
}

export interface CreateBookingRequest {
    lab_id: number;
    fecha: string;
    horas: number[];
    materia: string;
}

class LabServiceFacade {
    /**
     * Retrieves all available laboratories.
     * GET /labs
     */
    async listLabs(): Promise<Lab[]> {
        return api.get<Lab[]>('/labs');
    }

    /**
     * Create a new laboratory.
     * POST /labs
     */
    async createLab(data: Omit<Lab, 'id'>): Promise<Lab> {
        return api.post<Lab>('/labs', data);
    }

    /**
     * Update an existing laboratory.
     * PUT /labs/:id
     */
    async updateLab(id: number, data: Omit<Lab, 'id'>): Promise<Lab> {
        return api.put<Lab>(`/labs/${id}`, data);
    }

    /**
     * Delete/disable a laboratory.
     * DELETE /labs/:id
     */
    async deleteLab(id: number): Promise<{ success: boolean }> {
        return api.delete<{ success: boolean }>(`/labs/${id}`);
    }

    /**
     * Checks availability for a specific lab on a specific date.
     * GET /labs/disponibilidad?laboratorioId=X&fecha=YYYY-MM-DD
     */
    async getAvailability(laboratorioId: number, fecha: string): Promise<Record<string, unknown>[]> {
        return api.get<Record<string, unknown>[]>(`/labs/disponibilidad?laboratorioId=${laboratorioId}&fecha=${fecha}`);
    }

    /**
     * Retrieves all reservations across the system for the admin dashboard.
     * GET /labs/todas-reservas
     */
    async getReservations(): Promise<Reservation[]> {
        return api.get<Reservation[]>('/labs/todas-reservas');
    }

    /**
     * Create a new booking.
     * POST /labs/reservar
     */
    async createBooking(request: CreateBookingRequest): Promise<Reservation> {
        return api.post<Reservation>('/labs/reservar', request);
    }

    /**
     * Cancel an existing reservation.
     * DELETE /labs/reservas/:id
     */
    async cancelReservation(id: number): Promise<{ message: string }> {
        return api.delete<{ message: string }>(`/labs/reservas/${id}`);
    }

    /**
     * Cancel a reservation as admin (bypasses user_id ownership check).
     * DELETE /labs/reservas/:id/admin
     */
    async adminCancelReservation(id: number): Promise<{ message: string }> {
        return api.delete<{ message: string }>(`/labs/reservas/${id}/admin`);
    }

    /**
     * Reschedule an existing reservation.
     * PATCH /labs/reservas/:id/reagendar
     */
    async rescheduleReservation(id: number, fecha: string, hora_inicio: number): Promise<{ message: string, reservation: Reservation }> {
        return api.patch<{ message: string, reservation: Reservation }>(`/labs/reservas/${id}/reagendar`, { fecha, hora_inicio });
    }
}

export const LabService = new LabServiceFacade();
