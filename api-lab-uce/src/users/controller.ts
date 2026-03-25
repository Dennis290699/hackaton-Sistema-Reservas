import { Request, Response } from 'express';
import { getUsers, getUserById, createUser, updateUser, forcePasswordReset, Role } from './db';
import { z } from 'zod';

const userSchema = z.object({
    full_name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    email: z.string().email("Correo electrónico inválido"),
    role: z.enum(['admin', 'student']),
    estado: z.string().min(3),
});

const createUserSchema = userSchema.extend({
    password: z.string().min(6, "La contraseña requiere al menos 6 caracteres"),
});

const passwordResetSchema = z.object({
    password: z.string().min(6, "La contraseña requiere al menos 6 caracteres"),
});

export const listAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await getUsers();
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const getSingleUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const user = await getUserById(Number(id));
        if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json(user);
    } catch (error) {
        console.error('Error fetching single user:', error);
        res.status(500).json({ error: 'Error del servidor al recuperar perfil de usuario' });
    }
};

export const addUser = async (req: Request, res: Response) => {
    const validation = createUserSchema.safeParse(req.body);
    if (!validation.success) return res.status(400).json({ error: validation.error.errors[0].message });

    try {
        const newUser = await createUser(validation.data.full_name, validation.data.email, validation.data.password, validation.data.role as Role, validation.data.estado);
        res.status(201).json(newUser);
    } catch (error: any) {
        if (error.code === '23505') return res.status(409).json({ error: 'El correo electrónico ya está registrado en el sistema.' });
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Error intenrno al contactar con la base de datos' });
    }
};

export const editUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    const validation = userSchema.safeParse(req.body);
    if (!validation.success) return res.status(400).json({ error: validation.error.errors[0].message });

    try {
        const updated = await updateUser(Number(id), validation.data.full_name, validation.data.email, validation.data.role as Role, validation.data.estado);
        if (!updated) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json(updated);
    } catch (error: any) {
        if (error.code === '23505') return res.status(409).json({ error: 'El correo electrónico ya está siendo usado por otra persona.' });
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Error del servidor al actualizar' });
    }
};

export const changeUserPassword = async (req: Request, res: Response) => {
    const { id } = req.params;
    const validation = passwordResetSchema.safeParse(req.body);
    if (!validation.success) return res.status(400).json({ error: validation.error.errors[0].message });

    try {
        const success = await forcePasswordReset(Number(id), validation.data.password);
        if (!success) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json({ success: true, message: 'Contraseña actualizada exitosamente' });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ error: 'Error del servidor al forzar la contraseña' });
    }
};
