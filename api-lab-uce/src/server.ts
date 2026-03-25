import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './db';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Configure CORS to only allow requests from specific origins
const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000', 'http://localhost:3001']; // Fallback for local dev

app.use(cors({
    origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Check explicit origins
        if (allowedOrigins.indexOf(origin) !== -1) {
            return callback(null, true);
        }

        // Allow Vercel preview deployments dynamically
        if (origin.endsWith('.vercel.app')) {
            return callback(null, true);
        }

        callback(new Error('Not allowed by CORS'));
    },
    credentials: true, // Allow sending cookies/authorization headers
}));
app.use(express.json());

app.get('/health', async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT NOW()');
        client.release();
        res.json({ status: 'ok', time: result.rows[0].now });
    } catch (error) {
        console.error('Database connection error:', error);
        res.status(500).json({ status: 'error', message: 'Database connection failed' });
    }
});

import authRoutes from './auth/routes';
import labsRoutes from './labs/routes';
import usersRoutes from './users/routes';
import settingsRoutes from './settings/routes';

app.use('/auth', authRoutes);
app.use('/labs', labsRoutes);
app.use('/users', usersRoutes);
app.use('/settings', settingsRoutes);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
