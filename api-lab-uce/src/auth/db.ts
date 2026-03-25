import { pool } from '../db';


export type Role = 'admin' | 'student';

export interface User {
    id: number;
    full_name: string;
    email: string;
    password_hash: string;
    role: Role;
    estado?: string;
}

export const getUserByEmail = async (email: string): Promise<User | null> => {
    const result = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
    );
    return result.rows[0] || null;
};

export const createUser = async (fullName: string, email: string, passwordHash: string, role: Role = 'student'): Promise<User> => {
    const result = await pool.query(
        'INSERT INTO users (full_name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING *',
        [fullName, email, passwordHash, role]
    );
    return result.rows[0];
};

// Legacy support or alias
export const getAdminByUsername = async (username: string) => {
    // We treat username as email for admins in legacy call, or just look up by email
    // For now let's deprecate this or map it.
    // If the old code passes "username", we assume it's an email/username.
    // In our migration we mapped username to email (username@admin.local)
    // So let's try to find by email OR simple username match if we kept username column?
    // We dropped username column in users table design. 
    // Let's assume login now requires email.
    return getUserByEmail(username);
};
