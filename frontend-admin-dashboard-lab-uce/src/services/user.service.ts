import { api } from './api';

export interface User {
    id: number;
    full_name: string;
    email: string;
    role: 'admin' | 'student';
    estado: string;
}

class UserServiceFacade {
    /**
     * Retrieves all users.
     * GET /users
     */
    async listUsers(): Promise<User[]> {
        return api.get<User[]>('/users');
    }

    /**
     * Retrieves a single user profile.
     * GET /users/:id
     */
    async getUser(id: number): Promise<User> {
        return api.get<User>(`/users/${id}`);
    }

    /**
     * Create a new user.
     * POST /users
     */
    async createUser(data: Partial<User> & { password?: string }): Promise<User> {
        return api.post<User>('/users', data);
    }

    /**
     * Update an existing user's details.
     * PUT /users/:id
     */
    async updateUser(id: number, data: Partial<User>): Promise<User> {
        return api.put<User>(`/users/${id}`, data);
    }

    /**
     * Force a password reset for a user.
     * PUT /users/:id/password
     */
    async updatePassword(id: number, password: string): Promise<{ success: boolean; message: string }> {
        return api.put<{ success: boolean; message: string }>(`/users/${id}/password`, { password });
    }
}

export const UserService = new UserServiceFacade();
