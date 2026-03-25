import { pool } from '../db';

export interface Lab {
    id: number;
    nombre: string;
    capacidad: number;
    estado?: string; // e.g., 'disponible', 'mantenimiento', 'inhabilitado'
}

export interface Reservation {
    id: number;
    lab_id: number;
    user_id: number;
    fecha: string; // ISO Date string
    hora_inicio: number;
    materia: string;
    creado_en: Date;
    user_nombre?: string;
    user_email?: string;
    lab_nombre?: string;
}

export const getLabs = async (): Promise<Lab[]> => {
    const result = await pool.query('SELECT * FROM laboratorios ORDER BY id ASC');
    return result.rows;
};

export const createLab = async (nombre: string, ubicacion: string, capacidad: number, estado: string): Promise<Lab> => {
    const result = await pool.query(
        'INSERT INTO laboratorios (nombre, ubicacion, capacidad, estado) VALUES ($1, $2, $3, $4) RETURNING *',
        [nombre, ubicacion, capacidad, estado]
    );
    return result.rows[0];
};

export const updateLab = async (id: number, nombre: string, ubicacion: string, capacidad: number, estado: string): Promise<Lab | null> => {
    const result = await pool.query(
        'UPDATE laboratorios SET nombre = $1, ubicacion = $2, capacidad = $3, estado = $4 WHERE id = $5 RETURNING *',
        [nombre, ubicacion, capacidad, estado, id]
    );
    return result.rows[0] || null;
};

export const deleteLab = async (id: number): Promise<boolean> => {
    const result = await pool.query('DELETE FROM laboratorios WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
};

export const getReservationsByDateAndLab = async (date: string, labId: number): Promise<Reservation[]> => {
    const result = await pool.query(
        'SELECT * FROM reservas WHERE fecha = $1 AND lab_id = $2',
        [date, labId]
    );
    return result.rows;
};

export const createReservations = async (
    labId: number,
    userId: number,
    date: string,
    hours: number[],
    subject: string
): Promise<Reservation[]> => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const reservations: Reservation[] = [];

        for (const hour of hours) {
            const result = await client.query(
                `INSERT INTO reservas (lab_id, user_id, fecha, hora_inicio, materia)
                 VALUES ($1, $2, $3, $4, $5)
                 RETURNING *`,
                [labId, userId, date, hour, subject]
            );
            reservations.push(result.rows[0]);
        }

        await client.query('COMMIT');
        return reservations;
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
};

export const getReservationsByUser = async (userId: number): Promise<Reservation[]> => {
    const result = await pool.query(
        `SELECT r.id, r.lab_id, r.user_id, TO_CHAR(r.fecha, 'YYYY-MM-DD') as fecha, r.hora_inicio, r.materia, r.creado_en, l.nombre as lab_nombre 
         FROM reservas r 
         JOIN laboratorios l ON r.lab_id = l.id 
         WHERE r.user_id = $1 
         ORDER BY r.fecha DESC, r.hora_inicio ASC`,
        [userId]
    );
    return result.rows;
};

export const getAllReservations = async (): Promise<Reservation[]> => {
    const result = await pool.query(
        `SELECT r.id, r.lab_id, r.user_id, TO_CHAR(r.fecha, 'YYYY-MM-DD') as fecha, r.hora_inicio, r.materia, r.creado_en, l.nombre as lab_nombre, u.full_name as user_nombre, u.email as user_email 
         FROM reservas r 
         JOIN laboratorios l ON r.lab_id = l.id 
         JOIN users u ON r.user_id = u.id
         ORDER BY r.fecha DESC, r.hora_inicio ASC`
    );
    return result.rows;
};

export const updateReservationTime = async (id: number, fecha: string, hora_inicio: number): Promise<Reservation | null> => {
    const result = await pool.query(
        'UPDATE reservas SET fecha = $1, hora_inicio = $2 WHERE id = $3 RETURNING *',
        [fecha, hora_inicio, id]
    );
    return result.rows[0] || null;
};

export const deleteReservation = async (id: number, userId: number): Promise<boolean> => {
    const result = await pool.query(
        'DELETE FROM reservas WHERE id = $1 AND user_id = $2 RETURNING id',
        [id, userId]
    );
    return (result.rowCount ?? 0) > 0;
};
