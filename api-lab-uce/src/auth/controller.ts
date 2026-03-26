import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getUserByEmail, createUser } from './db';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const registerSchema = z.object({
    full_name: z.string().min(3),
    email: z.string().email().endsWith('@uce.edu.ec', { message: "Must be a valid @uce.edu.ec email" }),
    password: z.string().min(6),
});

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body; // Changed username to email

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const user = await getUserByEmail(email);

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const match = await bcrypt.compare(password, user.password_hash);

        if (!match) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Block inactive accounts
        if (user.estado === 'inactivo') {
            return res.status(403).json({ error: 'Cuenta Inhabilitada. Contacte con el Administrador.' });
        }


        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token, role: user.role, full_name: user.full_name });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const adminLogin = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const user = await getUserByEmail(email);

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const match = await bcrypt.compare(password, user.password_hash);

        if (!match) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (user.estado === 'inactivo') {
            return res.status(403).json({ error: 'Cuenta Inhabilitada. Contacte con el Administrador.' });
        }

        if (user.role !== 'admin') {
            return res.status(403).json({ error: 'Acceso denegado. Solo administradores pueden acceder a este panel.' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token, role: user.role, full_name: user.full_name });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const register = async (req: Request, res: Response) => {
    const validation = registerSchema.safeParse(req.body);

    if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors });
    }

    const { full_name, email, password } = validation.data;

    try {
        const existing = await getUserByEmail(email);
        if (existing) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        const hash = await bcrypt.hash(password, 10);
        // Default role is 'student'
        const user = await createUser(full_name, email, hash, 'student');

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            role: user.role,
            token
        });
    } catch (e) {
        console.error('Register error:', e);
        res.status(500).json({ error: 'Failed to create user' });
    }
};
