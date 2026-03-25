import { pool } from '../db';
import bcrypt from 'bcrypt';

export type Role = 'admin' | 'student';

export interface UserDTO {
    id: number;
    full_name: string;
    email: string;
    role: Role;
    estado?: string;
}

export const getUsers = async (): Promise<UserDTO[]> => {
    const result = await pool.query('SELECT id, full_name, email, role, estado FROM users ORDER BY id ASC');
    return result.rows;
};

export const getUserById = async (id: number): Promise<UserDTO | null> => {
    const result = await pool.query('SELECT id, full_name, email, role, estado FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
};

export const createUser = async (full_name: string, email: string, password_raw: string, role: Role, estado: string): Promise<UserDTO> => {
    const password_hash = await bcrypt.hash(password_raw, 10);
    const result = await pool.query(
        'INSERT INTO users (full_name, email, password_hash, role, estado) VALUES ($1, $2, $3, $4, $5) RETURNING id, full_name, email, role, estado',
        [full_name, email, password_hash, role, estado]
    );
    return result.rows[0];
};

export const updateUser = async (id: number, full_name: string, email: string, role: Role, estado: string): Promise<UserDTO | null> => {
    const result = await pool.query(
        'UPDATE users SET full_name = $1, email = $2, role = $3, estado = $4 WHERE id = $5 RETURNING id, full_name, email, role, estado',
        [full_name, email, role, estado, id]
    );
    return result.rows[0] || null;
};

export const forcePasswordReset = async (id: number, password_raw: string): Promise<boolean> => {
    const password_hash = await bcrypt.hash(password_raw, 10);
    const result = await pool.query(
        'UPDATE users SET password_hash = $1 WHERE id = $2',
        [password_hash, id]
    );
    return (result.rowCount ?? 0) > 0;
};
