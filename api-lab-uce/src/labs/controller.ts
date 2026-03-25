import { Request, Response } from 'express';
import { getReservationsByDateAndLab, createReservations, getLabs, createLab, updateLab, deleteLab } from './db';
import { z } from 'zod';

const reservationSchema = z.object({
    lab_id: z.number(),
    fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
    horas: z.array(z.number().min(7).max(20)).min(1),
    materia: z.string().min(3),
});

const VALID_HOURS = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

const labSchema = z.object({
    nombre: z.string().min(3),
    ubicacion: z.string().min(3),
    capacidad: z.number().min(1),
    estado: z.string().min(3)
});

export const getAvailability = async (req: Request, res: Response) => {
    const { fecha, lab_id } = req.query;

    if (!fecha || !lab_id) {
        return res.status(400).json({ error: 'Missing fecha or lab_id query parameters' });
    }

    try {
        const reservations = await getReservationsByDateAndLab(fecha as string, Number(lab_id));

        // Create availability map
        const availability = VALID_HOURS.map(hour => {
            const isOccupied = reservations.some(r => r.hora_inicio === hour);
            return {
                hora: hour,
                estado: isOccupied ? 'ocupado' : 'libre'
            };
        });

        res.json(availability);
    } catch (error) {
        console.error('Availability error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const createBooking = async (req: Request, res: Response) => {
    const validation = reservationSchema.safeParse(req.body);

    if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors });
    }

    const { lab_id, fecha, horas, materia } = validation.data;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    // specific validation: all hours must be valid
    const invalidHours = horas.filter(h => !VALID_HOURS.includes(h));
    if (invalidHours.length > 0) {
        return res.status(400).json({ error: `Invalid hours: ${invalidHours.join(', ')}` });
    }

    try {
        const reservations = await createReservations(lab_id, userId, fecha, horas, materia);
        res.status(201).json(reservations);
    } catch (error: any) {
        if (error.code === '23505') {
            return res.status(409).json({ error: 'One or more time slots are already occupied.' });
        }
        console.error('Booking error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// ... existing code ...
export const listLabs = async (req: Request, res: Response) => {
    try {
        const labs = await getLabs();
        res.json(labs);
    } catch (e) {
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const getUserReservations = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    try {
        const reservations = await import('./db').then(m => m.getReservationsByUser(userId));

        // Calculate status for each reservation based on local Ecuador time
        const nowStr = new Date().toLocaleString("en-US", { timeZone: "America/Guayaquil" });
        const now = new Date(nowStr);
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const reservationsWithStatus = reservations.map((res: any) => {
            let status = 'expired';
            try {
                let resDate: Date;
                if (res.fecha instanceof Date) {
                    resDate = new Date(res.fecha.getFullYear(), res.fecha.getMonth(), res.fecha.getDate());
                } else {
                    const cleanDateStr = String(res.fecha).split('T')[0];
                    const parts = cleanDateStr.split('-');
                    resDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
                }

                if (resDate.getTime() > today.getTime()) {
                    status = 'active';
                } else if (resDate.getTime() === today.getTime()) {
                    if (res.hora_inicio >= now.getHours()) {
                        status = 'active';
                    }
                }
            } catch (e) {
                console.error("Date parse error", e);
            }

            return { ...res, estado: status };
        });

        res.json(reservationsWithStatus);
    } catch (error) {
        console.error('Get user reservations error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getAllReservations = async (req: Request, res: Response) => {
    try {
        const reservations = await import('./db').then(m => m.getAllReservations());

        // Calculate status for each reservation based on local Ecuador time
        const nowStr = new Date().toLocaleString("en-US", { timeZone: "America/Guayaquil" });
        const now = new Date(nowStr);
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const reservationsWithStatus = reservations.map((res: any) => {
            let status = 'expired';
            try {
                let resDate: Date;
                if (res.fecha instanceof Date) {
                    resDate = new Date(res.fecha.getFullYear(), res.fecha.getMonth(), res.fecha.getDate());
                } else {
                    const cleanDateStr = String(res.fecha).split('T')[0];
                    const parts = cleanDateStr.split('-');
                    resDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
                }

                if (resDate.getTime() > today.getTime()) {
                    status = 'active';
                } else if (resDate.getTime() === today.getTime()) {
                    if (res.hora_inicio >= now.getHours()) {
                        status = 'active';
                    }
                }
            } catch (e) {
                console.error("Date parse error", e);
            }

            return { ...res, estado: status };
        });

        res.json(reservationsWithStatus);
    } catch (error) {
        console.error('Get all reservations error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const cancelReservation = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    try {
        // Dynamic import to avoid circular dependency if any, or just consistent with above
        const deleted = await import('./db').then(m => m.deleteReservation(Number(id), userId));

        if (deleted) {
            res.json({ message: 'Reservation cancelled successfully' });
        } else {
            res.status(404).json({ error: 'Reservation not found or unauthorized' });
        }
    } catch (error) {
        console.error('Cancel booking error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const rescheduleReservation = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { fecha, hora_inicio } = req.body;

    if (!fecha || hora_inicio === undefined) {
        return res.status(400).json({ error: 'Missing fecha or hora_inicio parameters' });
    }

    // Timezone validation
    const nowStr = new Date().toLocaleString("en-US", { timeZone: "America/Guayaquil" });
    const now = new Date(nowStr);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const parts = fecha.split('-');
    const newDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));

    if (newDate.getTime() < today.getTime()) {
        return res.status(400).json({ error: 'No puedes reagendar una reserva hacia un día pasado.' });
    }
    
    if (newDate.getTime() === today.getTime() && Number(hora_inicio) <= now.getHours()) {
        return res.status(400).json({ error: 'No puedes reagendar para una hora que ya finalizó o está en curso.' });
    }

    try {
        const result = await import('./db').then(m => m.updateReservationTime(Number(id), fecha, Number(hora_inicio)));
        if (!result) {
            return res.status(404).json({ error: 'Reservation not found' });
        }
        res.json({ message: 'Reservation rescheduled successfully', reservation: result });
    } catch (error: any) {
        if (error.code === '23505') {
            return res.status(409).json({ error: 'El horario solicitado ya se encuentra ocupado.' });
        }
        console.error('Update booking error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const addLab = async (req: Request, res: Response) => {
    const validation = labSchema.safeParse(req.body);
    if (!validation.success) return res.status(400).json({ error: validation.error.errors });

    try {
        const newLab = await createLab(validation.data.nombre, validation.data.ubicacion, validation.data.capacidad, validation.data.estado);
        res.status(201).json(newLab);
    } catch (error) {
        console.error('Error creating lab:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const editLab = async (req: Request, res: Response) => {
    const { id } = req.params;
    const validation = labSchema.safeParse(req.body);
    if (!validation.success) return res.status(400).json({ error: validation.error.errors });

    try {
        const updated = await updateLab(Number(id), validation.data.nombre, validation.data.ubicacion, validation.data.capacidad, validation.data.estado);
        if (!updated) return res.status(404).json({ error: 'Lab not found' });
        res.json(updated);
    } catch (error) {
        console.error('Error updating lab:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const removeLab = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const deleted = await deleteLab(Number(id));
        if (!deleted) return res.status(404).json({ error: 'Lab not found' });
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting lab:', error);
        res.status(500).json({ error: 'No se puede eliminar un laboratorio con reservas existentes. Desactívelo.' });
    }
};
